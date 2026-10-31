// All backend calls go through here. In development Vite proxies /api to
// the FastAPI server, so requests are same-origin and the session cookie
// is sent automatically.
const API_BASE = "/api/v1";

export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export async function apiFetch(path, { method = "GET", json, body, signal } = {}) {
    const headers = {
        // Required by the backend's CSRF guard on every write.
        "X-Requested-With": "resumelens"
    };

    if (json !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: json !== undefined ? JSON.stringify(json) : body,
        credentials: "same-origin",
        signal
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        // FastAPI validation errors put a list in `detail`; only plain
        // strings are meant for people.
        const detail = typeof data?.detail === "string" ? data.detail : "";
        throw new ApiError(response.status, detail);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export function resumeDownloadUrl(id) {
    return `${API_BASE}/analyses/${id}/resume`;
}
