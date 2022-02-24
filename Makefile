include db/rules.mk

.phony: serve
serve:
	FLASK_ENV=development flask run --port 8080

.phony: openapi
openapi:
	flask openapi write openapi.json

.phony: setup
setup:
	python -m venv venv
	venv/bin/pip install -e .[dev]
