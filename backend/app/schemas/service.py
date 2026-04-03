import uuid
from decimal import Decimal
from urllib.parse import urlparse

from pydantic import BaseModel, field_validator

MIN_SERVICE_NAME_LENGTH = 3
MAX_SERVICE_NAME_LENGTH = 120
MAX_DURATION_MINUTES = 720


class ServiceCreate(BaseModel):
    name: str
    description: str | None = None
    image_url: str | None = None
    duration_minutes: int
    price: Decimal
    is_active: bool = True

    @field_validator("duration_minutes")
    @classmethod
    def positive_duration(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("duration_minutes must be positive")
        if v > MAX_DURATION_MINUTES:
            raise ValueError(f"duration_minutes must be <= {MAX_DURATION_MINUTES}")
        return v

    @field_validator("name")
    @classmethod
    def valid_name(cls, v: str) -> str:
        name = v.strip()
        if len(name) < MIN_SERVICE_NAME_LENGTH:
            raise ValueError(f"name must have at least {MIN_SERVICE_NAME_LENGTH} characters")
        if len(name) > MAX_SERVICE_NAME_LENGTH:
            raise ValueError(f"name must have at most {MAX_SERVICE_NAME_LENGTH} characters")
        return name

    @field_validator("price")
    @classmethod
    def non_negative_price(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("price must be non-negative")
        return v

    @field_validator("image_url")
    @classmethod
    def valid_image_url(cls, v: str | None) -> str | None:
        if v is None:
            return v
        url = v.strip()
        if not url:
            return None
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("image_url must be a valid http or https URL")
        return url


class ServiceRead(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    name: str
    description: str | None
    image_url: str | None
    duration_minutes: int
    price: Decimal
    is_active: bool

    model_config = {"from_attributes": True}


class ServiceImageUploadRead(BaseModel):
    image_url: str


class ServiceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    image_url: str | None = None
    duration_minutes: int | None = None
    price: Decimal | None = None
    is_active: bool | None = None

    @field_validator("duration_minutes")
    @classmethod
    def positive_duration(cls, v: int | None) -> int | None:
        if v is None:
            return v
        if v <= 0:
            raise ValueError("duration_minutes must be positive")
        if v > MAX_DURATION_MINUTES:
            raise ValueError(f"duration_minutes must be <= {MAX_DURATION_MINUTES}")
        return v

    @field_validator("price")
    @classmethod
    def non_negative_price(cls, v: Decimal | None) -> Decimal | None:
        if v is None:
            return v
        if v < 0:
            raise ValueError("price must be non-negative")
        return v

    @field_validator("name")
    @classmethod
    def valid_name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        name = v.strip()
        if len(name) < MIN_SERVICE_NAME_LENGTH:
            raise ValueError(f"name must have at least {MIN_SERVICE_NAME_LENGTH} characters")
        if len(name) > MAX_SERVICE_NAME_LENGTH:
            raise ValueError(f"name must have at most {MAX_SERVICE_NAME_LENGTH} characters")
        return name

    @field_validator("image_url")
    @classmethod
    def valid_image_url(cls, v: str | None) -> str | None:
        if v is None:
            return v
        url = v.strip()
        if not url:
            return None
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("image_url must be a valid http or https URL")
        return url
