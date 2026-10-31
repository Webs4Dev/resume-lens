import { apiFetch, ApiError } from "./apiClient";

// Slightly longer than the backend's 150s n8n timeout, so the backend's
// clearer message usually arrives first.
const REQUEST_TIMEOUT_MS = 160000;

const GENERIC_ERROR =
    "We couldn't analyze your resume right now. Please try again in a moment.";

// Sends the resume to the backend, which runs the n8n workflow and saves
// the result. Returns the saved analysis summary (with its id).
export async function createAnalysis({ file, jobTitle, jobDescription }) {
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_title", jobTitle);
    formData.append("job_description", jobDescription);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        return await apiFetch("/analyses", {
            method: "POST",
            body: formData,
            signal: controller.signal
        });
    } catch (err) {
        if (err.name === "AbortError") {
            throw new Error("The analysis took too long. Please try again.", { cause: err });
        }

        if (err instanceof ApiError) {
            // The backend's messages for these are written for people.
            throw new Error(err.message || GENERIC_ERROR, { cause: err });
        }

        throw new Error(
            "Could not reach ResumeLens. Is the backend running?",
            { cause: err }
        );
    } finally {
        clearTimeout(timeout);
    }
}

export function listAnalyses() {
    return apiFetch("/analyses");
}

export function getAnalysis(id) {
    return apiFetch(`/analyses/${id}`);
}

export function deleteAnalysis(id) {
    return apiFetch(`/analyses/${id}`, { method: "DELETE" });
}
