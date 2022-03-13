import json
from datetime import datetime
from http import HTTPStatus
from pathlib import Path

import pytest
from flask.testing import FlaskClient

from api.database import (
    DatasetModel,
    DatasetPaperModel,
    PaperModel,
    TrainTaskModel,
    UserModel,
    db,
)

DATA_PATH = Path(__file__).parent / "data"


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
    dataset_ = DatasetModel(keywords="back pain", user=authorized_user)

    db.session.add_all([paper1, paper2, dataset_])
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
        "epochs_to_train": 15,
        "learning_rate": 0.025,
        "num_neg_samples": 25,
        "batch_size": 500,
        "concurrent_steps": 12,
        "window_size": 5,
        "min_count": 5,
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
