import { useRef, useState, useCallback } from "react";

// Wraps content in a glass "card" that gently tilts toward the cursor
// in 3D and casts a soft spotlight glow, standing in for the old flat
// .card divs. Respects prefers-reduced-motion by simply not tilting.
export default function TiltCard({
    children,
    className = "",
    as: Tag = "div",
    ...rest
}) {
    const ref = useRef(null);
    const [vars, setVars] = useState({});

    const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    const handleMove = useCallback(
        (e) => {
            if (reduceMotion || !ref.current) return;

            const rect =
                ref.current.getBoundingClientRect();

            const px =
                (e.clientX - rect.left) / rect.width;
            const py =
                (e.clientY - rect.top) / rect.height;

            setVars({
                "--rx": `${(0.5 - py) * 7}deg`,
                "--ry": `${(px - 0.5) * 7}deg`,
                "--mx": `${px * 100}%`,
                "--my": `${py * 100}%`,
                "--glow": 1
            });
        },
        [reduceMotion]
    );

    const handleLeave = useCallback(() => {
        setVars({
            "--rx": "0deg",
            "--ry": "0deg",
            "--glow": 0
        });
    }, []);

    return (
        <Tag
            ref={ref}
            className="card tilt-card"
            style={vars}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            {...rest}
        >
            <span className="tilt-sheen" aria-hidden="true" />
            {/* className lands here, not on the outer card, so
                layout classes like "gap-card" (display:flex) apply
                directly to the element wrapping the real children */}
            <div className={`tilt-inner ${className}`}>
                {children}
            </div>
        </Tag>
    );
}
