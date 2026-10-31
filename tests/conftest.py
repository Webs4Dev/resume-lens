import atexit
import os
import shutil
import tempfile

# Set before any backend import: backend.db reads its paths at import time, and
# load_dotenv() never overrides a variable that is already set.
TMP_DIR = tempfile.mkdtemp(prefix="resumelens-tests-")
atexit.register(shutil.rmtree, TMP_DIR, ignore_errors=True)
os.environ["DB_PATH"] = os.path.join(TMP_DIR, "test.db")
os.environ["RESUME_DIR"] = os.path.join(TMP_DIR, "resumes")
os.environ["N8N_WEBHOOK_URL"] = "http://n8n.test/webhook/resume"

import pytest
from fastapi.testclient import TestClient

from backend import n8n
from backend.db import DB_PATH, RESUME_DIR
from backend.main import app

CSRF = {"X-Requested-With": "resumelens"}
PASSWORD = "correct-horse-battery"
PDF = b"%PDF-1.4\n% test resume\n"
JD = "We are hiring a backend engineer with Python, FastAPI and SQL experience. " * 3

SAMPLE_RESULT = {
    "success": True,
    "analysis": {"ats_score": 72.5, "score_label": "Good Match", "verdict": "Solid fit."},
    "score": {"ats_score": 70.1, "category_scores": {}},
    "requirements": [],
}

@pytest.fixture
def client():
    """A fresh database and resume folder per test; entering the client runs startup (init_db)."""
    for suffix in ("", "-wal", "-shm"):  # the DB runs in WAL mode
        if os.path.exists(DB_PATH + suffix):
            os.remove(DB_PATH + suffix)
    shutil.rmtree(RESUME_DIR, ignore_errors=True)
    # base_url sets Host: localhost, which TrustedHostMiddleware allows.
    with TestClient(app, base_url="http://localhost", headers=CSRF) as test_client:
        yield test_client

@pytest.fixture
def fake_n8n(monkeypatch):
    """Replaces the n8n call. Set `.result` or `.error`; `.calls` records each request."""
    class Fake:
        result = SAMPLE_RESULT
        error = None
        calls = []

        def __call__(self, pdf_bytes, filename, job_description):
            self.calls.append({"filename": filename, "job_description": job_description})
            if self.error:
                raise self.error
            return self.result

    fake = Fake()
    fake.calls = []
    monkeypatch.setattr(n8n, "run_analysis", fake)
    return fake

def register(client, email="ana@example.com"):
    response = client.post("/api/v1/auth/register", json={"email": email, "password": PASSWORD})
    assert response.status_code == 200, response.text
    return response.json()

def upload(client, pdf=PDF, filename="Ana CV.pdf", job_description=JD, job_title="Backend Engineer"):
    return client.post(
        "/api/v1/analyses",
        files={"resume": (filename, pdf, "application/pdf")},
        data={"job_description": job_description, "job_title": job_title},
    )
