from conftest import PASSWORD, register

def test_register_logs_the_user_in(client):
    user = register(client, "  Ana@Example.com ")
    assert user["email"] == "ana@example.com"
    assert client.get("/api/v1/auth/me").json()["email"] == "ana@example.com"

def test_session_cookie_is_http_only(client):
    response = client.post("/api/v1/auth/register", json={"email": "ana@example.com", "password": PASSWORD})
    cookie = response.headers["set-cookie"].lower()
    assert "httponly" in cookie and "samesite=lax" in cookie

def test_duplicate_email_is_rejected(client):
    register(client)
    response = client.post("/api/v1/auth/register", json={"email": "ana@example.com", "password": PASSWORD})
    assert response.status_code == 409

def test_short_password_is_rejected(client):
    response = client.post("/api/v1/auth/register", json={"email": "ana@example.com", "password": "short"})
    assert response.status_code == 422

def test_login_and_logout(client):
    register(client)
    client.post("/api/v1/auth/logout")
    assert client.get("/api/v1/auth/me").status_code == 401

    response = client.post("/api/v1/auth/login", json={"email": "ana@example.com", "password": PASSWORD})
    assert response.status_code == 200
    assert client.get("/api/v1/auth/me").status_code == 200

def test_wrong_password_and_unknown_email_look_the_same(client):
    register(client)
    client.post("/api/v1/auth/logout")
    wrong = client.post("/api/v1/auth/login", json={"email": "ana@example.com", "password": "not-the-password"})
    unknown = client.post("/api/v1/auth/login", json={"email": "bob@example.com", "password": PASSWORD})
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()

def test_writes_without_csrf_header_are_blocked(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "ana@example.com", "password": PASSWORD},
        headers={"X-Requested-With": ""},
    )
    assert response.status_code == 403

def test_logout_invalidates_the_old_cookie(client):
    register(client)
    old_cookie = client.cookies.get("session")
    client.post("/api/v1/auth/logout")
    client.cookies.set("session", old_cookie)
    assert client.get("/api/v1/auth/me").status_code == 401
