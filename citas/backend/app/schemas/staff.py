import uuid

from pydantic import BaseModel, EmailStr


class StaffCreate(BaseModel):
    name: str
    email: EmailStr | None = None
    phone: str | None = None
    is_active: bool = True


class StaffRead(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    name: str
    email: str | None
    phone: str | None
    is_active: bool

    model_config = {"from_attributes": True}


class StaffUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    is_active: bool | None = None
