import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import RequirementCard from "../components/RequirementCard";

export default function DetailedAnalysis() {
    const navigate = useNavigate();
    const [result, setResult] = useState(null);

    useEffect(() => {
        const stored =
            sessionStorage.getItem(
                "resumeLensResult"
            );

        if (!stored) {
            navigate("/analyze");
            return;
        }

        setResult(
            JSON.parse(stored)
        );
    }, [navigate]);

    if (!result) {
        return null;
    }

    const requirements =
        result.requirements || [];

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
                        {requirements.map(
                            (requirement) => (
                                <RequirementCard
                                    key={
                                        requirement.requirement_id
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
