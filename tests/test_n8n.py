import httpx
import pytest

from backend import n8n
from conftest import SAMPLE_RESULT

def fake_post(response=None, error=None, seen=None):
    def post(url, **kwargs):
        if seen is not None:
            seen.update(kwargs)
        if error:
            raise error
        return response
    return post

def test_returns_the_result(monkeypatch):
    monkeypatch.setattr(httpx, "post", fake_post(httpx.Response(200, json=SAMPLE_RESULT)))
    assert n8n.run_analysis(b"%PDF-", "cv.pdf", "jd") == SAMPLE_RESULT

def test_sends_the_secret_header_when_set(monkeypatch):
    seen = {}
    monkeypatch.setattr(n8n, "N8N_WEBHOOK_SECRET", "s3cret")
    monkeypatch.setattr(httpx, "post", fake_post(httpx.Response(200, json=SAMPLE_RESULT), seen=seen))
    n8n.run_analysis(b"%PDF-", "cv.pdf", "jd")
    assert seen["headers"] == {n8n.SECRET_HEADER: "s3cret"}

def test_not_configured(monkeypatch):
    monkeypatch.setattr(n8n, "N8N_WEBHOOK_URL", None)
    with pytest.raises(n8n.AnalysisError) as error:
        n8n.run_analysis(b"%PDF-", "cv.pdf", "jd")
    assert error.value.status_code == 503

def test_error_body_is_not_passed_to_the_user(monkeypatch):
    body = "Error in node 'LLM Judge': internal stack trace"
    monkeypatch.setattr(httpx, "post", fake_post(httpx.Response(500, text=body)))
    with pytest.raises(n8n.AnalysisError) as error:
        n8n.run_analysis(b"%PDF-", "cv.pdf", "jd")
    assert error.value.status_code == 502
    assert "LLM Judge" not in error.value.message

@pytest.mark.parametrize("response", [
    httpx.Response(200, text="not json"),
    httpx.Response(200, json={"success": False}),
    httpx.Response(200, json={"success": True, "analysis": "oops"}),
])
def test_unexpected_responses_are_rejected(monkeypatch, response):
    monkeypatch.setattr(httpx, "post", fake_post(response))
    with pytest.raises(n8n.AnalysisError) as error:
        n8n.run_analysis(b"%PDF-", "cv.pdf", "jd")
    assert error.value.status_code == 502

def test_timeout(monkeypatch):
    monkeypatch.setattr(httpx, "post", fake_post(error=httpx.ReadTimeout("slow")))
    with pytest.raises(n8n.AnalysisError) as error:
        n8n.run_analysis(b"%PDF-", "cv.pdf", "jd")
    assert error.value.status_code == 504

def test_unreachable(monkeypatch):
    monkeypatch.setattr(httpx, "post", fake_post(error=httpx.ConnectError("refused")))
    with pytest.raises(n8n.AnalysisError) as error:
        n8n.run_analysis(b"%PDF-", "cv.pdf", "jd")
    assert error.value.status_code == 503
