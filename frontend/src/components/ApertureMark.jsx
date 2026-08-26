import { useId } from "react";

// The brand mark: a camera-aperture / radar ring. Small + static in
// the navbar, large + slowly spinning as the hero's signature visual.
export default function ApertureMark({ size = 26, spin = false }) {
    const uid = useId();
    const gradientId = `aperture-grad-${uid}`;

    return (
        <svg
            className={`aperture-mark ${
                spin ? "aperture-mark-spin" : ""
            }`}
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            aria-hidden="true"
        >
            <circle
                cx="24"
                cy="24"
                r="21"
                stroke={`url(#${gradientId})`}
                strokeWidth="2"
                strokeDasharray="3 7"
                strokeLinecap="round"
            />
            <circle
                cx="24"
                cy="24"
                r="14.5"
                stroke="currentColor"
                strokeOpacity="0.45"
                strokeWidth="1.5"
            />
            <circle cx="24" cy="24" r="3.5" fill="currentColor" />
            <defs>
                <linearGradient
                    id={gradientId}
                    x1="0"
                    y1="0"
                    x2="48"
                    y2="48"
                >
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
            </defs>
        </svg>
    );
}
