import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function RequirementCard({
    requirement
}) {
    const [open, setOpen] =
        useState(false);

    const bodyId = useId();

    const decision =
        requirement.decision || "";

    const decisionClass =
        decision
            .toLowerCase()
            .replaceAll(" ", "_");

    // `evidence` (id + resume text) is used when the workflow sends
    // it; older responses only have `evidence_ids`.
    const evidence =
        Array.isArray(requirement.evidence)
            ? requirement.evidence
            : [];

    const evidenceIds =
        requirement.evidence_ids || [];

    return (
        <div className="card detail-card">

            <button
                type="button"
                className="detail-header"
                aria-expanded={open}
                aria-controls={bodyId}
                onClick={() =>
                    setOpen(!open)
                }
            >
                <span className="detail-title">
                    {requirement.text}
                </span>

                <span
                    className={`decision decision-${decisionClass}`}
                >
                    {decision.replaceAll(
                        "_",
                        " "
                    )}
                </span>

                <ChevronDown
                    size={18}
                    aria-hidden="true"
                    style={{
                        transform: open
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition: "0.2s"
                    }}
                />
            </button>

            {open && (
                <div className="detail-body" id={bodyId}>

                    <div className="detail-meta">

                        <span className="meta-pill">
                            {requirement.type}
                        </span>

                        <span className="meta-pill">
                            Priority: {requirement.priority}
                        </span>

                        <span className="meta-pill">
                            Confidence:{" "}
                            {Math.round(
                                (requirement.confidence || 0) * 100
                            )}%
                        </span>

                        <span className="meta-pill">
                            {requirement.match_method}
                        </span>

                    </div>

                    {requirement.comment && (
                        <p className="card-description">
                            {requirement.comment}
                        </p>
                    )}

                    {evidence.length > 0 ? (
                        <div className="evidence">

                            <strong>
                                Evidence from your resume
                            </strong>

                            <ul className="evidence-list">
                                {evidence.map(
                                    (item) => (
                                        <li key={item.id}>
                                            {item.text}
                                        </li>
                                    )
                                )}
                            </ul>

                        </div>
                    ) : evidenceIds.length > 0 && (
                        <div className="evidence">

                            <strong>
                                Evidence references
                            </strong>

                            <div>
                                {evidenceIds.map(
                                    (id) => (
                                        <span
                                            className="evidence-id"
                                            key={id}
                                        >
                                            {id}
                                        </span>
                                    )
                                )}
                            </div>

                        </div>
                    )}

                </div>
            )}

        </div>
    );
}
