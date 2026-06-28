# Installation Guide

1. Install Docker Desktop.
2. Copy `.env.example` to `.env`.
3. Replace `JWT_SECRET_KEY` with a long random value.
4. Run:

```bash
docker compose up --build
```

Open http://localhost:8080 for the frontend and http://localhost:8000/docs for API documentation.

