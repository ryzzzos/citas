import uuid
from pathlib import Path
import httpx
from fastapi import HTTPException, Request, UploadFile, status

from app.core.config import settings

LOCAL_STORAGE_ROOT = Path(__file__).resolve().parents[2] / "storage"

ALLOWED_MIME_MAP = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}


def detect_real_mime(content: bytes) -> str | None:
    """
    Validates true file type by inspecting initial magic bytes.
    Prevents attackers from bypassing Content-Type header checks with executable or malicious files.
    """
    if len(content) < 12:
        return None

    # JPEG magic bytes: FF D8 FF
    if content.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"

    # PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"

    # WEBP magic bytes: RIFF .... WEBP
    if content.startswith(b"RIFF") and content[8:12] == b"WEBP":
        return "image/webp"

    return None


class StorageService:
    """
    Centralized Storage Service.
    Uploads images to Supabase Storage in production, or local filesystem in development.
    Standardized Bucket Structure: agenda-images/
      ├── businesses/{business_id}/logo-...
      ├── businesses/{business_id}/cover-...
      ├── services/{business_id}/{service_id}-...
      └── staff/{business_id}/{staff_id}/...
    """

    @staticmethod
    def generate_safe_filename(prefix: str, mime_type: str) -> str:
        """
        Generates a secure, unguessable filename based on UUID4.
        Ignores client-side original filenames to prevent path traversal attacks.
        """
        ext = ALLOWED_MIME_MAP.get(mime_type, "jpg")
        return f"{prefix}-{uuid.uuid4().hex}.{ext}"

    @staticmethod
    async def upload_image(
        file: UploadFile,
        folder_path: str,
        filename_prefix: str = "img",
        old_image_url: str | None = None,
        request: Request | None = None,
        max_bytes: int = 4 * 1024 * 1024,
    ) -> str:
        content = await file.read()
        if len(content) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Image size exceeds maximum limit of {max_bytes // (1024 * 1024)}MB",
            )

        # 1. Inspect real magic bytes (Item 15)
        real_mime = detect_real_mime(content)
        if not real_mime or real_mime not in ALLOWED_MIME_MAP:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Invalid image format. Only JPEG, PNG and WEBP files are allowed.",
            )

        # 2. Generate secure UUID filename (Item 16)
        safe_filename = StorageService.generate_safe_filename(filename_prefix, real_mime)
        object_path = f"{folder_path}/{safe_filename}".strip("/")

        # 3. Supabase Storage (Cloud / Production)
        if settings.supabase_url and settings.supabase_service_role_key:
            target_url = (
                f"{settings.supabase_url.rstrip('/')}/storage/v1/object/"
                f"{settings.supabase_storage_bucket}/{object_path}"
            )
            headers = {
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "apikey": settings.supabase_service_role_key,
                "Content-Type": real_mime,
                "x-upsert": "true",
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(target_url, content=content, headers=headers)
                if response.status_code not in (200, 201):
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Failed to upload image to Supabase Storage: {response.text}",
                    )

            # Delete old image ONLY AFTER new upload succeeds
            if old_image_url:
                await StorageService.delete_image(old_image_url)

            return (
                f"{settings.supabase_url.rstrip('/')}/storage/v1/object/public/"
                f"{settings.supabase_storage_bucket}/{object_path}"
            )

        # 4. In Production Mode, Local Storage Fallback is Strictly Prohibited
        if settings.app_env.strip().lower() == "production":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Production storage misconfiguration: Cloud storage credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are missing or disabled. Local filesystem fallback is prohibited in production.",
            )

        # 5. Local Storage Fallback (Offline Development Only)
        local_file_path = LOCAL_STORAGE_ROOT / object_path
        local_file_path.parent.mkdir(parents=True, exist_ok=True)
        local_file_path.write_bytes(content)

        # Delete old image ONLY AFTER new local save succeeds
        if old_image_url:
            await StorageService.delete_image(old_image_url)

        if request:
            return str(request.url_for("storage", path=object_path))
        return f"/storage/{object_path}"

    @staticmethod
    async def delete_image(image_url: str | None) -> None:
        """
        Deletes an image from Supabase Storage or local filesystem to prevent orphaned files.
        """
        if not image_url or not isinstance(image_url, str):
            return

        # 1. Supabase Storage Cleanup
        public_prefix = f"/storage/v1/object/public/{settings.supabase_storage_bucket}/"
        if settings.supabase_url and settings.supabase_service_role_key and public_prefix in image_url:
            object_path = image_url.split(public_prefix)[-1]
            target_url = (
                f"{settings.supabase_url.rstrip('/')}/storage/v1/object/"
                f"{settings.supabase_storage_bucket}/{object_path}"
            )
            headers = {
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "apikey": settings.supabase_service_role_key,
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                try:
                    await client.delete(target_url, headers=headers)
                except Exception:
                    pass  # Non-blocking best-effort cleanup

        # 2. Local File Cleanup
        elif "/storage/" in image_url:
            relative_path = image_url.split("/storage/")[-1]
            local_path = LOCAL_STORAGE_ROOT / relative_path
            if local_path.exists():
                local_path.unlink(missing_ok=True)
