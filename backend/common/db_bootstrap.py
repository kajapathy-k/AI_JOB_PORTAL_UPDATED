"""Idempotent PostgreSQL database bootstrap for HireVoice.

Creates the service-owned databases required before SQLAlchemy can create
tables inside them. This module is safe to run repeatedly and never drops or
recreates databases.
"""
from __future__ import annotations

import logging
import os
import sys
from dataclasses import dataclass

import psycopg
from psycopg import errors, sql

from common import config

LOG_FORMAT = "%(asctime)s %(levelname)s [db-bootstrap] %(message)s"
logger = logging.getLogger("hirevoice.db_bootstrap")


@dataclass(frozen=True)
class DatabaseConfig:
    host: str
    port: str
    user: str
    password: str
    sslmode: str
    maintenance_databases: tuple[str, ...]
    required_databases: tuple[str, ...]


def load_config() -> DatabaseConfig:
    """Load DB bootstrap settings from backend/.env via common.config."""
    primary_db = os.environ.get("DB_NAME", "hirevoice")
    fallback_db = "postgres"

    maintenance_databases = tuple(
        dict.fromkeys(db for db in (primary_db, fallback_db) if db)
    )
    required_databases = tuple(
        dict.fromkeys(
            [
                os.environ.get("AUTH_DB_NAME", "hirevoice_auth"),
                os.environ.get("JOBS_DB_NAME", "hirevoice_jobs"),
            ]
        )
    )

    return DatabaseConfig(
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        sslmode=config.DB_SSLMODE,
        maintenance_databases=maintenance_databases,
        required_databases=required_databases,
    )


def connect(cfg: DatabaseConfig, db_name: str) -> psycopg.Connection:
    return psycopg.connect(
        host=cfg.host,
        port=cfg.port,
        dbname=db_name,
        user=cfg.user,
        password=cfg.password,
        sslmode=cfg.sslmode,
        connect_timeout=10,
        autocommit=True,
    )


def connect_to_maintenance_db(cfg: DatabaseConfig) -> psycopg.Connection:
    last_error: Exception | None = None

    for db_name in cfg.maintenance_databases:
        try:
            conn = connect(cfg, db_name)
            logger.info("connected to maintenance database '%s'", db_name)
            return conn
        except Exception as exc:  # connection details are logged, not secrets
            last_error = exc
            logger.warning(
                "could not connect to maintenance database '%s': %s",
                db_name,
                exc,
            )

    raise RuntimeError("could not connect to any maintenance database") from last_error


def database_exists(conn: psycopg.Connection, db_name: str) -> bool:
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
        return cur.fetchone() is not None


def create_database_if_missing(conn: psycopg.Connection, db_name: str, owner: str) -> None:
    if database_exists(conn, db_name):
        logger.info("database exists: %s", db_name)
        return

    try:
        with conn.cursor() as cur:
            cur.execute(
                sql.SQL("CREATE DATABASE {} OWNER {}").format(
                    sql.Identifier(db_name),
                    sql.Identifier(owner),
                )
            )
        logger.info("database created: %s", db_name)
    except errors.DuplicateDatabase:
        logger.info("database already created by another bootstrap run: %s", db_name)


def bootstrap_databases(cfg: DatabaseConfig) -> None:
    logger.info(
        "starting database bootstrap for %s:%s; required databases: %s",
        cfg.host,
        cfg.port,
        ", ".join(cfg.required_databases),
    )

    with connect_to_maintenance_db(cfg) as conn:
        for db_name in cfg.required_databases:
            create_database_if_missing(conn, db_name, cfg.user)

    logger.info("database bootstrap complete")


def main() -> int:
    logging.basicConfig(level=os.environ.get("DB_BOOTSTRAP_LOG_LEVEL", "INFO"), format=LOG_FORMAT)

    try:
        bootstrap_databases(load_config())
    except Exception:
        logger.exception("database bootstrap failed")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
