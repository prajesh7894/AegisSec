# Deployment Guide

## Container Deployment

Use Docker Compose as the baseline deployment:

```bash
docker compose up --build -d
```

For production:

- Use PostgreSQL instead of SQLite.
- Set a strong `JWT_SECRET_KEY`.
- Terminate TLS at the edge or in Nginx.
- Configure backups and log retention.
- Restrict allowed CORS origins.
- Store secrets in a managed secret store.

