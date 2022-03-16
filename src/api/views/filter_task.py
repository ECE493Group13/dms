from http import HTTPStatus
from typing import Any

from flask.views import MethodView
from flask_smorest import Blueprint
from marshmallow import Schema, fields
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

from logzero import logger
from api.authentication import auth
from api.database import DatasetModel, FilterTaskModel, db
from sqlalchemy.engine.result import ResultProxy

blueprint = Blueprint("filter-task", "filter-task", url_prefix="/filter-task")


class FilterPostSchema(Schema):
    keywords = fields.List(fields.Str(), required=True)


class FilterTaskSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = FilterTaskModel


@blueprint.route("")
class FilterTask(MethodView):
    @blueprint.arguments(FilterPostSchema, location="json")
    @blueprint.response(HTTPStatus.OK, FilterTaskSchema)
    def post(self, args: dict[str, Any]):
        keywords: list[str] = args["keywords"]

        task = FilterTaskModel(keywords=" ".join(keywords), user=auth.user)
        db.add(task)
        db.commit()

        dataset = DatasetModel(task=task)
        db.session.add(dataset)
        db.session.flush()

        result: ResultProxy = db.session.execute(
            """
            insert into dataset_paper (dataset_id, dkey)
                select distinct :dataset_id, dkey from doc_keywords_0
                where keywords_lc = :keywords
            """,
            {"dataset_id": dataset.id, "keywords": " ".join(keywords)},
        )
        logger.info(
            "Filtered papers: inserted %s rows into dataset_paper", result.rowcount
        )
        db.session.commit()

        return task
