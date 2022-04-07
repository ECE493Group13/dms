#!/usr/bin/env bash

set -e

DB_URL=postgres://postgres:test_password@localhost:5434/postgres

# Clear and restart the test db
psql $DB_URL < integrated-tests/clear-db.sql
psql $DB_URL < integrated-tests/schema.sql

# Insert sample data
psql $DB_URL < integrated-tests/data.sql
