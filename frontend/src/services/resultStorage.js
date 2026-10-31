const STORAGE_KEY = "resumeLensResult";

export function saveResult(result) {
    sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(result)
    );
}

// Returns the last analysis, or null when it is missing, not valid
// JSON, or not shaped like a ResumeLens result. Pages redirect on
// null instead of crashing on a half-written or stale entry.
export function readStoredResult() {
    try {
        const stored =
            sessionStorage.getItem(STORAGE_KEY);

        if (!stored) {
            return null;
        }

        const result = JSON.parse(stored);

        if (
            !result ||
            typeof result !== "object" ||
            !result.analysis ||
            typeof result.analysis !== "object"
        ) {
            return null;
        }

        return result;
    } catch {
        return null;
    }
}
