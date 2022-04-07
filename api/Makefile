include db/rules.mk
include secrets.mk

.phony: serve
serve:
	DB_PASSWORD=$(PASSWORD) MAIL_PASSWORD=$(MAIL_PASSWORD) FLASK_ENV=development flask run --port 4433

.phony: openapi
openapi:
	flask openapi write openapi.json

.phony: test
test:
	pytest tests

.phony: setup
setup:
	python -m venv venv
	venv/bin/pip install -e .[dev]

.phony: run-trainer
run-trainer:
	sudo DB_PASSWORD=$(PASSWORD) venv/bin/python src/api/workers/trainer.py

.phony: run-filterer
run-filterer:
	DB_PASSWORD=$(PASSWORD) venv/bin/python src/api/workers/filterer.py

.phony: test-serve
test-serve:
	DB_PASSWORD=test_password MAIL_PASSWORD=$(MAIL_PASSWORD) DB_PORT=5434 FLASK_ENV=development flask run --port 4433
