import { CheckCircle } from "lucide-react";
import TiltCard from "./TiltCard";

export default function StrengthCard({
    strength
}) {
    return (
        <TiltCard className="strength-card">

            <div className="strength-top">

                <CheckCircle
                    size={19}
                    className="icon-green"
                />

                <h3>
                    {strength.title}
                </h3>

            </div>

            <div className="strength-value">
                {strength.value}
            </div>

            <p className="card-description">
                {strength.description}
            </p>

        </TiltCard>
    );
}
