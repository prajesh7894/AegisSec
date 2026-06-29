<div align="center">
  <img src="https://img.shields.io/badge/AegisSec-Security%20Platform-blue?style=for-the-badge&logo=shield" alt="AegisSec Banner" />
  
  <br />
  <br />

  **Enterprise Vulnerability Assessment & Security Operations Platform**

  [![Live Demo](https://img.shields.io/badge/Live_Demo-Available-success?style=flat-square&logo=vercel)](https://aegis-sec-ten.vercel.app/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=FastAPI&logoColor=white)]()
  [![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)]()
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)]()
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)]()

  *Built as a portfolio project for an IBM Cybersecurity Internship, demonstrating the ability to architect secure microservices and translate technical security data into business-ready compliance reporting.*
</div>

---

## 🌟 Live Production Deployment

AegisSec operates on a decoupled **Jamstack** architecture in production, ensuring lightning-fast static asset delivery and highly scalable backend task processing.

- 🖥️ **Frontend App**: [https://aegis-sec-ten.vercel.app/](https://aegis-sec-ten.vercel.app/) (Hosted on Vercel)
- ⚙️ **Backend API**: Hosted on Railway (Zero-downtime ASGI server)

---

## 🚀 Key Capabilities

| Feature | Description |
| :--- | :--- |
| ⚡ **Real-time Async Scanning** | Utilizes Python's `asyncio` for non-blocking TCP port scanning and service banner grabbing, streaming live progress to the frontend via WebSockets. |
| 📊 **Enterprise Reporting Engine** | Automatically generates professional multi-page PDF reports using `reportlab`, complete with Severity Pie Charts, CVSS v3.1 scoring, and actionable insights. |
| 🎯 **Threat Intelligence Mapping** | Maps vulnerabilities directly to **OWASP Top 10**, **MITRE ATT&CK** techniques, and **CWE IDs**, allowing analysts to prioritize critical findings. |
| 🔐 **Secure Authentication** | Implements a robust JWT-based authentication flow with HTTP Bearer tokens, protected React pathways, and strictly enforced CORS rules. |

---

## 📋 Architecture Overview

The platform is designed around a modern, scalable decoupled architecture:

1. **Vite + React Frontend (Vercel)**: Serves a highly responsive Single Page Application (SPA). Communicates with the backend via REST for CRUD/Auth operations and WebSockets for live scan streaming. Fully styled with TailwindCSS and Lucide Icons.
2. **FastAPI Backend (Railway)**: The core engine. Handles asynchronous network requests. The `ScanEngine` uses non-blocking sockets to perform reconnaissance, stores findings in an SQLite relational database via SQLAlchemy, and exposes them securely.
3. **Automated CI/CD**: Seamless GitHub-to-Cloud deployment pipelines ensure production stability.

---

## 💻 Local Development Setup

If you prefer to run the servers locally for development or testing:

### 1. Backend (FastAPI)
Open a terminal and navigate to the backend directory:
```bash
cd backend
python -m venv .venv

# Activate Virtual Environment
# Windows:
.\.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies and run
pip install -r requirements.txt
uvicorn app.main:app --reload
```
*The backend API will be available at `http://localhost:8000`*

### 2. Frontend (React/Vite)
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend

# Install dependencies and run
npm install
npm run dev
```
*The React application will be available at `http://localhost:5173`*

---

## 🛠️ Docker Quick Start

For isolated testing, you can spin up the entire stack using Docker Compose:

```bash
git clone https://github.com/your-username/aegissec.git
cd aegissec

# Copy environment variables
cp frontend/.env.example frontend/.env

# Build and spin up the containers
docker compose up --build
```
* **Frontend UI**: `http://localhost:8080`
* **API Documentation**: `http://localhost:8000/docs`

---

## ⚠️ Disclaimer
*AegisSec is an educational and portfolio project. It requires explicit user confirmation that they are authorized to assess a target before initiating a scan. Only scan targets you explicitly own or have written authorization to test.*
