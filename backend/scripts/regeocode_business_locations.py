from __future__ import annotations

from datetime import datetime, timezone

from app.database import SessionLocal
from app.models.business import Business
from app.services.geocoding_service import geocode_business_location


def main() -> None:
    session = SessionLocal()

    try:
        businesses = session.query(Business).all()
        updated = 0

        for business in businesses:
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
            else:
                business.latitude = None
                business.longitude = None
                business.geocoded_at = None

            updated += 1

        session.commit()

        print(f"Regeocoding completed. businesses_processed={updated}")
        for business in businesses:
            print(
                "- {name} | {city} | {address} | status={status} | lat={lat} lng={lng}".format(
                    name=business.name,
                    city=business.city,
                    address=business.address,
                    status=business.geocoding_status,
                    lat=business.latitude,
                    lng=business.longitude,
                )
            )
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    main()
