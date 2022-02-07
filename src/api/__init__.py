from flask import Flask
from flask_smorest import Api

from api.config import OpenAPIConfig
from api.views.healthcheck import blueprint as healthcheck_blueprint
from api.views.wc import blueprint as wc_blueprint

app = Flask(__name__)
app.config["API_TITLE"] = "DMS API"
app.config["API_VERSION"] = "0.0.1"
app.config.from_object(OpenAPIConfig)


api = Api(app)

api.register_blueprint(healthcheck_blueprint)
api.register_blueprint(wc_blueprint)
