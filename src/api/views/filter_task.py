from datetime import datetime
from http import HTTPStatus
from typing import Any

from flask.views import MethodView
from flask_smorest import Blueprint, abort
from logzero import logger
from marshmallow import Schema, fields
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

from api.authentication import auth
from api.database import DatasetModel, FilterTaskModel, db

blueprint = Blueprint("filter-task", "filter-task", url_prefix="/filter-task")


class FilterPostSchema(Schema):
    keywords = fields.List(fields.Str(), required=True)


class FilterListSchema(Schema):
    is_complete = fields.Bool()
    is_error = fields.Bool()


class FilterTaskSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = FilterTaskModel

    is_complete = fields.Bool()
    is_error = fields.Bool()


@blueprint.route("")
class FilterTask(MethodView):
    @blueprint.arguments(FilterPostSchema, location="json")
    @blueprint.response(HTTPStatus.CREATED, FilterTaskSchema)
    def post(self, args: dict[str, Any]):
        keywords: list[str] = args["keywords"]

        task = FilterTaskModel(keywords=" ".join(keywords), user=auth.user)
        db.session.add(task)
        db.session.commit()

        task.start_time = datetime.utcnow()

        dataset = DatasetModel(task=task)
        db.session.add(dataset)
        db.session.flush()

        result = db.session.execute(
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

        task.end_time = datetime.utcnow()

        db.session.commit()

        return task

    @blueprint.arguments(FilterListSchema, location="query")
    @blueprint.response(HTTPStatus.OK, FilterTaskSchema(many=True))
    def get(self, args: dict[str, Any]):
        is_complete = args.get("is_complete")
        is_error = args.get("is_error")

        query = db.session.query(FilterTaskModel).filter_by(user_id=auth.user.id)

        if is_complete is not None:
            query = query.filter(FilterTaskModel.is_complete.is_(is_complete))
        if is_error is not None:
            query = query.filter(FilterTaskModel.is_error.is_(is_error))

        return query.all()


@blueprint.route("/<int:filter_task_id>")
class FilterTaskById(MethodView):
    @blueprint.response(HTTPStatus.OK, FilterTaskSchema)
    @blueprint.alt_response(HTTPStatus.NOT_FOUND)
    def get(self, filter_task_id: int):
        filter_task = (
            db.session.query(FilterTaskModel)
            .filter_by(user_id=auth.user.id)
            .filter_by(id=filter_task_id)
            .one_or_none()
        )
        if filter_task is None:
            abort(HTTPStatus.NOT_FOUND)

        return filter_task
