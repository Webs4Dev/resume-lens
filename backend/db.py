import os
import sqlite3
from contextlib import contextmanager

from dotenv import load_dotenv

load_dotenv()

# One local SQLite file and one folder of resume PDFs; both are gitignored.
DB_PATH = os.getenv("DB_PATH", "data/resumelens.db")
RESUME_DIR = os.getenv("RESUME_DIR", "data/resumes")

# Timestamps are UTC ISO strings, so they sort and compare correctly as text.
NOW = "strftime('%Y-%m-%dT%H:%M:%SZ', 'now')"

SCHEMA = f"""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT ({NOW})
);

-- Only a hash of the session token is stored, so a leaked DB file can't be used to log in.
CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- One row per resume-vs-job-description analysis. result_json is the full n8n
-- response, so a past result renders exactly like a new one.
CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    job_description TEXT NOT NULL,
    resume_filename TEXT NOT NULL,
    -- Random file name inside RESUME_DIR; never the user's own filename.
    resume_file TEXT NOT NULL,
    ats_score REAL,
    result_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT ({NOW})
);
CREATE INDEX IF NOT EXISTS idx_analyses_user ON analyses(user_id, created_at);
"""

def init_db():
    os.makedirs(os.path.dirname(DB_PATH) or ".", exist_ok=True)
    os.makedirs(RESUME_DIR, exist_ok=True)
    with get_db() as db:
        db.execute("PRAGMA journal_mode=WAL")  # readers don't block the writer
        db.executescript(SCHEMA)

@contextmanager
def get_db():
    """A short-lived connection per use (routes run in a threadpool); commits on success."""
    db = sqlite3.connect(DB_PATH, timeout=10)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    try:
        yield db
        db.commit()
    finally:
        db.close()
