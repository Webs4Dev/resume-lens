import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Download, FileText, Trash2 } from "lucide-react";
import Navbar from "../components/NavBar";
import ScanLoader from "../components/ScanLoader";
import ScoreTrend from "../components/ScoreTrend";
import { deleteAnalysis, listAnalyses } from "../services/history";
import { resumeDownloadUrl } from "../services/apiClient";

function scoreTone(score) {
    return score >= 80
        ? "score-badge-green"
        : score >= 60
        ? "score-badge-yellow"
        : "score-badge-red";
}

function formatDateTime(value) {
    return new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

export default function History() {
    const [analyses, setAnalyses] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        listAnalyses()
            .then((rows) => {
                if (!cancelled) setAnalyses(rows);
            })
            .catch((err) => {
                console.error("Could not load history", err);
                if (!cancelled) {
                    setError("We couldn't load your history. Please refresh the page.");
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    async function handleDelete(analysis) {
        const confirmed = window.confirm(
            `Delete the analysis for "${analysis.job_title}"? This also deletes the stored resume and can't be undone.`
        );

        if (!confirmed) return;

        setError("");

        try {
            await deleteAnalysis(analysis.id);
            setAnalyses((rows) =>
                rows.filter((row) => row.id !== analysis.id)
            );
        } catch (err) {
            console.error("Delete failed", err);
            setError("That analysis could not be deleted. Please try again.");
        }
    }

    return (
        <div className="app">
            <Navbar />

            <main className="page">
                <div className="container animate-in">

                    <div className="history-header">
                        <div>
                            <h1 className="section-title">
                                Your analyses
                            </h1>
                            <p className="section-subtitle">
                                Every resume you've checked, and how
                                your score is trending.
                            </p>
                        </div>

                        <Link to="/analyze" className="primary-button">
                            New analysis
                            <ArrowRight
                                size={16}
                                style={{
                                    marginLeft: 7,
                                    verticalAlign: "middle"
                                }}
                            />
                        </Link>
                    </div>

                    {error && (
                        <div className="error" role="alert">
                            {error}
                        </div>
                    )}

                    {analyses === null && !error && (
                        <div className="loading">
                            <ScanLoader />
                        </div>
                    )}

                    {analyses?.length === 0 && (
                        <div className="card history-empty">
                            <h2>No analyses yet</h2>
                            <p className="card-description">
                                Upload a resume and a job description to
                                get your first ATS match score.
                            </p>
                            <Link to="/analyze" className="primary-button">
                                Analyze a resume
                            </Link>
                        </div>
                    )}

                    {analyses?.length > 0 && (
                        <>
                            <section className="card trend-card">
                                <h2 className="trend-title">
                                    ATS score over time
                                </h2>
                                <ScoreTrend analyses={analyses} />
                            </section>

                            <ul className="history-list">
                                {analyses.map((analysis) => {
                                    const score =
                                        analysis.ats_score === null
                                            ? null
                                            : Number(analysis.ats_score);

                                    return (
                                        <li key={analysis.id} className="card history-item">

                                            <div
                                                className={`score-badge ${
                                                    score === null ? "" : scoreTone(score)
                                                }`}
                                            >
                                                {score === null ? "–" : Math.round(score)}
                                            </div>

                                            <div className="history-info">
                                                <Link
                                                    to={`/results/${analysis.id}`}
                                                    className="history-title"
                                                >
                                                    {analysis.job_title}
                                                </Link>

                                                <p className="history-meta">
                                                    <FileText size={13} aria-hidden="true" />
                                                    {analysis.resume_filename}
                                                    {" · "}
                                                    {formatDateTime(analysis.created_at)}
                                                </p>
                                            </div>

                                            <div className="history-actions">
                                                <a
                                                    href={resumeDownloadUrl(analysis.id)}
                                                    className="icon-button"
                                                    aria-label={`Download ${analysis.resume_filename}`}
                                                    title="Download resume"
                                                >
                                                    <Download size={16} />
                                                </a>

                                                <button
                                                    type="button"
                                                    className="icon-button icon-button-danger"
                                                    onClick={() => handleDelete(analysis)}
                                                    aria-label={`Delete analysis ${analysis.job_title}`}
                                                    title="Delete analysis"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )}

                </div>
            </main>
        </div>
    );
}
