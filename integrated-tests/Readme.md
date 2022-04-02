# Utilities for integrated testing

This folder contains a script "before.bash" which can be run to set up sample data in the testing database.
The script should be run from the root directory of this repo.

Before the script is run, the testing database should be set up e.g. with `make test-db-init`.

To connect the API to the test database, use `make test-serve`.

