# AegisSec Enterprise

![CI Pipeline](https://github.com/your-username/aegissec/actions/workflows/ci.yml/badge.svg)

**AegisSec** is an advanced, full-stack enterprise vulnerability assessment and security operations platform. Built as a portfolio project for an IBM Cybersecurity Internship, it demonstrates the ability to architect secure, asynchronous microservices and translate raw technical security data into business-ready compliance reporting.

---

## 🚀 Key Features

* **Real-time Async Scanning**: Utilizes Python's `asyncio` for non-blocking TCP port scanning and service banner grabbing, providing live WebSocket progress updates to the frontend.
* **Enterprise Reporting Engine**: Automatically generates multi-page PDF reports using `reportlab`, complete with Severity Pie Charts, CVSS v3.1 scoring, and compliance mappings.
* **Threat Intelligence Mapping**: Maps vulnerabilities directly to **OWASP Top 10**, **MITRE ATT&CK** techniques, and **CWE IDs**, prioritizing findings for analysts.
* **Secure Authentication**: Implements a robust JWT-based authentication flow with protected React Router pathways and isolated user environments.
* **Modern Tech Stack**: 
  * **Backend**: FastAPI, SQLAlchemy (SQLite), Pytest, WebSockets.
  * **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
  * **DevOps**: Docker Compose, Nginx Reverse Proxy, GitHub Actions CI/CD Pipeline.

---

## 📋 High-Level Architecture

The platform is designed around a modern decoupled architecture:

1. **Vite/React Frontend**: Serves a highly responsive, styled Single Page Application (SPA). Communicates with the backend via REST (for CRUD/Auth) and WebSockets (for live scan streaming).
2. **FastAPI Backend**: Handles asynchronous network requests. The `ScanEngine` uses non-blocking sockets to perform network reconnaissance, stores findings in a relational database, and exposes them via secure endpoints.
3. **Nginx Proxy** *(Production)*: Routes traffic seamlessly between the React client and the Uvicorn ASGI server, resolving CORS in production setups.

---

## 🛠️ Quick Start (Docker)

The absolute easiest way to run the platform is using Docker Compose. This spins up the Nginx proxy, Frontend, and Backend automatically.

```bash
git clone https://github.com/your-username/aegissec.git
cd aegissec

# Copy environment variables
cp .env.example .env

# Build and spin up the containers
docker compose up --build
```
* **Frontend UI**: `http://localhost:8080`
* **API Documentation**: `http://localhost:8000/docs`

---

## 💻 Local Development Setup

If you prefer to run the servers locally for development:

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv .venv

# Activate Virtual Environment
# Windows:
.\.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```
*Backend runs on `http://localhost:8000`*

### 2. Frontend (Vite/React)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🧪 Testing & CI/CD

The repository includes a comprehensive GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`). On every push to `master`, it automatically:
1. Runs the `pytest` suite for backend validation.
2. Runs `npm run build` to ensure the TypeScript React app compiles successfully.
3. Builds the `docker-compose` images to verify production readiness.

To run tests locally:
```bash
cd backend
pytest tests/ -v
```

---
*Disclaimer: AegisSec is an educational project. It requires explicit user confirmation that they are authorized to assess a target before creating a scan. Only scan targets you explicitly own or have permission to test.*
