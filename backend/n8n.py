import logging
import os

import httpx
from dotenv import load_dotenv

load_dotenv()

log = logging.getLogger("resumelens")

# The webhook URL lives only here (backend .env), never in the frontend bundle,
# so only logged-in users can trigger the paid LLM pipeline.
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")
# Shared secret sent as a header; the n8n webhook's Header Auth rejects calls without it.
N8N_WEBHOOK_SECRET = os.getenv("N8N_WEBHOOK_SECRET")
SECRET_HEADER = "X-ResumeLens-Secret"

# The pipeline makes several LLM calls in a row.
TIMEOUT_SECONDS = 150

GENERIC_ERROR = "We couldn't analyze your resume right now. Please try again in a moment."

class AnalysisError(Exception):
    def __init__(self, status_code: int, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.message = message

def run_analysis(pdf_bytes: bytes, filename: str, job_description: str) -> dict:
    """Send the resume and job description to the n8n workflow and return its result."""
    if not N8N_WEBHOOK_URL or not N8N_WEBHOOK_SECRET:
        log.error("Set N8N_WEBHOOK_URL and N8N_WEBHOOK_SECRET in .env, then restart the backend.")
        raise AnalysisError(503, "The analysis service is not configured.")

    headers = {SECRET_HEADER: N8N_WEBHOOK_SECRET}

    try:
        response = httpx.post(
            N8N_WEBHOOK_URL,
            files={"resume": (filename, pdf_bytes, "application/pdf")},
            data={"job_description": job_description},
            headers=headers,
            timeout=TIMEOUT_SECONDS,
        )
    except httpx.TimeoutException:
        raise AnalysisError(504, "The analysis took too long. Please try again.")
    except httpx.HTTPError as e:
        log.error("Could not reach n8n: %s", e)
        raise AnalysisError(503, "Could not reach the analysis service. Is n8n running?")

    # n8n error bodies can expose workflow internals: log them, never return them.
    if response.status_code in (401, 403):
        log.error("n8n rejected the webhook secret: N8N_WEBHOOK_SECRET must match the Header Auth credential.")
        raise AnalysisError(502, GENERIC_ERROR)

    if response.status_code >= 400:
        log.error("n8n returned %s: %s", response.status_code, response.text[:200])
        raise AnalysisError(502, GENERIC_ERROR)

    try:
        result = response.json()
    except ValueError:
        log.error("n8n returned non-JSON: %s", response.text[:200])
        raise AnalysisError(502, GENERIC_ERROR)

    if not isinstance(result, dict) or not result.get("success") or not isinstance(result.get("analysis"), dict):
        log.error("n8n returned an unexpected shape: %s", str(result)[:200])
        raise AnalysisError(502, GENERIC_ERROR)

    return result
