# ResumeLens 🚀

### AI-Powered Resume ATS Analyzer

ResumeLens is an AI-powered Applicant Tracking System (ATS) analyzer that evaluates how well a candidate's resume matches a given job description.

Unlike traditional ATS systems that primarily depend on keyword matching, ResumeLens combines **structured resume parsing, semantic embeddings, evidence-grounded LLM evaluation, deterministic scoring, and AI-powered recommendations** to provide a deeper analysis of resume-job compatibility.

The application allows users to upload their resume, provide a job description, and receive an ATS score along with matched skills, gaps, strengths, and actionable recommendations.

---

## ✨ Features

- 📄 **Resume Parsing**
  - Extracts structured information from resumes.
  - Identifies education, experience, projects, skills, certifications, achievements, and more.

- 💼 **Job Description Analysis**
  - Extracts requirements from job descriptions.
  - Identifies required skills, responsibilities, education requirements, and soft skills.

- 🧠 **Semantic Matching**
  - Uses vector embeddings to compare resume evidence with job requirements.
  - Goes beyond exact keyword matching.

- 🤖 **Evidence-Grounded AI Evaluation**
  - Uses an LLM to evaluate whether the resume provides actual evidence for each requirement.
  - Prevents the system from assuming skills that are not demonstrated in the resume.

- 📊 **ATS Score**
  - Generates an overall resume-job compatibility score.
  - Provides category-level insights into the candidate's performance.

- 🔍 **Gap Analysis**
  - Identifies requirements that are missing, partially satisfied, or lack sufficient evidence.

- 💡 **AI Recommendations**
  - Provides actionable suggestions to improve the resume.
  - Highlights where stronger evidence can be added when applicable.

- 🎯 **Frontend Dashboard**
  - Displays ATS score, strengths, gaps, matched skills, and recommended actions in an easy-to-understand interface.

---

# 🏗️ Architecture

ResumeLens consists of a React frontend connected to an n8n-based AI processing pipeline.

```text
                         ┌──────────────────────┐
                         │        User          │
                         │ Resume + Job         │
                         │ Description          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React Frontend     │
                         │       Vite           │
                         └──────────┬───────────┘
                                    │
                                    │ HTTPS Webhook
                                    ▼
                         ┌──────────────────────┐
                         │        n8n           │
                         │   ATS Workflow       │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
             Resume Parsing    JD Parsing      Embeddings
                    │               │               │
                    └───────────────┼───────────────┘
                                    ▼
                         ┌──────────────────────┐
                         │      LLM Judge       │
                         │ Evidence-Grounded    │
                         │ Requirement Matching │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Deterministic ATS    │
                         │  Score Calculation   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   AI Gap Analysis    │
                         │ & Recommendations    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Structured JSON    │
                         │      Response        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React Dashboard    │
                         │ Score + Insights     │
                         └──────────────────────┘
```

---

# 🔄 How It Works

## 1. Resume Upload

The user uploads their resume through the frontend.

The resume is parsed into structured information such as:

```text
Personal Information
Education
Experience
Projects
Skills
Certifications
Achievements
Extracurricular Activities
Publications
```

This structured data is converted into individual pieces of **resume evidence**.

---

## 2. Job Description Processing

The job description is analyzed and converted into structured requirements.

Requirements can include:

```text
Education
Technical Skills
Responsibilities
Soft Skills
Experience
Other Requirements
```

Each requirement is assigned an identifier so it can be evaluated independently.

---

## 3. Resume Evidence

Resume information is divided into individual evidence items.

For example:

```text
Type: Project
Evidence ID: project_3

Built a multi-agent research platform using
RAG and semantic search.
```

This allows the system to determine exactly which part of the resume supports a job requirement.

---

## 4. Semantic Embeddings

Resume evidence and job requirements are converted into vector embeddings.

ResumeLens uses semantic similarity to identify related concepts even when the wording is different.

For example:

