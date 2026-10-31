import json
import os
import uuid
from pathlib import PurePath

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

from backend import n8n
from backend.auth import User, current_user
from backend.db import RESUME_DIR, get_db

router = APIRouter()

# Every analysis costs several LLM calls, so reject bad input before calling n8n.
MAX_PDF_BYTES = 5 * 1024 * 1024
MIN_JD_CHARS = 100
MAX_JD_CHARS = 50_000
MAX_TITLE_CHARS = 200
MAX_FILENAME_CHARS = 255

SUMMARY_COLUMNS = "id, job_title, resume_filename, ats_score, created_at"

class AnalysisSummary(BaseModel):
    id: int
    job_title: str
    resume_filename: str
    ats_score: float | None
    created_at: str

class AnalysisDetail(AnalysisSummary):
    job_description: str
    result: dict

def score_from(result: dict) -> float | None:
    raw = result["analysis"].get("ats_score")
    if raw is None:
        raw = (result.get("score") or {}).get("ats_score")
    try:
        return max(0.0, min(float(raw), 100.0))
    except (TypeError, ValueError):
        return None

def get_owned_row(db, analysis_id: int, user: User, columns: str):
    # Filtering on user_id means another user's id looks exactly like a missing one.
    row = db.execute(
        f"SELECT {columns} FROM analyses WHERE id = ? AND user_id = ?", (analysis_id, user.id)
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return row

# Plain `def` (not async): the n8n call blocks for up to a couple of minutes, and
# FastAPI runs sync routes in a threadpool so other requests keep working.
@router.post("/analyses", response_model=AnalysisSummary, status_code=201)
def create_analysis(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    job_title: str = Form(""),
    user: User = Depends(current_user),
):
    contents = resume.file.read(MAX_PDF_BYTES + 1)
    if len(contents) > MAX_PDF_BYTES:
        raise HTTPException(status_code=413, detail="Your PDF must be 5 MB or smaller.")
    # The spec allows the header anywhere in the first 1024 bytes.
    if b"%PDF-" not in contents[:1024]:
        raise HTTPException(status_code=415, detail="Please upload your resume as a PDF.")

    job_description = job_description.strip()
    if not MIN_JD_CHARS <= len(job_description) <= MAX_JD_CHARS:
        raise HTTPException(
            status_code=422,
            detail=f"The job description must be {MIN_JD_CHARS} to {MAX_JD_CHARS:,} characters.",
        )

    title = (job_title.strip() or job_description.splitlines()[0].strip())[:MAX_TITLE_CHARS]
    # Keep only the base name (no client-supplied folders); it is display text only.
    filename = (PurePath(resume.filename or "").name or "resume.pdf")[:MAX_FILENAME_CHARS]

    try:
        result = n8n.run_analysis(contents, filename, job_description)
    except n8n.AnalysisError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

    stored_name = f"{uuid.uuid4().hex}.pdf"
    path = os.path.join(RESUME_DIR, stored_name)
    with open(path, "wb") as f:
        f.write(contents)

    try:
        with get_db() as db:
            analysis_id = db.execute(
                "INSERT INTO analyses (user_id, job_title, job_description, resume_filename, "
                "resume_file, ats_score, result_json) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (user.id, title, job_description, filename, stored_name, score_from(result), json.dumps(result)),
            ).lastrowid
            row = db.execute(f"SELECT {SUMMARY_COLUMNS} FROM analyses WHERE id = ?", (analysis_id,)).fetchone()
    except Exception:
        os.remove(path)  # don't leave an orphaned file behind
        raise

    return AnalysisSummary(**row)

@router.get("/analyses", response_model=list[AnalysisSummary])
def list_analyses(user: User = Depends(current_user)):
    with get_db() as db:
        rows = db.execute(
            f"SELECT {SUMMARY_COLUMNS} FROM analyses WHERE user_id = ? "
            "ORDER BY created_at DESC, id DESC LIMIT 100",
            (user.id,),
        ).fetchall()
    return [AnalysisSummary(**row) for row in rows]

@router.get("/analyses/{analysis_id}", response_model=AnalysisDetail)
def get_analysis(analysis_id: int, user: User = Depends(current_user)):
    with get_db() as db:
        row = get_owned_row(db, analysis_id, user, f"{SUMMARY_COLUMNS}, job_description, result_json")
    data = dict(row)
    data["result"] = json.loads(data.pop("result_json"))
    return AnalysisDetail(**data)

@router.delete("/analyses/{analysis_id}", status_code=204)
def delete_analysis(analysis_id: int, user: User = Depends(current_user)):
    with get_db() as db:
        row = get_owned_row(db, analysis_id, user, "resume_file")
        db.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
    try:
        os.remove(os.path.join(RESUME_DIR, row["resume_file"]))
    except FileNotFoundError:
        pass

@router.get("/analyses/{analysis_id}/resume")
def download_resume(analysis_id: int, user: User = Depends(current_user)):
    with get_db() as db:
        row = get_owned_row(db, analysis_id, user, "resume_filename, resume_file")
    path = os.path.join(RESUME_DIR, row["resume_file"])
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="The resume file is no longer stored.")
    return FileResponse(
        path,
        media_type="application/pdf",
        filename=row["resume_filename"],  # sent as a download, safely quoted by Starlette
        headers={"X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store"},
    )
