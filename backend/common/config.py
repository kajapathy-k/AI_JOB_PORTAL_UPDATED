"""Central configuration shared by all services.

Every service loads the same .env (backend/.env) so they share GROQ_API_KEY and,
crucially, the same JWT_SECRET — tokens minted by auth-service must validate in
the other services.
"""
import os
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv

# backend/.env regardless of which service's cwd we were launched from
_BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(_BACKEND_DIR / ".env")

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

# Shared signing secret for JWTs. Override in .env for anything real.
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = int(os.environ.get("JWT_EXPIRE_MINUTES", "720"))  # 12h

# Where each service lives. The gateway (:8000) proxies to these; jobs-service
# calls screening-service directly for the apply orchestration.
# Services live on 90xx to avoid colliding with other local stacks that
# commonly grab 80xx (override any of these via .env if needed).
AUTH_URL = os.environ.get("AUTH_URL", "http://localhost:9001")
JOBS_URL = os.environ.get("JOBS_URL", "http://localhost:9002")
SCREENING_URL = os.environ.get("SCREENING_URL", "http://localhost:9003")
INTERVIEW_URL = os.environ.get("INTERVIEW_URL", "http://localhost:9004")

# Frontend origin allowed through CORS (gateway only — services sit behind it).
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")

# Resume-screening gate: applications scoring below this are auto-rejected and
# never reach the voice interview. Tune per how strict the funnel should be.
SCREEN_PASS_THRESHOLD = int(os.environ.get("SCREEN_PASS_THRESHOLD", "60"))

DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "postgres")
DB_SSLMODE = os.environ.get("DB_SSLMODE", "prefer")


def _postgres_url(db_name: str) -> str:
    user = quote_plus(DB_USER)
    password = quote_plus(DB_PASSWORD)
    return (
        f"postgresql+psycopg://{user}:{password}@{DB_HOST}:{DB_PORT}/{db_name}"
        f"?sslmode={DB_SSLMODE}"
    )


def db_path(name: str) -> str:
    """SQLAlchemy URL for a service-owned database.

    Resolution order:
      1. <SERVICE>_DATABASE_URL, e.g. AUTH_DATABASE_URL
      2. DATABASE_URL (shared, if both services intentionally use one DB)
      3. Shared Postgres connection settings + <SERVICE>_DB_NAME
    """
    service = name.upper()
    explicit = os.environ.get(f"{service}_DATABASE_URL") or os.environ.get("DATABASE_URL")
    if explicit:
        return explicit

    db_name = os.environ.get(f"{service}_DB_NAME", f"hirevoice_{name}")
    return _postgres_url(db_name)
