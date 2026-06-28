# AegisSec

AegisSec is an AI-assisted, zero-touch enterprise vulnerability assessment and security operations platform for authorized security assessments only.

This first milestone provides a production-oriented full-stack scaffold:

- FastAPI backend with JWT authentication, RBAC, SQLAlchemy models, Alembic scaffold, rate limiting, audit logging, profile/settings APIs, scan management, WebSocket progress, and report generation.
- React + TypeScript frontend shell with responsive dashboard, scan creation panel, and live-progress visual structure.
- Docker Compose, Nginx reverse proxy configuration, environment configuration, and focused backend tests.

## Quick Start

```bash
cp .env.example .env
docker compose up --build
```

Services:

- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs
- Frontend through Nginx: http://localhost:8080

## Local Backend Development

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
pytest
```

## Security Boundary

AegisSec requires explicit user confirmation that they are authorized to assess a target before creating a scan. The initial scan engine uses safe simulated assessment phases and a modular interface so real, approved scanners can be integrated later behind the same service boundary.
