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

### Workflow / Backend

- n8n
- n8n Webhooks
- n8n Code Nodes
- n8n AI Nodes

### Infrastructure

- Docker
- n8n Task Runners
- Cloudflare Tunnel

### Deployment

- Netlify — Frontend
- n8n — AI processing backend

---

# 📁 Project Structure

```text
resume_ats_agent/
│
├── frontend/
│   ├── public/
│   │   └── _redirects
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├──workflow/
│  └── resume-ats-workflow.json
│
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- n8n

For the complete AI workflow, you will also need the external services and API credentials required by the imported n8n workflow.

---

# 💻 Running the Frontend Locally

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY>
cd resume_ats_agent
```

Move into the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a file:

```text
frontend/.env
```

Add:

```env
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/your-webhook-path
```

If your n8n instance is publicly hosted, replace the value with your production webhook URL.

> Do not commit `.env` to GitHub.

---

## Start the Frontend

```bash
npm run dev
```

The application will be available at the local Vite development URL, typically:

```text
http://localhost:5173
```

---

# ⚙️ Setting Up the n8n Workflow

The repository contains the exported ResumeLens n8n workflow:

```text
n8n/workflows/resume-ats-workflow.json
```

## Importing the Workflow

1. Start your n8n instance.
2. Open the n8n editor.
3. Import `resume-ats-workflow.json`.
4. Configure the required credentials.
5. Verify the webhook configuration.
6. Activate the workflow.
7. Copy the webhook URL.
8. Add the webhook URL to the frontend `.env` file.

Example:

```env
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/your-webhook-path
```

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

# 🌐 Deployment

## Frontend

The React frontend can be deployed to Netlify.

For the Vite project, use:

```text
Base directory: frontend
Build command: npm run build
Publish directory: dist
```

The following environment variable must be configured in the deployment platform:

```text
VITE_N8N_WEBHOOK_URL
```

---

## n8n Backend

The n8n workflow needs to run on an accessible n8n instance.

It can be hosted using:

- Local Docker
- A VPS
- A cloud VM
- Managed n8n hosting

The GitHub repository stores the workflow definition but **does not execute the workflow**.

---

# 🔗 Using Local n8n With a Public Frontend

If the frontend is deployed publicly while n8n is running locally, the local webhook needs to be exposed to the internet.

One possible architecture is:

```text
              Netlify
                 │
                 │ HTTPS
                 ▼
        Cloudflare Tunnel
                 │
                 ▼
          localhost:5678
                 │
                 ▼
             Docker n8n
                 │
                 ▼
        ResumeLens Workflow
```

When using this setup, the computer running Docker and the tunnel must remain online for the deployed frontend to communicate with n8n.

---

# 🔐 Security

Never commit sensitive information to the repository.

The following should remain private:

```text
.env
API keys
API tokens
OAuth credentials
n8n credentials
Runner authentication tokens
n8n database files
SQLite files
Private configuration
```

A `.env.example` file can be provided to show the required environment variables without exposing their values.

If credentials are required by the workflow, users should configure their own credentials inside n8n.

---

# 📦 Sharing the Workflow

The n8n workflow is available at:

```text
n8n/workflows/resume-ats-workflow.json
```

A new user can:

1. Clone the repository.
2. Set up an n8n instance.
3. Import the workflow.
4. Configure their own API credentials.
5. Configure the webhook.
6. Start the frontend.
7. Point `VITE_N8N_WEBHOOK_URL` to their n8n webhook.

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