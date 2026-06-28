# Developer Guide

## Backend

Run tests:

```bash
cd backend
pytest
```

Run API:

```bash
uvicorn app.main:app --reload
```

Create a migration:

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Coding Standards

- Use type hints for Python code.
- Keep routers thin and business logic in services.
- Validate targets before creating scans.
- Record user actions in audit logs.
- Do not integrate active scanners unless assessment authorization and scope controls are in place.
