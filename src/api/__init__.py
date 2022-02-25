from flask import Flask
from flask_cors import CORS
from flask_smorest import Api

from api.config import OpenAPIConfig
from api.database import db
from api.views.filterpaper import blueprint as filterpaper_blueprint
from api.views.healthcheck import blueprint as healthcheck_blueprint
from api.views.wc import blueprint as wc_blueprint

app = Flask(__name__)
app.config["API_TITLE"] = "DMS API"
app.config["API_VERSION"] = "0.0.1"
app.config.from_object(OpenAPIConfig)
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "postgresql+psycopg2://postgres:"
    "F49opCuTNMb4hdxmhVGg_ZypnjU@localhost:5433/postgres"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

CORS(app)

api = Api(app)

api.register_blueprint(healthcheck_blueprint)
api.register_blueprint(wc_blueprint)
api.register_blueprint(filterpaper_blueprint)
