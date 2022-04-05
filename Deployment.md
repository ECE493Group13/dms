# Deployment instructions

## Prerequisites

You will need node, docker, a postgres client for postgres 14.2, and python 3.10.
Install each using the relevant instructions on their websites.
Python 3.10 must be the default python available from the `python` command.

I recommend using [pyenv](https://github.com/pyenv/pyenv) to set up Python and [nvm](https://github.com/nvm-sh/nvm) to set up node.

You will also need around 1 TB free disk space.

## Download research papers

Malamud's general index can be found [here](https://archive.org/details/GeneralIndex).
It is split into 16 slices.
Download slice 0 to `~/data`.
You can do this via torrent or direct download, but either way the code expects the downloaded files to look like so:

```
~/data/GeneralIndex.info.0/doc_info_0.sql.zip
~/data/GeneralIndex.keywords.0/doc_keywords_0.sql.zip
~/data/GeneralIndex.ngrams.0/doc_ngrams_0.sql.zip
```

## Set up backend

Navigate to the `api` directory and run the following from that directory:

### Set up secrets

Run the following commands

```bash
echo 'MAIL_PASSWORD=mail_password' >> secrets.mk
echo 'PASSWORD=password' >> db/secrets.mk
```

replacing the `mail_password` and `password` placeholders with the real values.

  - `MAIL_PASSWORD` in `secrets.mk` should be set to the password for the dataminingsystem@gmail.com email account
  - `PASSWORD` in `db/secrets.mk` is the postgres database password and can be set to anything as long as you do so before initializing the database. I recommend using a password manager to generate a password.

### Initialize the database

Run

```bash
make db-start
```

to download the postgres docker image and start the database, then

```bash
make db-init
```

to extract the general index data into the database.
The latter step will take around 2 hours.

### Set up venv

Run the following

```bash
python -m venv venv
source venv/bin/activate
pip install -e .[dev]
```

to set up the virtualenv and install dependencies


## Set up frontend

Navigate to the `frontend` directory and run

```bash
npm ci
```

## Run application

Run the frontend using (from the `frontend` directory)

```bash
npm run start
```

and the backend using (from the `api` directory)

```bash
source venv/bin/activate
make serve
```

then from other terminals (I suggest you use tmux)

```bash
source venv/bin/activate
make run-trainer
```

and

```bash
source venv/bin/activate
make run-filterer
```


You can then use the application by navigating to http://localhost:3000 in a web browser.
