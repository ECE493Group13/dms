from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Text, Integer, Float, DateTime

db = SQLAlchemy()


class KeywordsModel(db.Model):
    __table_args__ = {"schema": "docs"}
    __tablename__ = "doc_keywords_0"

    dkey = Column(Text, primary_key=True)
    keywords = Column(Text)
    keywords_lc = Column(Text)
    keyword_tokens = Column(Integer)
    keyword_score = Column(Float)
    doc_count = Column(Integer)
    insert_date = Column(DateTime)
