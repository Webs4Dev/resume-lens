import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ApiError } from "../services/apiClient";
import { getAnalysis } from "../services/history";

// True when a value is shaped like a ResumeLens result, so pages never
// crash on an old or half-written row.
function isValidResult(result) {
    return Boolean(
        result &&
        typeof result === "object" &&
        result.analysis &&
        typeof result.analysis === "object"
    );
}

// Loads the saved analysis for /results/:id. Returns
// { status: "loading" | "ready" | "missing" | "error", result, record }.
export function useAnalysisResult() {
    const { id } = useParams();

    const [loaded, setLoaded] = useState(null);

    useEffect(() => {
        let cancelled = false;

        getAnalysis(id)
            .then((record) => {
                if (cancelled) return;

                setLoaded(
                    isValidResult(record.result)
                        ? { id, status: "ready", result: record.result, record }
                        : { id, status: "missing" }
                );
            })
            .catch((err) => {
                if (cancelled) return;

                if (err instanceof ApiError && err.status === 404) {
                    setLoaded({ id, status: "missing" });
                    return;
                }

                console.error("Could not load analysis", err);
                setLoaded({ id, status: "error" });
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    // Ignore a previous id's data while the new one loads.
    if (!loaded || loaded.id !== id) {
        return { status: "loading" };
    }

    return loaded;
}
