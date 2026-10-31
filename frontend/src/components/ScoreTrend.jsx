import { useEffect, useRef, useState } from "react";

const HEIGHT = 200;
const PAD = { top: 16, right: 44, bottom: 28, left: 36 };
const TICKS = [0, 25, 50, 75, 100];

function formatDate(value) {
    return new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
    });
}

// Line chart of ATS scores, oldest to newest, one point per
// analysis. Single series, so no legend: the heading names it and
// the History list below is the table view of the same numbers.
export default function ScoreTrend({ analyses }) {
    const wrapRef = useRef(null);
    const [width, setWidth] = useState(0);
    const [active, setActive] = useState(null);

    // Measure the container so text stays a real size on phones
    // (a scaled viewBox would shrink the labels).
    useEffect(() => {
        const element = wrapRef.current;
        if (!element) return;

        const observer = new ResizeObserver(([entry]) =>
            setWidth(entry.contentRect.width)
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const points = analyses
        .filter((a) => a.ats_score !== null)
        .slice(0, 20)
        .reverse()
        .map((a) => ({ ...a, score: Number(a.ats_score) }));

    if (points.length === 0) {
        return null;
    }

    const plotWidth = Math.max(width - PAD.left - PAD.right, 0);
    const plotHeight = HEIGHT - PAD.top - PAD.bottom;

    const x = (i) =>
        PAD.left +
        (points.length === 1
            ? plotWidth / 2
            : (i / (points.length - 1)) * plotWidth);

    const y = (score) =>
        PAD.top + plotHeight - (score / 100) * plotHeight;

    const line = points
        .map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.score)}`)
        .join(" ");

    const area = points.length > 1
        ? `${line} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`
        : "";

    const last = points[points.length - 1];
    const activePoint = active === null ? null : points[active];

    return (
        <div className="score-trend" ref={wrapRef}>
            {width > 0 && (
                <svg
                    width={width}
                    height={HEIGHT}
                    role="img"
                    aria-label={`ATS score over your last ${points.length} analyses, latest ${Math.round(last.score)}`}
                >
                    {TICKS.map((tick) => (
                        <g key={tick}>
                            <line
                                className="trend-grid"
                                x1={PAD.left}
                                x2={PAD.left + plotWidth}
                                y1={y(tick)}
                                y2={y(tick)}
                            />
                            <text
                                className="trend-axis"
                                x={PAD.left - 8}
                                y={y(tick)}
                                textAnchor="end"
                                dominantBaseline="middle"
                            >
                                {tick}
                            </text>
                        </g>
                    ))}

                    <text
                        className="trend-axis"
                        x={x(0)}
                        y={HEIGHT - 6}
                        textAnchor={points.length === 1 ? "middle" : "start"}
                    >
                        {formatDate(points[0].created_at)}
                    </text>

                    {points.length > 1 && (
                        <text
                            className="trend-axis"
                            x={x(points.length - 1)}
                            y={HEIGHT - 6}
                            textAnchor="end"
                        >
                            {formatDate(last.created_at)}
                        </text>
                    )}

                    {area && <path className="trend-area" d={area} />}
                    {points.length > 1 && (
                        <path className="trend-line" d={line} />
                    )}

                    {points.map((p, i) => (
                        <g key={p.id}>
                            <circle
                                className="trend-dot"
                                cx={x(i)}
                                cy={y(p.score)}
                                r={active === i ? 6 : 4}
                            />
                            {/* Invisible, larger hit target for hover,
                                touch and keyboard focus. */}
                            <circle
                                className="trend-hit"
                                cx={x(i)}
                                cy={y(p.score)}
                                r={14}
                                tabIndex={0}
                                aria-label={`${p.job_title || "Analysis"}: ${Math.round(p.score)} on ${formatDate(p.created_at)}`}
                                onMouseEnter={() => setActive(i)}
                                onMouseLeave={() => setActive(null)}
                                onFocus={() => setActive(i)}
                                onBlur={() => setActive(null)}
                            />
                        </g>
                    ))}

                    {/* Direct label on the latest point only. */}
                    <text
                        className="trend-value"
                        x={x(points.length - 1) + 10}
                        y={y(last.score)}
                        dominantBaseline="middle"
                    >
                        {Math.round(last.score)}
                    </text>
                </svg>
            )}

            {activePoint && (
                <div
                    className="trend-tooltip"
                    style={{
                        left: Math.min(
                            Math.max(x(active), 90),
                            width - 90
                        ),
                        top: y(activePoint.score) - 12
                    }}
                    aria-hidden="true"
                >
                    <strong>{Math.round(activePoint.score)}</strong>
                    <span>{activePoint.job_title || "Analysis"}</span>
                    <span>{formatDate(activePoint.created_at)}</span>
                </div>
            )}
        </div>
    );
}
