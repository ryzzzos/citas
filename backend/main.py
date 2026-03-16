from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, users, businesses, services, staff, schedules, bookings

app = FastAPI(
    title="Agenda Web API",
    description="SaaS appointment management platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(businesses.router, prefix="/api/v1/businesses", tags=["businesses"])
app.include_router(services.router, prefix="/api/v1/services", tags=["services"])
app.include_router(staff.router, prefix="/api/v1/staff", tags=["staff"])
app.include_router(schedules.router, prefix="/api/v1/schedules", tags=["schedules"])
app.include_router(bookings.router, prefix="/api/v1/bookings", tags=["bookings"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
