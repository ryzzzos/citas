import uuid

from pydantic import BaseModel, EmailStr


class StaffCreate(BaseModel):
    name: str
    branch_id: uuid.UUID
    email: EmailStr | None = None
    phone: str | None = None
    photo_url: str | None = None
    is_active: bool = True
    service_ids: list[uuid.UUID] = []


class StaffRead(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    branch_id: uuid.UUID
    name: str
    email: str | None
    phone: str | None
    photo_url: str | None = None
    is_active: bool
    service_ids: list[uuid.UUID] = []

    model_config = {"from_attributes": True}


class StaffUpdate(BaseModel):
    name: str | None = None
    branch_id: uuid.UUID | None = None
    email: EmailStr | None = None
    phone: str | None = None
    photo_url: str | None = None
    is_active: bool | None = None
    service_ids: list[uuid.UUID] | None = None
