from __future__ import annotations

from datetime import datetime, timezone

from app.database import SessionLocal
from app.models.business import Business
from app.services.geocoding_service import geocode_business_location


def main() -> None:
    session = SessionLocal()

    try:
        pending = (
            session.query(Business)
            .filter((Business.latitude.is_(None)) | (Business.longitude.is_(None)))
            .all()
        )

        updated = 0
        still_missing = 0

        for business in pending:
            result = geocode_business_location(
                name=business.name,
                address=business.address,
                city=business.city,
            )

            business.geocoding_status = result.status
            business.geocoding_error = result.error

            if result.latitude is not None and result.longitude is not None:
                business.latitude = result.latitude
                business.longitude = result.longitude
                business.geocoded_at = datetime.now(timezone.utc)
                updated += 1
            else:
                business.latitude = None
                business.longitude = None
                business.geocoded_at = None
                still_missing += 1

        session.commit()

        print(f"Backfill finished. updated_with_coordinates={updated} still_missing={still_missing}")
        for business in pending:
            print(
                "- {name} | status={status} | lat={lat} lng={lng} | error={error}".format(
                    name=business.name,
                    status=business.geocoding_status,
                    lat=business.latitude,
                    lng=business.longitude,
                    error=business.geocoding_error,
                )
            )
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    main()
