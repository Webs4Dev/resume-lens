import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import RequirementCard from "../components/RequirementCard";
import { readStoredResult } from "../services/resultStorage";

export default function DetailedAnalysis() {
    const [result] = useState(readStoredResult);

    if (!result) {
        return <Navigate to="/analyze" replace />;
    }

    const requirements =
        Array.isArray(result.requirements)
            ? result.requirements
            : [];

    return (
        <div className="app">

            <Navbar />

            <main className="page">

                <div className="container animate-in">

                    <Link
                        to="/results"
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

                </div>

            </main>

        </div>
    );
}
