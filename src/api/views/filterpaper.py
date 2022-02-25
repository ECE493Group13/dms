from http import HTTPStatus

from flask.views import MethodView
from flask_smorest import Blueprint
from marshmallow import Schema, fields
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

from api.database import KeywordsModel

blueprint = Blueprint("filterpaper", "filterpaper", url_prefix="/filterpaper")


class KeywordsSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = KeywordsModel


class FilterPaperQueryArgsSchema(Schema):
    keywords = fields.List(fields.Str())


@blueprint.route("")
class FilterPaper(MethodView):
    @blueprint.arguments(FilterPaperQueryArgsSchema, location="json")
    @blueprint.response(HTTPStatus.OK, KeywordsSchema(many=True))
    def post(self, args: dict):
        keywords: str = args["keywords"]
        keywords = [keyword.lower() for keyword in keywords]
        result = KeywordsModel.query.filter(
            KeywordsModel.keywords_lc.in_(keywords)
        ).all()
        return result
