import { AlertTriangle } from "lucide-react";
import TiltCard from "./TiltCard";

export default function GapCard({
    gap
}) {
    const severityClass =
        gap.severity === "HIGH"
            ? "severity-high"
            : gap.severity === "MEDIUM"
            ? "severity-medium"
            : "severity-low";

    return (
        <TiltCard className="gap-card">

            <AlertTriangle
                size={20}
                className="gap-icon"
            />

            <div className="gap-content">

                <div className="gap-header">

                    <h3>
                        {gap.title}
                    </h3>

                    <span
                        className={`severity ${severityClass}`}
                    >
                        {gap.severity}
                    </span>

                </div>

                <p className="card-description">
                    {gap.description}
                </p>

            </div>

        </TiltCard>
    );
}
