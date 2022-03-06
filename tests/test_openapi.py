from http import HTTPStatus

from flask.testing import FlaskClient


def test_json(client: FlaskClient):
    response = client.get("/api-spec.json")
    assert response.status_code == HTTPStatus.OK
    assert response.is_json


def test_redoc(client: FlaskClient):
    response = client.get("/redoc")
    assert response.status_code == HTTPStatus.OK
    assert response.mimetype == "text/html"


def test_swagger_ui(client: FlaskClient):
    response = client.get("/swagger-ui")
    assert response.status_code == HTTPStatus.OK
    assert response.mimetype == "text/html"


def test_rapidoc(client: FlaskClient):
    response = client.get("/rapidoc")
    assert response.status_code == HTTPStatus.OK
    assert response.mimetype == "text/html"
