import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function RequirementCard({
    requirement
}) {
    const [open, setOpen] =
        useState(false);

    const decision =
        requirement.decision || "";

    const decisionClass =
        decision
            .toLowerCase()
            .replaceAll(" ", "_");

    return (
        <div className="card detail-card">

            <div className="detail-header">

                <button
                    onClick={() =>
                        setOpen(!open)
                    }
                >
                    {requirement.text}
                </button>

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
                    style={{
                        transform: open
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition: "0.2s"
                    }}
                />

            </div>

            {open && (
                <div className="detail-body">

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

                    {requirement.evidence_ids?.length > 0 && (
                        <div className="evidence">

                            <strong>
                                Evidence
                            </strong>

                            <div>
                                {requirement.evidence_ids.map(
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