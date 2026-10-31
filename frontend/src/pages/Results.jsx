import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import CategoryScores from "../components/CategoryScores";
import StrengthCard from "../components/StrengthCard";
import GapCard from "../components/GapCard";
import ScoreRing from "../components/ScoreRing";
import TiltCard from "../components/TiltCard";
import { readStoredResult } from "../services/resultStorage";

const DECISION_LABELS = {
    EXACT: "Exact",
    STRONG_MATCH: "Strong match",
    PARTIAL: "Partial",
    NO_MATCH: "No match",
    INSUFFICIENT_EVIDENCE: "Insufficient evidence",
    NOT_APPLICABLE: "Not applicable"
};

export default function Results() {
    const [result] = useState(readStoredResult);

    if (!result) {
        return <Navigate to="/analyze" replace />;
    }

    const analysis =
        result.analysis;

    const score =
        result.score || {};

    const atsScore =
        analysis.ats_score ?? score.ats_score ?? 0;

    return (
        <div className="app">
            <Navbar />

            <main className="page">

                <div className="container">

                    <div className="result-hero animate-in">

                        <ScoreRing score={atsScore} />

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

                        <DecisionSummary
                            decisionCounts={
                                score.decision_counts
                            }
                            confidenceSummary={
                                score.confidence_summary
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
                                (action, index) => (
                                    <TiltCard key={action.priority ?? index}>
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

// How many requirements landed in each decision bucket, plus the
// judge's average confidence, so the score is not a black box.
function DecisionSummary({
    decisionCounts,
    confidenceSummary
}) {
    if (!decisionCounts) {
        return null;
    }

    const entries = Object.entries(decisionCounts)
        .filter(([, count]) => count > 0);

    if (entries.length === 0) {
        return null;
    }

    const total = entries.reduce(
        (sum, [, count]) => sum + count,
        0
    );

    const averageConfidence =
        confidenceSummary?.average_confidence;

    return (
        <div className="decision-summary">

            <p className="card-description">
                {total} requirements evaluated
                {typeof averageConfidence === "number" && (
                    <>
                        {" · "}average confidence{" "}
                        {Math.round(averageConfidence * 100)}%
                    </>
                )}
            </p>

            <div className="detail-meta">
                {entries.map(([decision, count]) => (
                    <span
                        key={decision}
                        className={`decision decision-${decision.toLowerCase()}`}
                    >
                        {DECISION_LABELS[decision] ||
                            decision.replaceAll("_", " ")}
                        : {count}
                    </span>
                ))}
            </div>

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
