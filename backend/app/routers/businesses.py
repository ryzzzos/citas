import uuid
from pathlib import Path
import re
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_business_owner
from app.models.business import Business
from app.models.user import User
from app.schemas.business import (
    BusinessCreate,
    BusinessImageUploadRead,
    BusinessMapResponseRead,
    BusinessRead,
    BusinessSlugAvailabilityRead,
    BusinessUpdate,
)
from app.services.geocoding_service import (
    GEOCODING_STATUS_FAILED,
    GEOCODING_STATUS_MANUAL,
    GEOCODING_STATUS_SUCCESS,
    geocode_business_location,
)

router = APIRouter()

RESERVED_BUSINESS_SLUGS = {
    "admin",
    "api",
    "auth",
    "bookings",
    "businesses",
    "dashboard",
    "help",
    "home",
    "login",
    "logout",
    "onboarding",
    "pricing",
    "register",
    "services",
    "settings",
    "staff",
    "sucursales",
    "support",
    "terms",
}
SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
MAX_BUSINESS_IMAGE_BYTES = 4 * 1024 * 1024
ALLOWED_BUSINESS_IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}
BUSINESS_IMAGE_ROOT = Path(__file__).resolve().parents[2] / "storage" / "business-images"


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return slug or "business"


def _normalize_slug(value: str) -> str:
    normalized = value.strip().lower().replace("_", "-")
    while "--" in normalized:
        normalized = normalized.replace("--", "-")
    return normalized.strip("-")


def _validate_slug_rules(value: str) -> str:
    normalized = _normalize_slug(value)
    if not normalized:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="slug is required")
    if normalized in RESERVED_BUSINESS_SLUGS:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="slug is reserved")
    if not SLUG_PATTERN.fullmatch(normalized):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="slug must contain only lowercase letters, numbers and hyphens",
        )
    return normalized


def _slug_exists(slug: str, db: Session, exclude_business_id: uuid.UUID | None = None) -> bool:
    query = db.query(Business).filter(func.lower(Business.slug) == slug)
    if exclude_business_id:
        query = query.filter(Business.id != exclude_business_id)
    return db.query(query.exists()).scalar() is True


def _build_unique_slug(seed: str, db: Session, exclude_business_id: uuid.UUID | None = None) -> str:
    base = _validate_slug_rules(seed)
    candidate = base
    suffix = 1
    while _slug_exists(candidate, db, exclude_business_id=exclude_business_id):
        candidate = f"{base}-{suffix}"
        suffix += 1
    return candidate


def _apply_manual_coordinates(payload: dict[str, Any]) -> None:
    payload["geocoding_status"] = GEOCODING_STATUS_MANUAL
    payload["geocoding_error"] = None
    payload["geocoded_at"] = None


def _apply_geocoding(payload: dict[str, Any], *, name: str, address: str, city: str) -> None:
    result = geocode_business_location(name=name, address=address, city=city)

    payload["geocoding_status"] = result.status
    payload["geocoding_error"] = result.error

    if result.status == GEOCODING_STATUS_SUCCESS:
        payload["latitude"] = result.latitude
        payload["longitude"] = result.longitude
        payload["geocoded_at"] = datetime.now(timezone.utc)
        return

    payload["latitude"] = None
    payload["longitude"] = None
    payload["geocoded_at"] = None


def _effective_value(updates: dict[str, Any], key: str, current_value: Any) -> Any:
    if key in updates:
        return updates[key]
    return current_value


