import json
from datetime import datetime
from http import HTTPStatus
from pathlib import Path
from tempfile import NamedTemporaryFile
from unittest.mock import MagicMock

import pytest
from flask.testing import FlaskClient

from api.database import (
    DatasetModel,
    DatasetPaperModel,
    NgramModel,
    PaperModel,
    TrainTaskModel,
    UserModel,
    db,
)
from api.workers import trainer

DATA_PATH = Path(__file__).parent / "data"


TEXT = """
Aliqua incididunt officia magna laboris in qui excepteur adipisicing incididunt consectetur sunt et est. Non enim qui mollit enim sit eu nulla tempor deserunt aliqua dolore. Commodo sunt laborum ex Lorem do esse qui occaecat enim. Magna enim magna proident Lorem esse laboris labore ea enim proident quis ex deserunt. Deserunt proident consequat reprehenderit labore cupidatat officia tempor. Cillum quis irure laborum labore dolor est consectetur incididunt excepteur duis tempor aliquip magna sint.

Occaecat occaecat culpa laborum et in dolore elit ea ipsum mollit Lorem in veniam. Sint elit ea sunt Lorem ut aliqua minim officia mollit ipsum ea esse commodo. Magna culpa commodo veniam anim. Nulla magna aute non deserunt mollit. Fugiat voluptate voluptate velit amet et sint adipisicing enim mollit eu id. Non id labore do voluptate qui labore culpa ut eiusmod nulla reprehenderit voluptate eu ipsum.

Occaecat officia ea nulla consectetur ad. Laboris nostrud laborum sint incididunt cupidatat exercitation cupidatat Lorem quis ullamco anim aliqua in. Anim velit reprehenderit dolore occaecat anim. Incididunt sint laboris aute et laborum. Aute Lorem ex velit velit veniam occaecat exercitation. Aliqua irure ullamco adipisicing consectetur nulla occaecat dolore.

Lorem ex duis amet sunt exercitation. Dolore adipisicing Lorem non ullamco exercitation ut. Enim pariatur ullamco dolor aliqua est nulla consequat quis est anim aliquip.

Aute aliquip id est eu adipisicing velit est enim qui laborum. In duis commodo aliqua ad incididunt. Voluptate aliqua officia laboris pariatur eiusmod commodo ut laborum exercitation esse. Eiusmod enim ea dolore ut laborum minim id nulla mollit incididunt aliquip esse adipisicing. Reprehenderit ex consequat ad labore sint mollit sint id irure ad elit exercitation velit ipsum.

Lorem excepteur cupidatat tempor aliqua. Et ut officia laborum consectetur nulla fugiat do ea amet nisi. Incididunt incididunt incididunt aliquip amet. Sint esse sunt aliquip officia ea aliquip veniam velit eu anim laboris sint. Laborum laboris adipisicing nisi veniam nulla enim in in dolor culpa dolor. Consequat adipisicing duis sunt labore aute id Lorem. Consectetur laborum ad ea exercitation reprehenderit minim dolor enim pariatur in mollit proident.
"""


def make_ngrams(doc: PaperModel, text: str):
    tokens = text.split()
    ngrams = []
    for ngram_length in range(1, 6):
        for i in range(len(tokens)):
            ngram = tokens[i : i + ngram_length]
            if len(ngram) < ngram_length:
                continue
            ngram = " ".join(ngram)
            ngrams.append(ngram)

    ngram_counts = {}
    for ngram in ngrams:
        if ngram not in ngram_counts:
            ngram_counts[ngram] = 0
        ngram_counts[ngram] += 1

    models: list[NgramModel] = []
    for ngram, count in ngram_counts.items():
        model = NgramModel(
            dkey=doc.dkey,
            ngram=ngram,
            ngram_lc=ngram.lower(),
            ngram_tokens=len(ngram.split()),
            ngram_count=count,
            term_freq=1.0,
            doc_count=1,
        )
        models.append(model)
    return models


@pytest.fixture()
def dataset(authorized_user: UserModel):
    paper1 = PaperModel(
        dkey="doc1",
        meta_doi="doi",
        doi="doi",
        doc_doi="doi",
        doc_pub_date=datetime.utcnow(),
        pub_date=datetime.utcnow(),
        meta_pub_date=datetime.utcnow(),
        doc_authors="authors",
        meta_authors="authors",
        author="author",
        doc_title="title",
        meta_title="title",
        title="title",
    )
    paper2 = PaperModel(
        dkey="doc2",
        meta_doi="doi",
        doi="doi",
        doc_doi="doi",
        doc_pub_date=datetime.utcnow(),
        pub_date=datetime.utcnow(),
        meta_pub_date=datetime.utcnow(),
        doc_authors="authors",
        meta_authors="authors",
        author="author",
        doc_title="title",
        meta_title="title",
        title="title",
    )
    paper1_ngrams = make_ngrams(paper1, TEXT.strip())
    paper2_ngrams = make_ngrams(paper2, TEXT.strip())

    dataset_ = DatasetModel(keywords="back pain", user=authorized_user)

    db.session.add_all([paper1, paper2, *paper1_ngrams, *paper2_ngrams, dataset_])
    db.session.flush()
    db.session.add(DatasetPaperModel(dataset_id=dataset_.id, dkey="doc1"))
    db.session.commit()
    return dataset_


