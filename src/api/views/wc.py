from http import HTTPStatus

from flask.views import MethodView
from flask_smorest import Blueprint, abort
from marshmallow import Schema, fields

blueprint = Blueprint("wc", "wc", url_prefix="/wc")


class WCQueryArgsSchema(Schema):
    text = fields.Str(required=True)


class WCResultSchema(Schema):
    num_words = fields.Int()
    num_letters = fields.Int()
    letters_per_word = fields.Float()


@blueprint.route("")
class WC(MethodView):
    @blueprint.arguments(WCQueryArgsSchema, location="json")
    @blueprint.response(HTTPStatus.OK, WCResultSchema)
    def get(self, args: dict):
        text: str = args["text"]

        words = text.split()

        if not words:
            abort(
                HTTPStatus.UNPROCESSABLE_ENTITY,
                message="Text must contain at least one word.",
            )

        num_words = len(words)
        num_letters = sum(len(word) for word in words)
        letters_per_word = num_letters / num_words

        return {
            "num_words": num_words,
            "num_letters": num_letters,
            "letters_per_word": letters_per_word,
        }