def _get_owned_business(business_id: uuid.UUID, current_user: User, db: Session) -> Business:
    business = db.get(Business, business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    if business.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return business


def _business_image_path(business_id: uuid.UUID, filename: str) -> Path:
    target_dir = BUSINESS_IMAGE_ROOT / str(business_id)
    target_dir.mkdir(parents=True, exist_ok=True)
    return target_dir / filename


async def _upload_business_image(
    request: Request,
    business: Business,
    file: UploadFile,
    kind: str,
) -> str:
    if file.content_type not in ALLOWED_BUSINESS_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG, PNG and WEBP images are allowed",
        )

    ext = ALLOWED_BUSINESS_IMAGE_TYPES[file.content_type]
    final_name = f"{kind}-{uuid.uuid4().hex[:12]}.{ext}"
    target_path = _business_image_path(business.id, final_name)
    written = 0

    try:
        with target_path.open("wb") as destination:
            while chunk := await file.read(1024 * 256):
                written += len(chunk)
                if written > MAX_BUSINESS_IMAGE_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="Image size must be 4MB or smaller",
                    )
                destination.write(chunk)
    except HTTPException:
        if target_path.exists():
            target_path.unlink(missing_ok=True)
        raise
    finally:
        await file.close()

    return str(request.url_for("storage", path=f"business-images/{business.id}/{final_name}"))


@router.post("/", response_model=BusinessRead, status_code=201)
def create_business(
    data: BusinessCreate,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    existing_business = db.query(Business).filter(Business.owner_id == current_user.id).first()
    if existing_business:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Business profile already exists",
        )

    payload = data.model_dump()
    requested_slug = payload.pop("slug", None)
    slug_seed = requested_slug or _slugify(payload["name"])
    payload["slug"] = _build_unique_slug(slug_seed, db)

    coordinates_provided = payload.get("latitude") is not None and payload.get("longitude") is not None
    if coordinates_provided:
        _apply_manual_coordinates(payload)
    else:
        _apply_geocoding(
            payload,
            name=payload["name"],
            address=payload["address"],
            city=payload["city"],
        )

    business = Business(**payload, owner_id=current_user.id)
    db.add(business)
    db.commit()
    db.refresh(business)
    return business


@router.get("/slug/availability", response_model=BusinessSlugAvailabilityRead)
def check_business_slug_availability(
    slug: str = Query(..., min_length=2, max_length=90),
    exclude_business_id: uuid.UUID | None = Query(default=None),
    db: Session = Depends(get_db),
):
    normalized = _validate_slug_rules(slug)
    available = not _slug_exists(normalized, db, exclude_business_id=exclude_business_id)
    return {"slug": normalized, "available": available}


@router.get("/slug/{slug}", response_model=BusinessRead)
def get_business_by_slug(slug: str, db: Session = Depends(get_db)):
    normalized = _validate_slug_rules(slug)
    business = db.query(Business).filter(func.lower(Business.slug) == normalized).first()
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    return business


@router.get("/map", response_model=BusinessMapResponseRead)
def list_businesses_for_map(
    north: float = Query(..., ge=-90, le=90),
    south: float = Query(..., ge=-90, le=90),
    east: float = Query(..., ge=-180, le=180),
    west: float = Query(..., ge=-180, le=180),
    city: str | None = Query(default=None),
    category: str | None = Query(default=None),
    limit: int = Query(default=200, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    if north <= south:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="north must be greater than south",
        )
    if east == west:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="east and west cannot be equal",
        )

    query = db.query(Business).filter(Business.latitude.is_not(None), Business.longitude.is_not(None))
    query = query.filter(Business.latitude <= north, Business.latitude >= south)

    if east > west:
        query = query.filter(Business.longitude >= west, Business.longitude <= east)
    else:
        # Support anti-meridian viewports where east wraps around the globe.
        query = query.filter(or_(Business.longitude >= west, Business.longitude <= east))

    if city:
        query = query.filter(Business.city.ilike(f"%{city}%"))
    if category:
        query = query.filter(Business.category.ilike(f"%{category}%"))

    total = query.count()
    businesses = query.order_by(Business.created_at.desc()).offset(offset).limit(limit).all()

    items = [
        {
            "id": business.id,
            "slug": business.slug,
            "name": business.name,
            "category": business.category,
            "city": business.city,
            "address": business.address,
            "latitude": float(business.latitude),
            "longitude": float(business.longitude),
            "public_bio": business.public_bio,
            "logo_image_url": business.logo_image_url,
            "cover_image_url": business.cover_image_url,
            "geocoding_status": business.geocoding_status,
        }
        for business in businesses
        if business.latitude is not None and business.longitude is not None
    ]

    return {
        "items": items,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": offset + len(items) < total,
        "viewport": {
            "north": north,
            "south": south,
            "east": east,
            "west": west,
        },
        "clustering": {
            "enabled": True,
            "strategy": "frontend",
            "recommended_radius": 60,
        },
    }


