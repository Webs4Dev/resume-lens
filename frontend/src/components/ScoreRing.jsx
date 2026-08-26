import { useEffect, useState } from "react";

// A circular gauge styled like a lens aperture dial. Draws its arc
// on from 0 to the score on mount, with tick marks around the rim.
export default function ScoreRing({ score = 0, size = 176 }) {
    const [animated, setAnimated] = useState(0);

    useEffect(() => {
        const frame = requestAnimationFrame(() =>
            setAnimated(score)
        );
        return () => cancelAnimationFrame(frame);
    }, [score]);

    const stroke = 8;
    const radius = size / 2 - stroke * 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(animated, 100));
    const offset =
        circumference - (clamped / 100) * circumference;

    const tone =
        score >= 80
            ? "ring-green"
            : score >= 60
            ? "ring-yellow"
            : "ring-red";

    const ticks = Array.from({ length: 40 });
    const center = size / 2;

    return (
        <div
            className={`score-ring ${tone}`}
            style={{ width: size, height: size }}
        >
            <svg
                viewBox={`0 0 ${size} ${size}`}
                className="score-ring-svg"
            >
                {ticks.map((_, i) => {
                    const angle = (i / ticks.length) * 360;
                    return (
                        <line
                            key={i}
                            className="score-ring-tick"
                            x1={center}
                            y1={4}
                            x2={center}
                            y2={i % 5 === 0 ? 11 : 8}
                            transform={`rotate(${angle} ${center} ${center})`}
                        />
                    );
                })}

                <circle
                    className="score-ring-track"
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={stroke}
                />

                <circle
                    className="score-ring-fill"
                    cx={center}
                    cy={center}
                    r={radius}
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>

            <div className="score-ring-center">
                <span className="score-ring-value">
                    {Math.round(animated)}
                </span>
                <span className="score-ring-max">/ 100</span>
            </div>
        </div>
    );
}
