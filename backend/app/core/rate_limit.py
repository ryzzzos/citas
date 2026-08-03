import time
from collections import defaultdict
from fastapi import HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Lightweight, in-memory sliding window rate limiter for sensitive endpoints.
    Protects login, register, demo-login, booking creation, and image uploads from brute-force/abuse.
    Zero external dependencies (no Redis required for Render Free Tier).
    """

    def __init__(self, app, max_requests: int = 10, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.history: dict[str, list[float]] = defaultdict(list)
        
        # Protected endpoints prefix paths
        self.protected_paths = {
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/demo-login",
            "/api/v1/bookings/",
        }

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        is_protected = path in self.protected_paths or "/image" in path

        if request.method == "POST" and is_protected:
            forwarded_for = request.headers.get("x-forwarded-for")
            if forwarded_for:
                client_ip = forwarded_for.split(",")[0].strip()
            else:
                client_ip = request.client.host if request.client else "127.0.0.1"

            now = time.time()
            window_start = now - self.window_seconds

            # Filter out timestamps outside current window
            timestamps = [t for t in self.history[client_ip] if t > window_start]
            self.history[client_ip] = timestamps

            if len(timestamps) >= self.max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please slow down and try again in a minute.",
                )

            self.history[client_ip].append(now)

        return await call_next(request)
