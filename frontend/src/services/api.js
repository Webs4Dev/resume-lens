const N8N_WEBHOOK_URL =
    import.meta.env.VITE_N8N_WEBHOOK_URL;

// The pipeline makes several LLM calls; give it two minutes before
// giving up so the user is never stuck on the loader forever.
const REQUEST_TIMEOUT_MS = 120000;

const GENERIC_ERROR =
    "We couldn't analyze your resume right now. Please try again in a moment.";

function friendlyStatusMessage(status) {
    if (status === 413) {
        return "That file is too large to upload. Please use a smaller PDF.";
    }

    if (status === 429) {
        return "Too many requests. Please wait a minute and try again.";
    }

    if (status === 504 || status === 524) {
        return "The analysis took too long. Please try again.";
    }

    return GENERIC_ERROR;
}

export async function analyzeResume(
    resumeFile,
    jobDescription
) {
    if (!N8N_WEBHOOK_URL) {
        throw new Error(
            "The analysis service is not configured."
        );
    }

    const formData = new FormData();

    formData.append(
        "resume",
        resumeFile
    );

    formData.append(
        "job_description",
        jobDescription
    );

    const controller = new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS
    );

    let response;

    try {
        response = await fetch(
            N8N_WEBHOOK_URL,
            {
                method: "POST",
                body: formData,
                signal: controller.signal
            }
        );
    } catch (err) {
        if (err.name === "AbortError") {
            throw new Error(
                "The analysis took too long. Please try again.",
                { cause: err }
            );
        }

        throw new Error(
            "Could not reach the analysis service. Check your connection and try again.",
            { cause: err }
        );
    } finally {
        clearTimeout(timeout);
    }

    if (!response.ok) {
        // Raw n8n error bodies can expose workflow internals, so they
        // go to the console for debugging, never to the page.
        console.error(
            "Analysis request failed",
            response.status,
            await response.text().catch(() => "")
        );

        throw new Error(
            friendlyStatusMessage(response.status)
        );
    }

    let result;

    try {
        result = await response.json();
    } catch (err) {
        throw new Error(GENERIC_ERROR, { cause: err });
    }

    if (!result?.success || !result.analysis) {
        throw new Error(GENERIC_ERROR);
    }

    return result;
}
