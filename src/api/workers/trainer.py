import json
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from tempfile import TemporaryDirectory
from time import sleep
from typing import TYPE_CHECKING

import word2vec_wrapper
from logzero import logger
from sqlalchemy.orm.session import Session

from api.database import (
    DatasetModel,
    DatasetPaperModel,
    NgramModel,
    PaperModel,
    TrainedModel,
    TrainTaskModel,
    db,
)

if TYPE_CHECKING:
    from sqlalchemy.orm.query import Query


@contextmanager
def db_session():
    with db.app.app_context():
        session: Session = db.app.session
        yield session


def get_next_task(session: Session):
    task = (
        session.query(TrainTaskModel)
        .filter(TrainTaskModel.end_time.is_(None))
        .order_by(TrainTaskModel.created.asc())
        .limit(1)
        .one_or_none()
    )
    return task


def write_corpus(session: Session, dataset: DatasetModel, filename: Path):
    with open(filename, "w") as file:
        query: Query[NgramModel] = (
            session.query(NgramModel)
            .join(PaperModel)
            .join(DatasetPaperModel)
            .join(DatasetModel)
            .filter(DatasetModel.id == dataset.id)
        )
        for ngram in query:
            file.write(f"{ngram.ngram_lc}\t{ngram.ngram_count}\n")


def read_embeddings(session: Session, task: TrainTaskModel, filename: Path):
    with open(filename, "rb") as file:
        model = TrainedModel(
            data=file.read(),
            task=task,
        )
        session.add(model)


def run_task(session: Session, task: TrainTaskModel):
    hparams = json.loads(task.hparams)
    with TemporaryDirectory() as tempdir:
        corpus_filename = Path(tempdir) / "corpus.txt"
        embeddings_filename = Path(tempdir) / "embeddings.txt"

        logger.info("Write corpus to %s", corpus_filename)
        write_corpus(session, task.dataset, corpus_filename)
        logger.info(f"Train with hparams %s", hparams)
        word2vec_wrapper.train(corpus_filename, embeddings_filename, hparams)
        logger.info("Read corpus from %s", embeddings_filename)
        read_embeddings(session, task, embeddings_filename)


def tick(session: Session):
    next_task = get_next_task(session)
    if next_task is None:
        return

    next_task.start_time = datetime.utcnow()
    session.commit()
    try:
        run_task(session, next_task)
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        next_task.end_time = datetime.utcnow()
        session.commit()


def main():
    while True:
        sleep(10)

        with db_session() as session:
            try:
                tick(session)
            except Exception:
                logger.exception("Failed to run tick()")


if __name__ == "__main__":
    main()
