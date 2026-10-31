import os

from backend import n8n
from backend.db import RESUME_DIR
from conftest import PDF, register, upload

def stored_files():
    return os.listdir(RESUME_DIR) if os.path.isdir(RESUME_DIR) else []

def test_requires_login(client, fake_n8n):
    assert client.get("/api/v1/analyses").status_code == 401
    assert upload(client).status_code == 401
    assert fake_n8n.calls == []

def test_create_list_get_and_download(client, fake_n8n):
    register(client)
    created = upload(client)
    assert created.status_code == 201, created.text
    summary = created.json()
    assert summary["job_title"] == "Backend Engineer"
    assert summary["resume_filename"] == "Ana CV.pdf"
    assert summary["ats_score"] == 72.5  # the analysis score wins over score.ats_score

    listed = client.get("/api/v1/analyses").json()
    assert [row["id"] for row in listed] == [summary["id"]]

    detail = client.get(f"/api/v1/analyses/{summary['id']}").json()
    assert detail["result"]["analysis"]["score_label"] == "Good Match"
    assert detail["job_description"].startswith("We are hiring")

    download = client.get(f"/api/v1/analyses/{summary['id']}/resume")
    assert download.status_code == 200
    assert download.content == PDF
    assert "attachment" in download.headers["content-disposition"]
    assert len(stored_files()) == 1

def test_job_title_defaults_to_first_line(client, fake_n8n):
    register(client)
    jd = "Senior Data Engineer\n" + "Build pipelines with Spark and Airflow. " * 5
    summary = upload(client, job_description=jd, job_title="  ").json()
    assert summary["job_title"] == "Senior Data Engineer"

def test_client_folders_are_stripped_from_filename(client, fake_n8n):
    register(client)
    summary = upload(client, filename="../../etc/passwd.pdf").json()
    assert summary["resume_filename"] == "passwd.pdf"
    # The file on disk has a random name inside RESUME_DIR.
    assert stored_files()[0] != "passwd.pdf"

def test_rejects_non_pdf_before_calling_n8n(client, fake_n8n):
    register(client)
    assert upload(client, pdf=b"<html>not a pdf</html>").status_code == 415
    assert fake_n8n.calls == []

def test_rejects_large_pdf(client, fake_n8n):
    register(client)
    big = PDF + b"0" * (5 * 1024 * 1024)
    assert upload(client, pdf=big).status_code == 413
    assert fake_n8n.calls == []

def test_rejects_short_job_description(client, fake_n8n):
    register(client)
    assert upload(client, job_description="Python dev").status_code == 422
    assert fake_n8n.calls == []

def test_n8n_failure_saves_nothing(client, fake_n8n):
    register(client)
    fake_n8n.error = n8n.AnalysisError(502, n8n.GENERIC_ERROR)
    response = upload(client)
    assert response.status_code == 502
    assert response.json()["detail"] == n8n.GENERIC_ERROR
    assert client.get("/api/v1/analyses").json() == []
    assert stored_files() == []

def test_users_cannot_see_each_others_analyses(client, fake_n8n):
    register(client, "ana@example.com")
    analysis_id = upload(client).json()["id"]
    client.post("/api/v1/auth/logout")

    register(client, "bob@example.com")
    assert client.get("/api/v1/analyses").json() == []
    assert client.get(f"/api/v1/analyses/{analysis_id}").status_code == 404
    assert client.get(f"/api/v1/analyses/{analysis_id}/resume").status_code == 404
    assert client.delete(f"/api/v1/analyses/{analysis_id}").status_code == 404
    assert len(stored_files()) == 1  # Bob's delete did nothing

def test_delete_removes_row_and_file(client, fake_n8n):
    register(client)
    analysis_id = upload(client).json()["id"]
    assert client.delete(f"/api/v1/analyses/{analysis_id}").status_code == 204
    assert client.get(f"/api/v1/analyses/{analysis_id}").status_code == 404
    assert stored_files() == []
