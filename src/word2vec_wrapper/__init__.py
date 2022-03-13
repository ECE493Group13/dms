import contextlib
import importlib.resources
import shutil
from importlib.abc import Traversable
from pathlib import Path
from tempfile import NamedTemporaryFile, TemporaryDirectory
from typing import Any

import docker
from logzero import logger

client = docker.from_env()

CONFIG_PATH = Path("~/.config/word2vec_wrapper/").expanduser()
CONFIG_PATH.mkdir(exist_ok=True)


def copy_resource(src: Traversable, dst: Path):
    dst.mkdir(exist_ok=True)
    if src.is_file():
        logger.info(f"COPY {src} -> {dst / src.name}")
        with open(dst / src.name, "wb") as dst_file:
            dst_file.write(src.read_bytes())
    elif src.is_dir():
        for next_src in src.iterdir():
            copy_resource(next_src, dst / src.name)


@contextlib.contextmanager
def resource_dir(package: str, path: str):
    with TemporaryDirectory() as tempdir:
        copy_resource(importlib.resources.files(package) / path, Path(tempdir))
        yield Path(tempdir) / Path(path).name


@contextlib.contextmanager
def resource_file(package: str, path: str):
    with NamedTemporaryFile("wb") as tempfile:
        resource = importlib.resources.files(package) / path
        logger.info(f"COPY {resource} -> {tempfile.name}")
        tempfile.write(resource.read_bytes())
        tempfile.flush()
        yield Path(tempfile.name)


@contextlib.contextmanager
def atomic_write(path: Path, mode: str):
    with TemporaryDirectory() as tempdir:
        tempfile_path = Path(tempdir) / path.name
        with open(tempfile_path, mode) as tempfile:
            yield tempfile
        path.unlink(missing_ok=True)
        tempfile_path.rename(path)


def make_image(image_path: Path):
    with resource_dir(__name__, "ngram-word2vec") as word2vec_dir:
        with resource_file(__name__, "word2vec.Dockerfile") as dockerfile_path:
            logger.info(f"Build docker image from context {word2vec_dir}")
            result: Any = client.images.build(
                path=str(word2vec_dir),
                dockerfile=dockerfile_path.absolute(),
            )
            (image, _) = result
    logger.info(f"Save docker image to {image_path}")

    with atomic_write(image_path, "wb") as file:
        for chunk in image.save():
            file.write(chunk)


@contextlib.contextmanager
def open_image():
    image_path = CONFIG_PATH / "image.tar"
    if not image_path.exists():
        logger.warning("Docker image does not exist; attempting to create it.")
        make_image(image_path)

    with image_path.open("rb") as file:
        yield file


def train(input_filename: Path, output_filename: Path, hparams: dict[str, Any]):
    hparam_args = []
    for name, value in hparams.items():
        hparam_args.append(f"--{name}")
        hparam_args.append(str(value))

    with TemporaryDirectory() as tempdir:
        with open_image() as image_file:
            (image,) = client.images.load(image_file)
        log_stream = client.containers.run(
            image,
            [
                "python",
                "word2vec_optimized.py",
                "--train_data",
                f"/data/train/{input_filename.name}",
                "--eval_data",
                "/app/word2vec/word2vec/trunk/questions-words.txt",
                "--save_path",
                "/data/save",
                *hparam_args,
            ],
            volumes={
                str(input_filename.parent.absolute()): {
                    "bind": "/data/train",
                    "mode": "ro",
                },
                tempdir: {"bind": "/data/save", "mode": "rw"},
            },
            stream=True,
            stdout=True,
            stderr=True,
        )
        for line in log_stream:
            logger.info(line.decode().strip())

        temp_output_filename = next(
            child for child in Path(tempdir).iterdir() if "embeddings_" in child.name
        )
        shutil.move(temp_output_filename, output_filename)
