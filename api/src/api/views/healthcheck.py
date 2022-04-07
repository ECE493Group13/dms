"""
Adds a healthcheck endpoint which is useful in debugging the API.

Functional requirements: No functional requirements mandate the inclusion of this file
"""

from http import HTTPStatus

from flask.views import MethodView
from flask_smorest import Blueprint
from marshmallow import Schema, fields

blueprint = Blueprint("healthcheck", "healthcheck", url_prefix="/health")


class HealthcheckSchema(Schema):
    message = fields.Str()


@blueprint.route("")
class Healthcheck(MethodView):
    @blueprint.response(HTTPStatus.OK, HealthcheckSchema)
    def get(self):
        return {"message": "API is functional."}
