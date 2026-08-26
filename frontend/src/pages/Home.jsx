import { ArrowRight, FileText, Brain, Target } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/NavBar";
import ApertureMark from "../components/ApertureMark";
import TiltCard from "../components/TiltCard";

export default function Home() {
    return (
        <div className="app">
            <Navbar />

            <main className="page">
                <div className="container">

                    <section className="hero">

                        <div className="hero-signature">
                            <ApertureMark size={420} spin />
                        </div>

                        <div className="hero-badge">
                            AI-Powered Resume Analysis
                        </div>

                        <h1>
                            Know exactly how your resume
                            <span> matches the job.</span>
                        </h1>

                        <p>
                            ResumeLens analyzes your resume against a job
                            description using semantic matching and
                            evidence-grounded AI evaluation.
                        </p>

                        <div className="hero-actions">
                            <Link to="/analyze" className="primary-button">
                                Analyze My Resume
                                <ArrowRight
                                    size={16}
                                    style={{
                                        marginLeft: 7,
                                        verticalAlign: "middle"
                                    }}
                                />
                            </Link>

                            <a
                                href="#how-it-works"
                                className="secondary-button"
                            >
                                How It Works
                            </a>
                        </div>

                    </section>

                    <section id="how-it-works" className="animate-in">

                        <h2 className="section-title">
                            How ResumeLens works
                        </h2>

                        <p className="section-subtitle">
                            Your resume isn't judged on keywords alone.
                        </p>

                        <div className="grid-3">

                            <FeatureCard
                                icon={<FileText size={22} />}
                                title="Understand"
                                description="Extracts structured information from your resume and the job description."
                            />

                            <FeatureCard
                                icon={<Brain size={22} />}
                                title="Evaluate"
                                description="Uses semantic retrieval, embeddings and evidence-grounded LLM evaluation."
                            />

                            <FeatureCard
                                icon={<Target size={22} />}
                                title="Improve"
                                description="Identifies the most important gaps and gives you actionable improvements."
                            />

                        </div>

                    </section>

                </div>
            </main>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <TiltCard>
            <div style={{
                color: "var(--violet-soft)",
                marginBottom: "18px"
            }}>
                {icon}
            </div>

            <h3 style={{ marginBottom: "8px" }}>
                {title}
            </h3>

            <p className="card-description">
                {description}
            </p>
        </TiltCard>
    );
}
