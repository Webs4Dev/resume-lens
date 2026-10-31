from fastapi.testclient import TestClient

from backend.main import app
from conftest import CSRF, PDF, upload

def test_unknown_host_is_rejected(client):
    # DNS rebinding: the attacker's domain resolves to 127.0.0.1 but keeps its own Host.
    with TestClient(app, base_url="http://evil.example", headers=CSRF) as rebound:
        assert rebound.get("/health").status_code == 400
    assert client.get("/health").status_code == 200

def test_oversized_upload_is_refused_before_login(client, fake_n8n):
    # Not logged in, yet the answer is 413 (not 401): the size check runs before the
    # body is parsed, so an anonymous client can't make the server spool a huge file.
    big = PDF + b"0" * (7 * 1024 * 1024)
    assert upload(client, pdf=big).status_code == 413
    assert fake_n8n.calls == []

def test_upload_without_content_length_is_refused(client):
    response = client.post(
        "/api/v1/analyses",
        content=iter([b"chunked body"]),  # a generator body is sent without Content-Length
        headers={"Content-Type": "multipart/form-data; boundary=x"},
    )
    assert response.status_code == 413