@pytest.fixture()
def train_task(dataset: DatasetModel, hparams: dict):
    task = TrainTaskModel(hparams=json.dumps(hparams), dataset=dataset)
    db.session.add(task)
    db.session.commit()
    return task


@pytest.fixture()
def hparams():
    return {
        "embedding_size": 200,
        "epochs_to_train": 1,
        "learning_rate": 0.025,
        "num_neg_samples": 25,
        "batch_size": 500,
        "concurrent_steps": 12,
        "window_size": 5,
        "min_count": 1,
        "subsample": 1e-3,
    }


class TestTrainTask:
    def test_post(
        self,
        client: FlaskClient,
        dataset: DatasetModel,
        hparams: dict,
        auth_headers: dict,
    ):
        """
        Posting to /train-task creates and returns a task from the given dataset
        """
        response = client.post(
            "/train-task",
            json={"dataset_id": dataset.id, "hparams": hparams},
            headers=auth_headers,
        )
        assert response.status_code == HTTPStatus.CREATED
        assert response.json["hparams"] == json.dumps(hparams, sort_keys=True)
        assert response.json["created"] is not None
        assert response.json["start_time"] is None
        assert response.json["end_time"] is None

        task = (
            db.session.query(TrainTaskModel)
            .filter_by(id=response.json["id"])
            .one_or_none()
        )
        assert task is not None
        assert task.dataset == dataset

    def test_list(
        self,
        client: FlaskClient,
        train_task: TrainTaskModel,
        auth_headers: dict,
    ):
        """
        Can list train tasks and filter by dataset
        """
        response = client.get("/train-task", headers=auth_headers)
        assert response.status_code == HTTPStatus.OK
        assert len(response.json) == 1

        response = client.get(
            f"/train-task?dataset_id={train_task.dataset_id}", headers=auth_headers
        )
        assert response.status_code == HTTPStatus.OK
        assert len(response.json) == 1

        response = client.get(
            f"/train-task?dataset_id={train_task.dataset_id+1}", headers=auth_headers
        )
        assert response.status_code == HTTPStatus.OK
        assert len(response.json) == 0

    def test_get(
        self, client: FlaskClient, train_task: TrainTaskModel, auth_headers: dict
    ):
        """
        Can get a single train task by id
        """
        response = client.get(f"/train-task/{train_task.id}", headers=auth_headers)
        assert response.status_code == HTTPStatus.OK
        assert response.is_json

        response = client.get(f"/train-task/{train_task.id+1}", headers=auth_headers)
        assert response.status_code == HTTPStatus.NOT_FOUND


class TestTrainer:
    def test_write_corpus(self, dataset: DatasetModel):
        with NamedTemporaryFile() as file:
            trainer.write_corpus(db.session, dataset, Path(file.name))
            db.session.commit()
            assert file.read().decode().splitlines()[:2] == ["aliqua\t2", "incididunt\t7"]

    def test_read_embeddings(self, dataset: DatasetModel, hparams: dict):
        task = TrainTaskModel(hparams=json.dumps(hparams), dataset=dataset)
        db.session.add(task)
        db.session.commit()

        with NamedTemporaryFile("wb") as file:
            file.write(b"hello world")
            file.flush()
            trainer.read_embeddings(db.session, task, Path(file.name))
        db.session.commit()
        assert len(task.models) == 1
        assert task.models[0].data == b"hello world"

    def test_tick(self, dataset: DatasetModel, hparams: dict):
        task = TrainTaskModel(hparams=json.dumps(hparams), dataset=dataset)
        db.session.add(task)
        db.session.commit()

        trainer.tick(db.session)

        assert len(task.models) == 1
        assert task.end_time is not None

    def test_tick_failed(self, dataset: DatasetModel, hparams: dict, monkeypatch):
        task = TrainTaskModel(hparams=json.dumps(hparams), dataset=dataset)
        db.session.add(task)
        db.session.commit()

        word2vec_wrapper = MagicMock()
        word2vec_wrapper.train.side_effect = RuntimeError("error")
        monkeypatch.setattr(trainer, "word2vec_wrapper", word2vec_wrapper)

        with pytest.raises(RuntimeError):
            trainer.tick(db.session)

        assert len(task.models) == 0
        assert task.end_time is not None
