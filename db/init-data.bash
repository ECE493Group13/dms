#!/usr/bin/env bash

DB_URL=$1

db_exec() {
    psql $DB_URL -c "$1"
}

db_exec 'DROP SCHEMA IF EXISTS docs CASCADE'
db_exec 'CREATE SCHEMA docs'
# index data sets role to "roger"
db_exec 'DROP ROLE IF EXISTS roger'
db_exec 'CREATE ROLE roger'

unzip -p ~/data/GeneralIndex.keywords.0/doc_keywords_0.sql.zip | head -n 10000 | psql $DB_URL
unzip -p ~/data/GeneralIndex.ngrams.0/doc_ngrams_0.sql.zip | head -n 10000 | psql $DB_URL
unzip -p ~/data/GeneralIndex.info.0/doc_info_0.sql.zip | head -n 10000 | psql $DB_URL
