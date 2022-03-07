import secrets
from datetime import datetime, timedelta
from http import HTTPStatus

from flask import Flask, g, request
from flask.wrappers import Request, Response
from flask_smorest import abort

from api.database import SessionModel, UserModel, db

SESSION_TIMEOUT = timedelta(hours=1)


def get_token(request_: Request):
    if "Authorization" not in request_.headers:
        return None
    authorization: str | None = request_.headers["Authorization"]
    if authorization is None:
        return None
    if not authorization.startswith("Bearer "):
        return None
    return authorization[len("Bearer ") :]


class Auth:
    def __init__(self, app: Flask | None = None):
        self.exclude_endpoints = []
        if app is not None:
            self.init_app(app)

    def init_app(self, app: Flask):
        app.before_request(self._before_request)
        app.after_request(self._after_request)
        self.exclude_endpoints = app.config.get("AUTH_EXCLUDE_ENDPOINTS", [])

    def _before_request(self):
        if request.method == "OPTIONS":
            return
        if request.endpoint is None:
            return
        if request.endpoint in self.exclude_endpoints:
            return

        token = get_token(request)
        if token is None:
            abort(HTTPStatus.UNAUTHORIZED)
        session: SessionModel = (
            db.session.query(SessionModel).filter_by(token=token).one_or_none()
        )
        if session is None:
            abort(HTTPStatus.UNAUTHORIZED)
        if (datetime.utcnow() - session.last_refresh) > SESSION_TIMEOUT:
            db.session.delete(session)
            db.session.commit()
            abort(HTTPStatus.UNAUTHORIZED)

        session.last_refresh = datetime.utcnow()
        g.session = session

    def _after_request(self, response: Response):
        if "session" in g:
            g.pop("session")
        return response

    @property
    def authenticated(self):
        return "session" in g

    @property
    def session(self) -> SessionModel:
        return g.session

    @property
    def user(self) -> UserModel:
        return self.session.user

    def add_session(self, user: UserModel):
        assert "session" not in g
        assert user.session is None
        token = secrets.token_hex(nbytes=32)
        session = SessionModel(token=token, user=user)
        db.session.add(session)
        db.session.commit()
        g.session = session
        return session

    def remove_session(self):
        if "session" in g:
            db.session.delete(g.session)
            db.session.commit()
            g.pop("session")

    def refresh_session(self):
        assert "session" in g
        user = self.user
        self.remove_session()
        return self.add_session(user)


auth = Auth()
