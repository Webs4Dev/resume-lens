import { useState } from "react";
import { FileText, Upload, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import ScanLoader from "../components/ScanLoader";
import { createAnalysis } from "../services/history";

const MAX_FILE_MB = 5;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const MIN_JD_LENGTH = 100;

export default function Analyze() {
    const navigate = useNavigate();

    const [resume, setResume] = useState(null);
    const [jobTitle, setJobTitle] = useState("");
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

    // Shared by the file picker and drag-and-drop so both paths
    // apply the same checks.
    function selectFile(file) {
        if (!file) return;

        if (!isPdf(file)) {
            setError("Please upload your resume as a PDF.");
            setResume(null);
            return;
        }

        if (file.size === 0) {
            setError("That PDF looks empty. Please choose another file.");
            setResume(null);
            return;
        }

        if (file.size > MAX_FILE_BYTES) {
            setError(`Your PDF must be ${MAX_FILE_MB} MB or smaller.`);
            setResume(null);
            return;
        }

        setError("");
        setResume(file);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        if (!resume) {
            setError("Please upload your resume.");
            return;
        }

        if (jobDescription.trim().length < MIN_JD_LENGTH) {
            setError(
                `Please paste the full job description (at least ${MIN_JD_LENGTH} characters).`
            );
            return;
        }

        setLoading(true);

        // The backend runs the analysis and saves it in one request,
        // so a result is never shown without being in your history.
        try {
            const { id } = await createAnalysis({
                file: resume,
                jobTitle: jobTitle.trim(),
                jobDescription: jobDescription.trim()
            });

            navigate(`/results/${id}`);
        } catch (err) {
            setError(
                err.message ||
                "Something went wrong while analyzing your resume."
            );
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
        selectFile(event.dataTransfer.files?.[0]);
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
                                your resume. This can take up to a
                                minute.
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
                            noValidate
                        >

                            <div className="form-group">

                                <label
                                    className="form-label"
                                    htmlFor="resume-file"
                                >
                                    Resume
                                </label>

                                <label
                                    htmlFor="resume-file"
                                    className={`file-drop ${
                                        dragOver ? "drag-over" : ""
                                    } ${resume ? "has-file" : ""}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >

                                    <input
                                        id="resume-file"
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        aria-describedby="resume-hint"
                                        onChange={(e) => {
                                            selectFile(
                                                e.target.files?.[0]
                                            );
                                            // Allow re-selecting the
                                            // same file after an error.
                                            e.target.value = "";
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

                                    <p
                                        id="resume-hint"
                                        className="card-description"
                                    >
                                        PDF only, up to {MAX_FILE_MB} MB
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

                                <label
                                    className="form-label"
                                    htmlFor="job-title"
                                >
                                    Job Title <span className="optional">(optional)</span>
                                </label>

                                <input
                                    id="job-title"
                                    className="text-input"
                                    type="text"
                                    maxLength={200}
                                    value={jobTitle}
                                    onChange={(e) =>
                                        setJobTitle(e.target.value)
                                    }
                                    placeholder="e.g. Backend Engineer at Acme"
                                    aria-describedby="job-title-hint"
                                />

                                <p id="job-title-hint" className="input-hint">
                                    Shown in your history. If empty, the first
                                    line of the job description is used.
                                </p>

                            </div>

                            <div className="form-group">

                                <label
                                    className="form-label"
                                    htmlFor="job-description"
                                >
                                    Job Description
                                </label>

                                <textarea
                                    id="job-description"
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
                                <div className="error" role="alert">
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
