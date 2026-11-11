"""CAREVOICE Database Configuration and Session Management.

Supports:
1. Direct Supabase PostgreSQL (via DATABASE_URL when valid credentials provided)
2. Graceful fallback to SQLite (carevoice.db) if database password is placeholder
"""

import logging
import os
import re
import urllib.parse
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

logger = logging.getLogger("carevoice.database")

RAW_DATABASE_URL = os.getenv("DATABASE_URL", "").strip()


def parse_and_clean_postgres_url(raw_url: str) -> str:
    """Parses and sanitizes connection string.
    - If empty or contains placeholder password, defaults gracefully to local SQLite (carevoice.db).
    - If PostgreSQL, cleans URL-encoding for special characters and ensures psycopg2 driver.
    """
    if (
        not raw_url
        or "[YOUR-PASSWORD]" in raw_url
        or "YOUR_PASSWORD" in raw_url
        or "<YOUR-PASSWORD>" in raw_url
    ):
        logger.info(
            "DATABASE_URL contains placeholder password or is empty. Using local SQLite (carevoice.db). "
            "To connect direct SQLAlchemy to Supabase PostgreSQL, replace [YOUR-PASSWORD] with your actual Supabase DB password."
        )
        return "sqlite:///./carevoice.db"

    if raw_url.startswith("sqlite"):
        return raw_url

    if not (
        raw_url.startswith("postgres://")
        or raw_url.startswith("postgresql://")
        or raw_url.startswith("postgresql+psycopg2://")
    ):
        logger.warning("Unrecognized database scheme, falling back to local SQLite.")
        return "sqlite:///./carevoice.db"

    url = raw_url
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    # Sanitize password if special characters or surrounding brackets are present
    if "@" in url:
        auth_part, host_db_part = url.rsplit("@", 1)
        scheme_sep = "://"
        if scheme_sep in auth_part:
            scheme, user_pass = auth_part.split(scheme_sep, 1)
            if ":" in user_pass:
                user, password = user_pass.split(":", 1)
                # Strip accidental outer brackets around password if present (e.g. [secret])
                if password.startswith("[") and password.endswith("]"):
                    password = password[1:-1]
                # URL-encode password characters to avoid URI parsing conflicts
                encoded_password = urllib.parse.quote_plus(urllib.parse.unquote_plus(password))
                url = f"postgresql+psycopg2://{user}:{encoded_password}@{host_db_part}"

    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)

    return url


DATABASE_URL = parse_and_clean_postgres_url(RAW_DATABASE_URL)

# Engine configuration (SQLite or PostgreSQL)
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=10,
        max_overflow=20,
        connect_args={"connect_timeout": 15},
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency yielding database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all required tables if they do not exist."""
    try:
        from app.models import Complaint, ComplaintHistory, Feedback  # noqa: F401
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as exc:
        masked_exc = re.sub(r':[^:@/]+@', ':****@', str(exc))
        logger.error("Database initialization notice: %s", masked_exc)
