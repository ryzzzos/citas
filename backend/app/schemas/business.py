import uuid
from datetime import datetime
from typing import Literal
from urllib.parse import urlparse

from pydantic import BaseModel, EmailStr, field_validator, model_validator

from app.services.geocoding_service import (
    GEOCODING_STATUS_FAILED,
    GEOCODING_STATUS_MANUAL,
    GEOCODING_STATUS_PENDING,
    GEOCODING_STATUS_SUCCESS,
)

MAX_PUBLIC_BIO_LENGTH = 280
BusinessGeocodingStatus = Literal[
    GEOCODING_STATUS_PENDING,
    GEOCODING_STATUS_MANUAL,
    GEOCODING_STATUS_SUCCESS,
    GEOCODING_STATUS_FAILED,
]


def _normalize_slug(value: str) -> str:
    slug = value.strip().lower().replace("_", "-")
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-")


def _validate_url(value: str | None) -> str | None:
    if value is None:
        return value
    normalized = value.strip()
    if not normalized:
        return None
    parsed = urlparse(normalized)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("must be a valid http or https URL")
    return normalized


def _validate_coordinates(latitude: float | None, longitude: float | None) -> None:
    if (latitude is None) != (longitude is None):
        raise ValueError("latitude and longitude must be provided together")
    if latitude is not None and not -90 <= latitude <= 90:
        raise ValueError("latitude must be between -90 and 90")
    if longitude is not None and not -180 <= longitude <= 180:
        raise ValueError("longitude must be between -180 and 180")


class BusinessCreate(BaseModel):
    name: str
    description: str | None = None
    slug: str | None = None
    category: str
    phone: str
    whatsapp_phone: str | None = None
    email: EmailStr
    public_bio: str | None = None
    cover_image_url: str | None = None
    logo_image_url: str | None = None
    address: str
    city: str
    latitude: float | None = None
    longitude: float | None = None

    @field_validator("slug")
    @classmethod
    def valid_slug(cls, value: str | None) -> str | None:
        if value is None:
            return value
        normalized = _normalize_slug(value)
        if not normalized:
            return None
        allowed = set("abcdefghijklmnopqrstuvwxyz0123456789-")
        if any(char not in allowed for char in normalized):
            raise ValueError("slug must contain only lowercase letters, numbers and hyphens")
        if normalized.startswith("-") or normalized.endswith("-") or "--" in normalized:
            raise ValueError("slug format is invalid")
        return normalized

    @field_validator("whatsapp_phone")
    @classmethod
    def valid_whatsapp(cls, value: str | None) -> str | None:
        if value is None:
            return value
        normalized = value.strip()
        if not normalized:
            return None
        allowed = set("+0123456789 ()-")
        if any(char not in allowed for char in normalized):
            raise ValueError("whatsapp_phone has invalid characters")
        if len(normalized) < 8:
            raise ValueError("whatsapp_phone must have at least 8 characters")
        return normalized

    @field_validator("public_bio")
    @classmethod
    def valid_bio(cls, value: str | None) -> str | None:
        if value is None:
            return value
        normalized = value.strip()
        if not normalized:
            return None
        if len(normalized) > MAX_PUBLIC_BIO_LENGTH:
            raise ValueError(f"public_bio must be <= {MAX_PUBLIC_BIO_LENGTH} characters")
        return normalized

    @field_validator("cover_image_url", "logo_image_url")
    @classmethod
    def valid_image_urls(cls, value: str | None) -> str | None:
        return _validate_url(value)

    @model_validator(mode="after")
    def valid_coordinates(self) -> "BusinessCreate":
        _validate_coordinates(self.latitude, self.longitude)
        return self


class BusinessRead(BaseModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    name: str
    description: str | None
    slug: str
    category: str
    phone: str
    whatsapp_phone: str | None
    email: str
    public_bio: str | None
    cover_image_url: str | None
    logo_image_url: str | None
    address: str
    city: str
    latitude: float | None
    longitude: float | None
    geocoding_status: BusinessGeocodingStatus
    geocoding_error: str | None
    geocoded_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class BusinessUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    slug: str | None = None
    category: str | None = None
    phone: str | None = None
    whatsapp_phone: str | None = None
    email: EmailStr | None = None
    public_bio: str | None = None
    cover_image_url: str | None = None
    logo_image_url: str | None = None
    address: str | None = None
    city: str | None = None
    latitude: float | None = None
    longitude: float | None = None

    @field_validator("slug")
    @classmethod
    def valid_slug(cls, value: str | None) -> str | None:
        return BusinessCreate.valid_slug(value)

    @field_validator("whatsapp_phone")
    @classmethod
    def valid_whatsapp(cls, value: str | None) -> str | None:
        return BusinessCreate.valid_whatsapp(value)

    @field_validator("public_bio")
    @classmethod
    def valid_bio(cls, value: str | None) -> str | None:
        return BusinessCreate.valid_bio(value)

    @field_validator("cover_image_url", "logo_image_url")
    @classmethod
    def valid_image_urls(cls, value: str | None) -> str | None:
        return _validate_url(value)

    @model_validator(mode="after")
    def valid_coordinates(self) -> "BusinessUpdate":
        fields = self.model_fields_set
        latitude_set = "latitude" in fields
        longitude_set = "longitude" in fields

        if latitude_set != longitude_set:
            raise ValueError("latitude and longitude must be updated together")

        if latitude_set and longitude_set:
            _validate_coordinates(self.latitude, self.longitude)

        return self


class BusinessSlugAvailabilityRead(BaseModel):
    slug: str
    available: bool


class BusinessImageUploadRead(BaseModel):
    image_url: str


class BusinessMapPointRead(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    category: str
    city: str
    address: str
    latitude: float
    longitude: float
    public_bio: str | None
    logo_image_url: str | None
    cover_image_url: str | None
    geocoding_status: BusinessGeocodingStatus

    model_config = {"from_attributes": True}


class BusinessMapViewportRead(BaseModel):
    north: float
    south: float
    east: float
    west: float


class BusinessMapClusteringRead(BaseModel):
    enabled: bool
    strategy: Literal["frontend", "server"]
    recommended_radius: int


class BusinessMapResponseRead(BaseModel):
    items: list[BusinessMapPointRead]
    total: int
    limit: int
    offset: int
    has_more: bool
    viewport: BusinessMapViewportRead
    clustering: BusinessMapClusteringRead
