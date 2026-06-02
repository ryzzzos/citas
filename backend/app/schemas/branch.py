import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, field_validator, model_validator

from app.services.geocoding_service import (
    GEOCODING_STATUS_FAILED,
    GEOCODING_STATUS_MANUAL,
    GEOCODING_STATUS_PENDING,
    GEOCODING_STATUS_SUCCESS,
)

BranchGeocodingStatus = Literal[
    GEOCODING_STATUS_PENDING,
    GEOCODING_STATUS_MANUAL,
    GEOCODING_STATUS_SUCCESS,
    GEOCODING_STATUS_FAILED,
]

def _validate_coordinates(latitude: float | None, longitude: float | None) -> None:
    if (latitude is None) != (longitude is None):
        raise ValueError("latitude and longitude must be provided together")
    if latitude is not None and not -90 <= latitude <= 90:
        raise ValueError("latitude must be between -90 and 90")
    if longitude is not None and not -180 <= longitude <= 180:
        raise ValueError("longitude must be between -180 and 180")

class BranchCreate(BaseModel):
    name: str
    address: str
    city: str
    phone: str
    whatsapp_phone: str | None = None
    is_active: bool = True
    latitude: float | None = None
    longitude: float | None = None

    @model_validator(mode="after")
    def valid_coordinates(self) -> "BranchCreate":
        _validate_coordinates(self.latitude, self.longitude)
        return self

class BranchRead(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    name: str
    address: str
    city: str
    phone: str
    whatsapp_phone: str | None
    is_active: bool
    latitude: float | None
    longitude: float | None
    geocoding_status: BranchGeocodingStatus
    geocoding_error: str | None
    geocoded_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}

class BranchUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    city: str | None = None
    phone: str | None = None
    whatsapp_phone: str | None = None
    is_active: bool | None = None
    latitude: float | None = None
    longitude: float | None = None

    @model_validator(mode="after")
    def valid_coordinates(self) -> "BranchUpdate":
        fields = self.model_fields_set
        latitude_set = "latitude" in fields
        longitude_set = "longitude" in fields

        if latitude_set != longitude_set:
            raise ValueError("latitude and longitude must be updated together")

        if latitude_set and longitude_set:
            _validate_coordinates(self.latitude, self.longitude)

        return self
