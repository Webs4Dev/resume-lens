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

def test_sends_the_secret_header(monkeypatch):
    seen = {}
    monkeypatch.setattr(n8n, "N8N_WEBHOOK_SECRET", "s3cret")
    monkeypatch.setattr(httpx, "post", fake_post(httpx.Response(200, json=SAMPLE_RESULT), seen=seen))
    n8n.run_analysis(b"%PDF-", "cv.pdf", "jd")
    assert seen["headers"] == {n8n.SECRET_HEADER: "s3cret"}

@pytest.mark.parametrize("setting", ["N8N_WEBHOOK_URL", "N8N_WEBHOOK_SECRET"])
def test_not_configured_never_calls_n8n(monkeypatch, setting):
    calls = []
    monkeypatch.setattr(n8n, setting, None)
    monkeypatch.setattr(httpx, "post", lambda *a, **k: calls.append(1))
    with pytest.raises(n8n.AnalysisError) as error:
        n8n.run_analysis(b"%PDF-", "cv.pdf", "jd")
    assert error.value.status_code == 503
    assert calls == []

@pytest.mark.parametrize("status", [401, 403])
def test_wrong_secret_is_a_generic_error(monkeypatch, status):
    monkeypatch.setattr(httpx, "post", fake_post(httpx.Response(status, text="Authorization data is wrong!")))
    with pytest.raises(n8n.AnalysisError) as error:
        n8n.run_analysis(b"%PDF-", "cv.pdf", "jd")
    assert error.value.status_code == 502
    assert error.value.message == n8n.GENERIC_ERROR

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
