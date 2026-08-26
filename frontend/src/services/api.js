const N8N_WEBHOOK_URL =
    import.meta.env.VITE_N8N_WEBHOOK_URL;

export async function analyzeResume(
    resumeFile,
    jobDescription
) {
    if (!N8N_WEBHOOK_URL) {
        throw new Error(
            "N8N webhook URL is not configured."
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

    const response = await fetch(
        N8N_WEBHOOK_URL,
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {
        const message =
            await response.text();

        throw new Error(
            message ||
            `Request failed with status ${response.status}`
        );
    }

    const result =
        await response.json();

    if (!result.success) {
        throw new Error(
            "Resume analysis failed."
        );
    }

    return result;
}