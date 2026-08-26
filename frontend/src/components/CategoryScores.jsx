import TiltCard from "./TiltCard";

export default function CategoryScores({
    categoryScores
}) {
    const categories = [
        {
            key: "technical_skill",
            title: "Technical Skills"
        },
        {
            key: "responsibility",
            title: "Responsibilities"
        },
        {
            key: "education",
            title: "Education"
        },
        {
            key: "soft_skill",
            title: "Soft Skills"
        }
    ];

    return (
        <div className="grid-4">

            {categories.map((category) => {

                const percentage =
                    categoryScores?.[
                        category.key
                    ]?.percentage ?? 0;

                const color =
                    percentage >= 80
                        ? "progress-green"
                        : percentage >= 60
                        ? "progress-yellow"
                        : "progress-red";

                return (
                    <TiltCard key={category.key}>
                        <div className="category-title">
                            {category.title}
                        </div>

                        <div className="category-value">
                            {percentage}%
                        </div>

                        <div className="progress">
                            <div
                                className={`progress-bar ${color}`}
                                style={{
                                    width: `${Math.min(
                                        percentage,
                                        100
                                    )}%`
                                }}
                            />
                        </div>
                    </TiltCard>
                );
            })}

        </div>
    );
}
