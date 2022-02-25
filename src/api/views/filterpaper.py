from ast import keyword
from http import HTTPStatus
from sre_constants import SUCCESS

from flask.views import MethodView
from flask_smorest import Blueprint, abort
from marshmallow import Schema, fields

from api.database import KeywordsModel


blueprint = Blueprint("filterpaper", "filterpaper", url_prefix="/filter")

class KeywordsTable(Schema):
    dkey = fields.String()
    keywords = fields.String()
    keywords_lc = fields.String()
    keyword_tokens = fields.Integer()
    keyword_score = fields.Float()
    doc_count = fields.Integer()
    insert_date = fields.Date()

class FilterPaperQueryArgsSchema(Schema):
    keywords = fields.String()

class FilterPaperResultSchema(Schema):
    success = fields.Boolean()
    result = fields.List(fields.Nested(KeywordsTable))


@blueprint.route("")
class FilterPaper(MethodView):
    @blueprint.arguments(FilterPaperQueryArgsSchema, location="json")
    @blueprint.response(HTTPStatus.OK, FilterPaperResultSchema)
    def post(self, args: dict):
        keywords: str = args["keywords"]
        keywords = [i.lower().strip() for i in keywords.split(',')]
        result = KeywordsModel.query.filter(KeywordsModel.keywords_lc.in_(keywords)).all()
        return {
            "success": True,
            "result": result 
        }