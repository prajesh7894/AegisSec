import time
from collections import defaultdict, deque
from collections.abc import Awaitable, Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings


class InMemoryRateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: object) -> None:
        super().__init__(app)
        self.requests: dict[str, deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        if request.url.path == "/health":
            return await call_next(request)

        client = request.client.host if request.client else "unknown"
        now = time.monotonic()
        window_start = now - 60
        bucket = self.requests[client]
        while bucket and bucket[0] < window_start:
            bucket.popleft()

        if len(bucket) >= settings.rate_limit_per_minute:
            return Response(content="Rate limit exceeded.", status_code=429)

        bucket.append(now)
        return await call_next(request)

