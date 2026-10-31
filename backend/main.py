from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from backend.auth import current_user
from backend.db import init_db
from backend.routes.analyses import MAX_PDF_BYTES
from backend.routes.analyses import router as analyses_router
from backend.routes.auth import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="ResumeLens API", version="0.1.0", lifespan=lifespan)

# No CORS middleware: the frontend reaches the API through the Vite dev proxy, so
# every request is same-origin and cross-site pages get no access at all.

# CSRF guard for the session cookie: a cross-site form can't set custom headers, and
# a cross-site fetch that does is blocked by the browser. So any state-changing
# request without this header didn't come from our frontend.
CSRF_HEADER = "X-Requested-With"
SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}

@app.middleware("http")
async def require_csrf_header(request: Request, call_next):
    if request.method not in SAFE_METHODS and request.headers.get(CSRF_HEADER) != "resumelens":
        return JSONResponse(status_code=403, content={"detail": "Missing CSRF header"})
    return await call_next(request)

# FastAPI parses (and spools to disk) a multipart body before the login check runs,
# so oversized uploads are refused here, from the declared size, before any body is read.
UPLOAD_PATH = "/api/v1/analyses"
MAX_UPLOAD_BODY = MAX_PDF_BYTES + 1024 * 1024  # the PDF plus room for the form fields

@app.middleware("http")
async def limit_upload_size(request: Request, call_next):
    if request.method == "POST" and request.url.path == UPLOAD_PATH:
        length = request.headers.get("content-length", "")
        if not length.isdigit() or int(length) > MAX_UPLOAD_BODY:
            return JSONResponse(status_code=413, content={"detail": "Your PDF must be 5 MB or smaller."})
    return await call_next(request)

# Blocks DNS rebinding: a malicious site that points its own domain at 127.0.0.1
# still sends its domain as the Host header, which is rejected here. (Added last,
# so it runs first.) The Vite proxy forwards Host: localhost:5173, which passes.
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1"])

# Only /auth/* and /health are public; every analysis route needs a logged-in user.
app.include_router(auth_router, prefix="/api/v1", tags=["AUTH"])
app.include_router(analyses_router, prefix="/api/v1", tags=["ANALYSES"], dependencies=[Depends(current_user)])

@app.get("/health")
def health_check():
    return {"status": "ok"}
