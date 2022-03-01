import pytest

from api import app
from api.database import db


@pytest.fixture()
def client():
    app.config.update({"TESTING": True})
    app.config.update({"SQLALCHEMY_DATABASE_URI": "sqlite://"})

    test_client = app.test_client()

    with test_client.application.app_context():
        db.engine.execute("attach ':memory:' as docs")
        db.Model.metadata.create_all(db.engine)

    yield test_client

    with test_client.application.app_context():
        db.Model.metadata.drop_all(db.engine)
        db.engine.execute("detach docs")
