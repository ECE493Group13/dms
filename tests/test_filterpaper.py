from datetime import datetime
from http import HTTPStatus

import pytest
from flask.testing import FlaskClient

from api.database import KeywordsModel, db


@pytest.fixture(autouse=True)
def keywords(client: FlaskClient):
    with client.application.app_context():
        db.session.add(
            KeywordsModel(
                dkey="1",
                keywords="hello world",
                keywords_lc="hello world",
                keyword_tokens=2,
                doc_count=1,
                insert_date=datetime.utcnow(),
            )
        )
        db.session.add(
            KeywordsModel(
                dkey="2",
                keywords="goodbye world",
                keywords_lc="goodbye world",
                keyword_tokens=2,
                doc_count=1,
                insert_date=datetime.utcnow(),
            )
        )
        db.session.commit()


class TestFilterpaper:
    def test_single_word(self, client: FlaskClient):
        response = client.post("/filterpaper", json={"keywords": ["hello world"]})
        assert response.status_code == HTTPStatus.OK
        assert len(response.json) == 1
        assert response.json[0]["keywords"] == "hello world"

    def test_partial_match(self, client: FlaskClient):
        response = client.post("/filterpaper", json={"keywords": ["world"]})
        assert response.status_code == HTTPStatus.OK
        assert len(response.json) == 0