@router.get("/", response_model=list[BusinessRead])
def list_businesses(
    city: str | None = None,
    category: str | None = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(Business)
    if city:
        query = query.filter(Business.city.ilike(f"%{city}%"))
    if category:
        query = query.filter(Business.category.ilike(f"%{category}%"))
    return query.offset(skip).limit(limit).all()


@router.get("/me", response_model=BusinessRead)
def get_my_business(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ("business_owner", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Business owner role required")

    business = db.query(Business).filter(Business.owner_id == current_user.id).first()
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not created",
        )
    return business


@router.get("/{business_id}", response_model=BusinessRead)
def get_business(business_id: uuid.UUID, db: Session = Depends(get_db)):
    business = db.get(Business, business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    return business


@router.patch("/{business_id}", response_model=BusinessRead)
def update_business(
    business_id: uuid.UUID,
    data: BusinessUpdate,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    business = _get_owned_business(business_id, current_user, db)
    updates = data.model_dump(exclude_unset=True)

    if "slug" in updates:
        slug_value = updates["slug"]
        if slug_value:
            normalized_slug = _validate_slug_rules(slug_value)
            if _slug_exists(normalized_slug, db, exclude_business_id=business.id):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="slug is not available")
            updates["slug"] = normalized_slug
        else:
            updates["slug"] = _build_unique_slug(_slugify(updates.get("name") or business.name), db, business.id)

    coordinates_provided = (
        "latitude" in updates
        and "longitude" in updates
        and updates["latitude"] is not None
        and updates["longitude"] is not None
    )
    latitude_in_updates = "latitude" in updates
    longitude_in_updates = "longitude" in updates
    location_data_changed = any(field in updates for field in ("name", "address", "city"))

    if coordinates_provided:
        _apply_manual_coordinates(updates)
    else:
        effective_latitude = _effective_value(updates, "latitude", business.latitude)
        effective_longitude = _effective_value(updates, "longitude", business.longitude)
        should_regeocode = (
            (location_data_changed and not latitude_in_updates and not longitude_in_updates)
            or effective_latitude is None
            or effective_longitude is None
        )

        if should_regeocode:
            _apply_geocoding(
                updates,
                name=_effective_value(updates, "name", business.name),
                address=_effective_value(updates, "address", business.address),
                city=_effective_value(updates, "city", business.city),
            )

    for field, value in updates.items():
        setattr(business, field, value)
    db.commit()
    db.refresh(business)
    return business


@router.post("/{business_id}/cover-image", response_model=BusinessImageUploadRead, status_code=201)
async def upload_business_cover_image(
    business_id: uuid.UUID,
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    business = _get_owned_business(business_id, current_user, db)
    image_url = await _upload_business_image(request, business, file, kind="cover")
    business.cover_image_url = image_url
    db.commit()
    return {"image_url": image_url}


@router.post("/{business_id}/logo-image", response_model=BusinessImageUploadRead, status_code=201)
async def upload_business_logo_image(
    business_id: uuid.UUID,
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    business = _get_owned_business(business_id, current_user, db)
    image_url = await _upload_business_image(request, business, file, kind="logo")
    business.logo_image_url = image_url
    db.commit()
    return {"image_url": image_url}


@router.delete("/{business_id}", status_code=204)
def delete_business(
    business_id: uuid.UUID,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    business = _get_owned_business(business_id, current_user, db)
    db.delete(business)
    db.commit()
