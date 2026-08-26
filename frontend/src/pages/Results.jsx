import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import CategoryScores from "../components/CategoryScores";
import StrengthCard from "../components/StrengthCard";
import GapCard from "../components/GapCard";
import ScoreRing from "../components/ScoreRing";
import TiltCard from "../components/TiltCard";

export default function Results() {
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

    const analysis =
        result.analysis;

    const score =
        result.score;

    return (
        <div className="app">
            <Navbar />

            <main className="page">

                <div className="container">

                    <div className="result-hero animate-in">

                        <ScoreRing score={analysis.ats_score} />

                        <div className="result-hero-text">

                            <div className="score-label">
                                ATS Match Score
                            </div>

                            <h2>
                                {analysis.score_label}
                            </h2>

                            <p className="result-verdict">
                                {analysis.verdict}
                            </p>

                        </div>

                    </div>

                    <section>
                        <h2 className="section-title">
                            Match Breakdown
                        </h2>

                        <p className="section-subtitle">
                            See how your resume performs across
                            different requirement categories.
                        </p>

                        <CategoryScores
                            categoryScores={
                                score.category_scores
                            }
                        />
                    </section>

                    <section className="section">

                        <h2 className="section-title">
                            What You're Strong At
                        </h2>

                        <div className="grid-3">

                            {analysis.top_strengths?.map(
                                (strength, index) => (
                                    <StrengthCard
                                        key={index}
                                        strength={strength}
                                    />
                                )
                            )}

                        </div>

                    </section>

                    <section className="section">

                        <h2 className="section-title">
                            What's Holding You Back
                        </h2>

                        <p className="section-subtitle">
                            These are the highest-impact areas
                            limiting your match score.
                        </p>

                        <div style={{
                            display: "grid",
                            gap: "12px"
                        }}>

                            {analysis.top_gaps?.map(
                                (gap, index) => (
                                    <GapCard
                                        key={index}
                                        gap={gap}
                                    />
                                )
                            )}

                        </div>

                    </section>

                    <section className="section">

                        <h2 className="section-title">
                            Skills Analysis
                        </h2>

                        <div className="skill-grid">

                            <SkillGroup
                                title="Matched"
                                skills={
                                    analysis.skills?.matched
                                }
                                type="green"
                            />

                            <SkillGroup
                                title="Needs Evidence"
                                skills={
                                    analysis.skills?.needs_evidence
                                }
                                type="yellow"
                            />

                            <SkillGroup
                                title="Missing"
                                skills={
                                    analysis.skills?.missing
                                }
                                type="red"
                            />

                        </div>

                    </section>

                    <section className="section">

                        <h2 className="section-title">
                            Your Top Actions
                        </h2>

                        <div style={{
                            display: "grid",
                            gap: "12px"
                        }}>

                            {analysis.top_actions?.map(
                                (action) => (
                                    <TiltCard key={action.priority}>
                                        <div className="action-card">
                                            <div className="action-number">
                                                {action.priority}
                                            </div>

                                            <div className="action-content">

                                                <h3>
                                                    {action.action}
                                                </h3>

                                                <p className="card-description">
                                                    {action.description}
                                                </p>

                                            </div>
                                        </div>
                                    </TiltCard>
                                )
                            )}

                        </div>

                    </section>

                    <Link
                        to="/results/details"
                        className="detail-button"
                        style={{
                            display: "block",
                            textAlign: "center"
                        }}
                    >
                        View Detailed Requirement Analysis
                    </Link>

                </div>

            </main>
        </div>
    );
}

function SkillGroup({
    title,
    skills = [],
    type
}) {
    return (
        <div className="card">

            <h3
                className={`skill-heading skill-heading-${type}`}
            >
                {title}
            </h3>

            {skills.length === 0 ? (
                <p className="card-description">
                    None
                </p>
            ) : (
                <div className="skill-list">

                    {skills.map(
                        (skill, index) => (
                            <span
                                key={index}
                                className={`skill-pill skill-${type}`}
                            >
                                <span className="skill-dot" />
                                {skill}
                            </span>
                        )
                    )}

                </div>
            )}

        </div>
    );
}
