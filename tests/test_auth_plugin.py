from http import HTTPStatus

import pytest
from flask import Flask
from flask.testing import FlaskClient
from flask_cors import CORS

from api.authentication import Auth


@pytest.fixture()
def simple_client():
    app = Flask(__name__)
    app.config.update({"TESTING": True})
    CORS(app)
    Auth(app)

    @app.route("/hello", methods=["GET"])
    def endpoint():
        return "hello world"

    return app.test_client()


class TestAuth:
    """
    Some simple tests for the Auth flask plugin; the rest is covered in the
    /auth endpoints tests.
    """

    def test_options_request(self, simple_client: FlaskClient):
        """
        OPTIONS requests do not need to be authenticated
        """
        # Sanity check to ensure endpoint needs authentication
        response = simple_client.get("/hello")
        assert response.status_code == HTTPStatus.UNAUTHORIZED

        response = simple_client.options("/hello")
        assert response.status_code == HTTPStatus.OK
        assert set(response.allow) == {"GET", "HEAD", "OPTIONS"}

    def test_404_response(self, simple_client: FlaskClient):
        """
        If a request has no endpoint it should return 404 instead of 401
        """
        response = simple_client.get("/missing/endpoint")
        assert response.status_code == HTTPStatus.NOT_FOUND
