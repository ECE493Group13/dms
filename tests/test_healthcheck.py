"""
Tests for the healthcheck endpoint (see healthcheck.py).

Functional requirements: No functional requirements mandate the inclusion of this file
"""

from http import HTTPStatus

from flask.testing import FlaskClient


def test_healthcheck(client: FlaskClient):
    response = client.get("/health")
    assert response.status_code == HTTPStatus.OK
    assert response.json == {"message": "API is functional."}
