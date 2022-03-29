from http import HTTPStatus

import pytest
from flask.testing import FlaskClient

from api.database import TrainedModel, TrainTaskModel, UserModel, db


@pytest.fixture()
def trained_model(authorized_user: UserModel):
    task = TrainTaskModel(hparams="{}", user=authorized_user, dataset_id=0)
    with open("embeddings.txt", "rb") as file:
        model = TrainedModel(data=file.read(), task=task)
    db.session.add_all([task, model])
    db.session.commit()
    return model


class TestMostSimilar:
    def test_word_in_vocab(
        self, client: FlaskClient, auth_headers: dict, trained_model: TrainedModel
    ):
        """
        Can get most similar words to word in vocab
        """
        response = client.get(
            f"/verify/most-similar?trained_model_id={trained_model.id}&word=bone",
            headers=auth_headers,
        )
        assert response.status_code == HTTPStatus.OK
        assert len(response.json) == 100

    def test_word_not_in_vocab(
        self, client: FlaskClient, auth_headers: dict, trained_model: TrainedModel
    ):
        """
        Returns no results if word is not in vocab
        """
        response = client.get(
            f"/verify/most-similar?trained_model_id={trained_model.id}&word=asdf",
            headers=auth_headers,
        )
        assert response.status_code == HTTPStatus.OK
        assert len(response.json) == 0


class TestAnalogyTest:
    def test_words_in_vocab(
        self, client: FlaskClient, auth_headers: dict, trained_model: TrainedModel
    ):
        """
        Can perform analogy test with all words in vocab
        """
        response = client.get(
            f"/verify/analogy-test?trained_model_id={trained_model.id}"
            "&word_a=bone&word_b=bone_marrow&word_c=eye",
            headers=auth_headers,
        )
        assert response.status_code == HTTPStatus.OK
        assert len(response.json) == 500

    def test_words_not_in_vocab(
        self, client: FlaskClient, auth_headers: dict, trained_model: TrainedModel
    ):
        """
        Analogy testing results no results if word(s) not in vocab
        """
        response = client.get(
            f"/verify/analogy-test?trained_model_id={trained_model.id}"
            "&word_a=bone&word_b=bone_marrow&word_c=asdf",
            headers=auth_headers,
        )
        assert response.status_code == HTTPStatus.OK
        assert len(response.json) == 0
