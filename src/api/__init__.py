from flask import Flask
from flask_cors import CORS
from flask_smorest import Api

from api.authentication import auth
from api.config import DatabaseConfig, OpenAPIConfig
from api.database import db
from api.views.auth import blueprint as login_blueprint
from api.views.filterpaper import blueprint as filterpaper_blueprint
from api.views.healthcheck import blueprint as healthcheck_blueprint
from api.views.wc import blueprint as wc_blueprint

app = Flask(__name__)
app.config["API_TITLE"] = "DMS API"
app.config["API_VERSION"] = "0.0.1"
app.config.from_object(OpenAPIConfig)
app.config.from_object(DatabaseConfig)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["AUTH_EXCLUDE_ENDPOINTS"] = ["healthcheck.Healthcheck", "auth.Login"]

db.init_app(app)
auth.init_app(app)

CORS(app)

api = Api(app)

api.register_blueprint(filterpaper_blueprint)
api.register_blueprint(healthcheck_blueprint)
api.register_blueprint(login_blueprint)
api.register_blueprint(wc_blueprint)
