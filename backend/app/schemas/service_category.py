from typing import Optional
import uuid
from pydantic import BaseModel, Field


class ServiceCategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    position: Optional[int] = 0


class ServiceCategoryCreate(ServiceCategoryBase):
    pass


class ServiceCategoryUpdate(ServiceCategoryBase):
    name: Optional[str] = Field(None, max_length=100)
    position: Optional[int] = None


class ServiceCategoryRead(ServiceCategoryBase):
    id: uuid.UUID
    business_id: uuid.UUID

    class Config:
        from_attributes = True

class ServiceCategoryReorder(BaseModel):
    id: uuid.UUID
    position: int
