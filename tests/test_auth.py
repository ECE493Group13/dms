from datetime import datetime, timedelta
from http import HTTPStatus

import argon2
import pytest
from flask.testing import FlaskClient
from freezegun import freeze_time
from sqlalchemy.orm.session import Session

from api.authentication import SESSION_TIMEOUT
from api.database import SessionModel, UserModel, db

ph = argon2.PasswordHasher()


class TestLogin:
    def test_success(self, client: FlaskClient, user: UserModel):
        """
        Logging in should create a session in the db
        """
        response = client.post(
            "/auth/login", json={"username": "example", "password": "password"}
        )
        assert response.status_code == HTTPStatus.OK
        assert "token" in response.json
        assert user.session is not None
        assert user.session.token == response.json["token"]
        assert "is_temp_password" in response.json
        assert response.json["is_temp_password"] is False

    def test_wrong_name(self, client: FlaskClient, user: UserModel):
        response = client.post(
            "/auth/login", json={"username": "wrong", "password": "password"}
        )
        assert response.status_code == HTTPStatus.UNAUTHORIZED
        assert "token" not in response.json
        assert user.session is None

    def test_wrong_password(self, client: FlaskClient, user: UserModel):
        response = client.post(
            "/auth/login", json={"username": "example", "password": "wrong"}
        )
        assert response.status_code == HTTPStatus.UNAUTHORIZED
        assert "token" not in response.json
        assert user.session is None

    def test_invalid_hash(self, client: FlaskClient, user: UserModel):
        user.password = "hello"
        db.session.commit()
        with pytest.raises(argon2.exceptions.InvalidHash):
            client.post(
                "/auth/login", json={"username": "example", "password": "password"}
            )


class TestLogout:
    def test_success(self, client: FlaskClient, auth_headers: dict):
        """
        Logging out should delete the session from the db
        """
        response = client.post("/auth/logout", headers=auth_headers)
        assert response.status_code == HTTPStatus.NO_CONTENT
        assert db.session.query(SessionModel).count() == 0


class TestSession:
    def test_session(self, client: FlaskClient, user: UserModel):
        """
        Token should authorize user after login
        """
        response = client.post(
            "/auth/login", json={"username": "example", "password": "password"}
        )
        assert response.status_code == HTTPStatus.OK
        token = response.json["token"]
        response = client.post(
            "/auth/logout", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == HTTPStatus.NO_CONTENT

    def test_session_wrong_token(self, client: FlaskClient, user: UserModel):
        """
        Wrong token should not authorize user
        """
        response = client.post(
            "/auth/login", json={"username": "example", "password": "password"}
        )
        assert response.status_code == HTTPStatus.OK
        response = client.post(
            "/auth/logout", headers={"Authorization": "Bearer wrong-token"}
        )
        assert response.status_code == HTTPStatus.UNAUTHORIZED

    def test_session_expired(self, client: FlaskClient, user: UserModel):
        """
        Token should fail to authorize user after it expires
        """
        with freeze_time(datetime.utcnow()) as frozen_time:
            response = client.post(
                "/auth/login", json={"username": "example", "password": "password"}
            )
            assert response.status_code == HTTPStatus.OK
            token = response.json["token"]

            frozen_time.tick(SESSION_TIMEOUT)
            frozen_time.tick(timedelta(seconds=1))

            response = client.post(
                "/auth/logout", headers={"Authorization": f"Bearer {token}"}
            )
            assert response.status_code == HTTPStatus.UNAUTHORIZED


class TestUpdatePassword:
    def test_success(
        self, client: FlaskClient, authorized_user: UserModel, auth_headers: dict
    ):
        """
        Password updates should update the password in the db and refresh
        session token.
        """
        old_password = "password"
        old_password_hash = authorized_user.password
        assert ph.verify(old_password_hash, old_password)

        new_password = "new-password"

        response = client.post(
            "/auth/update-password",
            json={"old_password": old_password, "new_password": new_password},
            headers=auth_headers,
        )
        assert response.status_code == HTTPStatus.OK
        new_password_hash = authorized_user.password
        assert ph.verify(new_password_hash, new_password)
        assert "token" in response.json

    def test_temp_password(
        self, client: FlaskClient, authorized_user: UserModel, auth_headers: dict
    ):
        """
        User.is_temp_password should be set to False after password change
        """
        authorized_user.is_temp_password = True
        Session.object_session(authorized_user).commit()

        old_password = "password"
        old_password_hash = authorized_user.password
        assert ph.verify(old_password_hash, old_password)

        new_password = "new-password"

        response = client.post(
            "/auth/update-password",
            json={"old_password": old_password, "new_password": new_password},
            headers=auth_headers,
        )
        assert response.status_code == HTTPStatus.OK
        assert authorized_user.is_temp_password is False

    def test_wrong_old_password(
        self, client: FlaskClient, authorized_user: UserModel, auth_headers: dict
    ):
        """
        Password update does nothing if old password does not match
        """
        old_password = "password"
        old_password_hash = authorized_user.password
        assert ph.verify(old_password_hash, old_password)

        new_password = "new-password"

        response = client.post(
            "/auth/update-password",
            json={"old_password": "wrong-password", "new_password": new_password},
            headers=auth_headers,
        )
        assert response.status_code == HTTPStatus.UNAUTHORIZED
        new_password_hash = authorized_user.password
        assert ph.verify(new_password_hash, old_password)
