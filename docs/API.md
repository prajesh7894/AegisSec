# API Documentation

Interactive OpenAPI docs are available at `/docs` when the backend is running.

Initial endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `POST /api/scans`
- `GET /api/scans`
- `GET /api/scans/{scan_id}`
- `POST /api/scans/{scan_id}/cancel`
- `POST /api/scans/{scan_id}/duplicate`
- `DELETE /api/scans/{scan_id}`
- `WS /api/scans/{scan_id}/ws`
- `POST /api/reports/{scan_id}/{report_format}`
- `GET /api/reports/{report_id}`
- `GET /api/profile`
- `PATCH /api/profile`
- `GET /api/settings`
- `GET /api/logs`
