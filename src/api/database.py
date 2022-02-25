from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

class KeywordsModel(db.Model):
    __table_args__ = {"schema": "docs"}
    __tablename__ = "doc_keywords_0"

    dkey = db.Column(db.Text, primary_key=True)
    keywords = db.Column(db.Text)
    keywords_lc = db.Column(db.Text)
    keyword_tokens = db.Column(db.Integer)
    keyword_score = db.Column(db.Float)
    doc_count = db.Column(db.Integer)
    insert_date = db.Column(db.DateTime)

    def as_dict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}