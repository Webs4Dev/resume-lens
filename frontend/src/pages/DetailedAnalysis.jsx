import { Link, Navigate, useParams } from "react-router-dom";
import Navbar from "../components/NavBar";
import RequirementCard from "../components/RequirementCard";
import ScanLoader from "../components/ScanLoader";
import { useAnalysisResult } from "../hooks/useAnalysisResult";

export default function DetailedAnalysis() {
    const { id } = useParams();
    const { status, result } = useAnalysisResult();

    if (status === "missing") {
        return <Navigate to="/history" replace />;
    }

    const resultsPath = `/results/${id}`;

    const requirements =
        Array.isArray(result?.requirements)
            ? result.requirements
            : [];

    return (
        <div className="app">

            <Navbar />

            <main className="page">

                <div className="container animate-in">

                    <Link
                        to={resultsPath}
                        className="back-link"
                    >
                        ← Back to Results
                    </Link>

                    <h1 className="section-title">
                        Detailed Requirement Analysis
                    </h1>

                    <p className="section-subtitle">
                        See exactly how each job requirement
                        was evaluated against your resume.
                    </p>

                    {status === "loading" && (
                        <div className="loading">
                            <ScanLoader />
                        </div>
                    )}

                    {status === "error" && (
                        <div className="error" role="alert">
                            Couldn't load this analysis. Please refresh
                            the page.
                        </div>
                    )}

                    {status === "ready" && (
                        <div>
                            {requirements.length === 0 && (
                                <p className="card-description">
                                    No requirement details were returned
                                    for this analysis.
                                </p>
                            )}

                            {requirements.map(
                                (requirement, index) => (
                                    <RequirementCard
                                        key={
                                            requirement.requirement_id ??
                                            index
                                        }
                                        requirement={
                                            requirement
                                        }
                                    />
                                )
                            )}
                        </div>
                    )}

                </div>

            </main>

        </div>
    );
}
