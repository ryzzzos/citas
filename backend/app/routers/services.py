import uuid
from pathlib import Path
import re

from fastapi import APIRouter, Depends, File, Header, HTTPException, Query, Request, UploadFile, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_business_owner
from app.core.security import decode_access_token
from app.models.business import Business
from app.models.service import Service
from app.models.user import User
from app.schemas.service import ServiceCreate, ServiceImageUploadRead, ServiceRead, ServiceUpdate

router = APIRouter()

MAX_SERVICE_IMAGE_BYTES = 2 * 1024 * 1024
ALLOWED_SERVICE_IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}
SERVICE_IMAGE_ROOT = Path(__file__).resolve().parents[2] / "storage" / "service-images"


def _slugify_filename(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return slug or "service-image"


def _service_image_path(business_id: uuid.UUID, filename: str) -> Path:
    target_dir = SERVICE_IMAGE_ROOT / str(business_id)
    target_dir.mkdir(parents=True, exist_ok=True)
    return target_dir / filename


def _get_owned_business(business_id: uuid.UUID, current_user: User, db: Session) -> Business:
    business = db.get(Business, business_id)
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    if business.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return business


@router.post("/{business_id}/services", response_model=ServiceRead, status_code=201)
def create_service(
    business_id: uuid.UUID,
    data: ServiceCreate,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    _get_owned_business(business_id, current_user, db)
    service = Service(**data.model_dump(), business_id=business_id)
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


from app.services.storage_service import StorageService


@router.post("/{business_id}/image", response_model=ServiceImageUploadRead, status_code=201)
async def upload_service_image(
    request: Request,
    business_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    _get_owned_business(business_id, current_user, db)

    folder_path = f"services/{business_id}"
    image_url = await StorageService.upload_image(
        file=file,
        folder_path=folder_path,
        filename_prefix="service",
        request=request,
        max_bytes=MAX_SERVICE_IMAGE_BYTES,
    )
    return {"image_url": image_url}


@router.get("/{business_id}/services", response_model=list[ServiceRead])
def list_services(
    business_id: uuid.UUID,
    include_inactive: bool = Query(default=False),
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Service).filter(Service.business_id == business_id)

    if include_inactive:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to include inactive services",
            )

        token = authorization.removeprefix("Bearer ").strip()
        user_id = decode_access_token(token)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )

        current_user = db.get(User, uuid.UUID(user_id))
        if not current_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        _get_owned_business(business_id, current_user, db)
    else:
        query = query.filter(Service.is_active.is_(True))

    return query.order_by(Service.name.asc()).all()


@router.patch("/{business_id}/services/{service_id}", response_model=ServiceRead)
def update_service(
    business_id: uuid.UUID,
    service_id: uuid.UUID,
    data: ServiceUpdate,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    _get_owned_business(business_id, current_user, db)
    service = db.get(Service, service_id)
    if not service or service.business_id != business_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    db.commit()
    db.refresh(service)
    return service


@router.delete("/{business_id}/services/{service_id}", status_code=204)
async def delete_service(
    business_id: uuid.UUID,
    service_id: uuid.UUID,
    current_user: User = Depends(require_business_owner),
    db: Session = Depends(get_db),
):
    _get_owned_business(business_id, current_user, db)
    service = db.get(Service, service_id)
    if not service or service.business_id != business_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    if service.image_url:
        await StorageService.delete_image(service.image_url)
    db.delete(service)
    db.commit()
