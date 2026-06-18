"""Tiny SQLAlchemy helper so each service can stand up its own database.

Usage in a service:

    from common.db import Base, make_session, init_db
    from .models import User            # models subclass Base
    SessionLocal = make_session(db_path("auth"))
    init_db(db_path("auth"))            # create_all at startup

    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()


def _engine(url: str):
    # SQLite needs check_same_thread=False when serving requests across threads.
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(url, connect_args=connect_args, pool_pre_ping=True, future=True)


def make_session(url: str):
    return sessionmaker(bind=_engine(url), autoflush=False, autocommit=False, future=True)


def init_db(url: str, tables=None):
    """Create all tables registered on Base for this service's database."""
    Base.metadata.create_all(_engine(url), tables=tables)