```text
Resume:
Developed retrieval-augmented generation pipelines.

Job Requirement:
Experience building RAG systems.
```

These can be recognized as semantically related even though the exact wording differs.

---

## 5. LLM Requirement Evaluation

The LLM evaluates every job requirement against the available resume evidence.

Each requirement receives one of the following decisions:

| Decision | Meaning |
|---|---|
| `EXACT` | The resume directly satisfies the requirement |
| `STRONG_MATCH` | Strong relevant evidence exists |
| `PARTIAL` | Some relevant evidence exists, but it is incomplete |
| `NO_MATCH` | The resume does not satisfy the requirement |
| `INSUFFICIENT_EVIDENCE` | There is not enough evidence to determine a match |

The evaluator is designed to be **evidence-grounded**, meaning positive matches should be supported by actual resume evidence rather than assumptions.

---

## 6. ATS Score Calculation

After evaluating individual requirements, ResumeLens calculates an overall ATS compatibility score.

The system also evaluates different requirement categories to explain the score.

For example:

```text
Overall ATS Score: 76.5%

Technical Skills:     Strong
Education:            Strong
Responsibilities:     Moderate
Soft Skills:          Needs Evidence
```

---

## 7. Gap Analysis

The system identifies the most important gaps in the resume.

Example:

```text
Requirement:
Experience with LangChain

Gap:
LangChain experience is not clearly demonstrated.

Severity:
Medium

Recommendation:
Highlight an existing project involving LangChain,
if applicable.
```

Recommendations are based on the candidate's existing evidence and should not encourage adding false skills or experience.

---

## 8. Final AI Analysis

The final results are converted into a frontend-friendly structure containing information such as:

```text
ATS Score
Verdict
Score Label
Top Strengths
Top Gaps
Matched Skills
Skills Needing Evidence
Missing Skills
Recommended Actions
```

This allows the frontend to present the analysis without needing to understand the internal AI workflow.

---

# 🧠 AI Pipeline

The complete processing pipeline can be summarized as:

```text
Resume
   │
   ▼
Resume Parser
   │
   ▼
Structured Resume
   │
   ▼
Resume Evidence
   │
   ▼
Embeddings
   │
   ├─────────────────────────────┐
   │                             │
   │                      Job Description
   │                             │
   │                             ▼
   │                         JD Parser
   │                             │
   │                             ▼
   │                      Job Requirements
   │                             │
   │                             ▼
   └──────────────►          Embeddings
                             │
                             ▼
                       LLM Evaluation
                             │
                             ▼
                    Requirement Results
                             │
                             ▼
                    ATS Score Calculation
                             │
                             ▼
                       Gap Analysis
                             │
                             ▼
                    AI Recommendations
                             │
                             ▼
                    Structured JSON
                             │
                             ▼
                     React Dashboard
```

---

# 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- HTML
- CSS
- React Router

### AI / NLP

- Large Language Models
- OpenAI Embeddings
- Semantic Similarity
- Evidence-Grounded LLM Evaluation

### Backend

- Python + FastAPI (accounts, history, file storage)
- SQLite (users, sessions, analyses)
- Local folder for uploaded resume PDFs

### Workflow

- n8n
- n8n Webhooks
- n8n Code Nodes
- n8n AI Nodes

### Infrastructure

- Docker (n8n + task runners)
- n8n Task Runners

---

# 📁 Project Structure

