import importlib.resources
import shutil
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Any

import docker
from logzero import logger

client = docker.from_env()


def train(input_filename: Path, output_filename: Path, hparams: dict[str, Any]):
    hparam_args = []
    for name, value in hparams.items():
        hparam_args.append(f"--{name}")
        hparam_args.append(value)

    with TemporaryDirectory() as tempdir:
        image_path = importlib.resources.files(__name__) / "data/word2vec-image.tar"
        with image_path.open("rb") as image_file:
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
