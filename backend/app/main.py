from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import auth, dashboard, logs, profile, reports, scans, settings as settings_router, users
from app.core.config import settings
from app.core.logging import configure_logging
from app.core.rate_limit import InMemoryRateLimitMiddleware
from app.db.session import Base, engine


def create_app() -> FastAPI:
    configure_logging()
    Base.metadata.create_all(bind=engine)

    app = FastAPI(
        title="AegisSec API",
        description="Authorized security assessment operations platform.",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(InMemoryRateLimitMiddleware)

    app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(users.router, prefix="/api/users", tags=["users"])
    app.include_router(scans.router, prefix="/api/scans", tags=["scans"])
    app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
    app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
    app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
    app.include_router(settings_router.router, prefix="/api/settings", tags=["settings"])
    app.include_router(logs.router, prefix="/api/logs", tags=["logs"])

    @app.get("/health", tags=["health"])
    def health() -> dict[str, str]:
        return {"status": "ok", "service": "aegissec-api"}

    return app


app = create_app()