```text
resume-ats-agent/
│
├── backend/               FastAPI API: auth, history, calls the n8n webhook
│   ├── routes/
│   ├── auth.py
│   ├── db.py
│   ├── n8n.py
│   └── main.py
├── tests/                 pytest suite (n8n is faked; no API credits spent)
├── frontend/
│   ├── src/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js     proxies /api to the backend
├── workflow/
│   └── resume_ats_workflow.json
├── data/                  created at runtime: SQLite DB + resumes (gitignored)
├── .env.example
├── requirements.txt
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

- Python 3.12+
- Node.js and npm
- n8n (Docker), with the ResumeLens workflow imported and active

For the complete AI workflow, you will also need the external services and API credentials required by the imported n8n workflow.

ResumeLens runs fully on your machine. The browser only talks to the local
FastAPI backend; the backend is the only thing that calls the n8n webhook, so
the webhook URL never appears in the frontend code.

```text
Browser ──/api──▶ Vite dev proxy ──▶ FastAPI (localhost:8000) ──▶ n8n webhook
                                         │
                                         └─ data/resumelens.db + data/resumes/
```

---

# 💻 Running Locally

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY>
cd resume-ats-agent
```

## 1. Backend

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # then fill in N8N_WEBHOOK_URL
uvicorn backend.main:app --reload
```

### Environment variables (`.env` in the project root)

| Name | Required | Purpose |
|---|---|---|
| `N8N_WEBHOOK_URL` | yes | Production webhook URL of the ResumeLens n8n workflow |
| `N8N_WEBHOOK_SECRET` | no | Shared secret sent as the `X-ResumeLens-Secret` header |
| `DB_PATH` | no | SQLite file, default `data/resumelens.db` |
| `RESUME_DIR` | no | Folder for uploaded PDFs, default `data/resumes` |

> Do not commit `.env` to GitHub. The frontend needs no environment variables.

## 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173, create an account, and run your first analysis.
Every analysis is saved to your History, where you can reopen it, download
the resume you uploaded, or delete it.

## Tests

```bash
pip install -r requirements-dev.txt
pytest
cd frontend && npm run lint && npm run build
```

---

# ⚙️ Setting Up the n8n Workflow

The repository contains the exported ResumeLens n8n workflow:

```text
workflow/resume_ats_workflow.json
```

## Importing the Workflow

1. Start your n8n instance.
2. Open the n8n editor.
3. Import `resume_ats_workflow.json`.
4. Configure the required credentials.
5. Verify the webhook configuration.
6. Activate the workflow.
7. Copy the production webhook URL.
8. Put it in the backend `.env` as `N8N_WEBHOOK_URL`.

---

# 🐳 n8n Docker Setup

ResumeLens can run n8n using Docker.

The backend architecture consists of:

```text
Docker
│
├── n8n
│
└── n8n Task Runner
    ├── JavaScript Runner
    └── Python Runner
```

The task runners provide the required execution environment for supported JavaScript and Python operations inside the workflow.

---

# 📦 Sharing the Workflow

The n8n workflow is available at:

```text
workflow/resume_ats_workflow.json
```

A new user can:

1. Clone the repository.
2. Set up an n8n instance.
3. Import the workflow.
4. Configure their own API credentials.
5. Configure the webhook.
6. Put the webhook URL in the backend `.env` as `N8N_WEBHOOK_URL`.
7. Start the backend and the frontend.

This allows the project to be reproduced without sharing private credentials or n8n runtime data.

---

# ⚠️ Important

The GitHub repository contains the **source code and workflow definition**.

It does not automatically provide:

- A running n8n server
- API credentials
- LLM API access
- n8n database
- Task runner environment
- Private environment variables

Anyone cloning the project needs to configure these components.

---

# 🎯 Use Cases

ResumeLens can be useful for:

- Students applying for internships
- Developers applying for software engineering roles
- AI/ML candidates
- Job seekers optimizing resumes
- Career development platforms
- Recruiters and hiring teams
- Resume analysis applications

---

# 🤝 Contributing

Contributions are welcome.

If you find a bug, have a feature request, or want to improve the project:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Commit your changes.
5. Open a Pull Request.

---

# 📄 License

This project is licensed under the MIT License.

---

## ⭐ ResumeLens

ResumeLens combines traditional ATS concepts with modern **semantic search and evidence-grounded AI** to provide candidates with a more meaningful understanding of how their resume matches a job description.

### Analyze → Understand → Improve → Apply
```