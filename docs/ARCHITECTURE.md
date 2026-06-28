# Architecture

```mermaid
flowchart LR
    UI["React + TypeScript UI"] --> API["FastAPI REST API"]
    UI --> WS["WebSocket Progress"]
    API --> Auth["JWT Auth + RBAC"]
    API --> Services["Application Services"]
    Services --> Engine["Modular Scan Engine"]
    Services --> Reports["Report Builder"]
    API --> DB[("SQLAlchemy Database")]
    Engine --> DB
    Reports --> DB
    API --> Audit["Audit Logging"]
```

## Backend Layers

- `api/routers`: HTTP and WebSocket endpoints.
- `schemas`: Pydantic request and response contracts.
- `models`: SQLAlchemy persistence models.
- `services`: business logic for audit, target validation, scan orchestration, and reports.
- `core`: configuration, security, and logging.

## Extension Point

Scanner integrations should implement the scan step protocol in `app/services/scan_engine.py`. This allows new scanners to be added without changing frontend API contracts.

