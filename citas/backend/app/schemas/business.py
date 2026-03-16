import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class BusinessCreate(BaseModel):
    name: str
    description: str | None = None
    category: str
    phone: str
    email: EmailStr
    address: str
    city: str
    latitude: float | None = None
    longitude: float | None = None


class BusinessRead(BaseModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    name: str
    description: str | None
    category: str
    phone: str
    email: str
    address: str
    city: str
    latitude: float | None
    longitude: float | None
    created_at: datetime

    model_config = {"from_attributes": True}


class BusinessUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None
