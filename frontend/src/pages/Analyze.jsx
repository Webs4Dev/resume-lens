import { useState } from "react";
import { FileText, Upload, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import ScanLoader from "../components/ScanLoader";
import { analyzeResume } from "../services/api";

export default function Analyze() {
    const navigate = useNavigate();

    const [resume, setResume] = useState(null);
    const [jobDescription, setJobDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dragOver, setDragOver] = useState(false);

    function isPdf(file) {
        return (
            file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf")
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        if (!resume) {
            setError("Please upload your resume.");
            return;
        }

        if (!jobDescription.trim()) {
            setError("Please enter the job description.");
            return;
        }

        setLoading(true);

        try {
            const result = await analyzeResume(
                resume,
                jobDescription
            );

            sessionStorage.setItem(
                "resumeLensResult",
                JSON.stringify(result)
            );

            navigate("/results");

        } catch (err) {
            setError(
                err.message ||
                "Something went wrong while analyzing your resume."
            );
        } finally {
            setLoading(false);
        }
    }

    function handleDragOver(event) {
        event.preventDefault();
        setDragOver(true);
    }

    function handleDragLeave() {
        setDragOver(false);
    }

    function handleDrop(event) {
        event.preventDefault();
        setDragOver(false);

        const file = event.dataTransfer.files?.[0];
        if (!file) return;

        if (!isPdf(file)) {
            setError("Please upload your resume as a PDF.");
            return;
        }

        setError("");
        setResume(file);
    }

    if (loading) {
        return (
            <div className="app">
                <Navbar />

                <main className="page">
                    <div className="container">
                        <div className="loading">
                            <ScanLoader />

                            <h2>
                                Analyzing your resume
                            </h2>

                            <p>
                                ResumeLens is extracting evidence,
                                matching requirements and evaluating
                                your resume.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="app">
            <Navbar />

            <main className="page">
                <div className="container">

                    <div className="analyze-layout animate-in">

                        <h1 className="section-title">
                            Analyze your resume
                        </h1>

                        <p className="section-subtitle">
                            Upload your resume and paste the job
                            description you are applying for.
                        </p>

                        <form
                            className="upload-card"
                            onSubmit={handleSubmit}
                        >

                            <div className="form-group">

                                <label className="form-label">
                                    Resume
                                </label>

                                <label
                                    className={`file-drop ${
                                        dragOver ? "drag-over" : ""
                                    } ${resume ? "has-file" : ""}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >

                                    <input
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={(e) => {
                                            const file =
                                                e.target.files?.[0] ||
                                                null;

                                            if (
                                                file &&
                                                !isPdf(file)
                                            ) {
                                                setError(
                                                    "Please upload your resume as a PDF."
                                                );
                                                setResume(null);
                                                return;
                                            }

                                            setError("");
                                            setResume(file);
                                        }}
                                    />

                                    <div className="file-icon">
                                        <Upload size={22} />
                                    </div>

                                    <strong>
                                        {resume
                                            ? "Click or drop to replace"
                                            : "Click or drop your resume here"}
                                    </strong>

                                    <p className="card-description">
                                        PDF only
                                    </p>

                                    {resume && (
                                        <div className="file-name">
                                            <FileText
                                                size={13}
                                                style={{
                                                    marginRight: 6,
                                                    verticalAlign: "middle"
                                                }}
                                            />
                                            {resume.name}
                                        </div>
                                    )}

                                </label>

                            </div>

                            <div className="form-group">

                                <label className="form-label">
                                    Job Description
                                </label>

                                <textarea
                                    value={jobDescription}
                                    onChange={(e) =>
                                        setJobDescription(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Paste the complete job description here..."
                                />

                            </div>

                            {error && (
                                <div className="error">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="primary-button full-button"
                            >
                                Analyze Resume
                                <ArrowRight
                                    size={16}
                                    style={{
                                        marginLeft: 7,
                                        verticalAlign: "middle"
                                    }}
                                />
                            </button>

                        </form>

                    </div>

                </div>
            </main>
        </div>
    );
}
