from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import func

from app.core.security import hash_password
from app.database import SessionLocal
from app.models.business import Business
from app.models.user import User
from app.services.geocoding_service import (
    GEOCODING_STATUS_MANUAL,
    GEOCODING_STATUS_SUCCESS,
    geocode_business_location,
)

DEFAULT_OWNER_PASSWORD = "Demo1234!"


@dataclass(frozen=True)
class SeedOwner:
    name: str
    email: str
    phone: str


@dataclass(frozen=True)
class SeedBusiness:
    owner: SeedOwner
    name: str
    slug: str
    category: str
    phone: str
    whatsapp_phone: str
    email: str
    description: str
    public_bio: str
    address: str
    city: str
    cover_image_url: str
    logo_image_url: str


SEED_BUSINESSES: list[SeedBusiness] = [
    SeedBusiness(
        owner=SeedOwner("Valentina Rojas", "owner.barberia.norte@agenda-demo.co", "+57 301 611 1101"),
        name="Barberia Centro Norte",
        slug="barberia-centro-norte",
        category="Barberia",
        phone="+57 604 322 1101",
        whatsapp_phone="+57 301 611 1101",
        email="contacto@barberiacentronorte.co",
        description="Barberia urbana con enfoque en cortes clasicos y cuidado de barba.",
        public_bio="Atendemos con reserva previa, productos premium y asesoria personalizada.",
        address="Carrera 70 #45E-10, Laureles",
        city="Medellin",
        cover_image_url="https://placehold.co/1280x720/png?text=Barberia+Centro+Norte",
        logo_image_url="https://placehold.co/300x300/png?text=BCN",
    ),
    SeedBusiness(
        owner=SeedOwner("Javier Mena", "owner.estetica.aura@agenda-demo.co", "+57 302 622 2202"),
        name="Estetica Aura Laureles",
        slug="estetica-aura-laureles",
        category="Salon de belleza",
        phone="+57 604 311 2202",
        whatsapp_phone="+57 302 622 2202",
        email="hola@auralaureles.co",
        description="Centro de estetica integral con tratamientos faciales y capilares.",
        public_bio="Cabinas privadas, protocolos de higiene y equipos de ultima generacion.",
        address="Circular 3 #70-45, Laureles",
        city="Medellin",
        cover_image_url="https://placehold.co/1280x720/png?text=Estetica+Aura+Laureles",
        logo_image_url="https://placehold.co/300x300/png?text=AURA",
    ),
    SeedBusiness(
        owner=SeedOwner("Camila Soto", "owner.spa.bosque@agenda-demo.co", "+57 303 633 3303"),
        name="Spa Bosque Envigado",
        slug="spa-bosque-envigado",
        category="Spa",
        phone="+57 604 334 3303",
        whatsapp_phone="+57 303 633 3303",
        email="reservas@spabosque.co",
        description="Spa boutique enfocado en relajacion profunda y terapias corporales.",
        public_bio="Circuitos termales, masajes descontracturantes y rituales de bienestar.",
        address="Calle 30 Sur #43A-57, Zona Centro",
        city="Envigado",
        cover_image_url="https://placehold.co/1280x720/png?text=Spa+Bosque+Envigado",
        logo_image_url="https://placehold.co/300x300/png?text=SPA",
    ),
    SeedBusiness(
        owner=SeedOwner("Matias Perez", "owner.clinica.sonrisa@agenda-demo.co", "+57 304 644 4404"),
        name="Clinica Sonrisa Bello",
        slug="clinica-sonrisa-bello",
        category="Clinica dental",
        phone="+57 604 355 4404",
        whatsapp_phone="+57 304 644 4404",
        email="agenda@clinicasonrisabello.co",
        description="Clinica odontologica familiar con agenda digital y urgencias coordinadas.",
        public_bio="Odontologia general, ortodoncia y estetica dental para adultos y ninos.",
        address="Carrera 50 #52-18, Centro",
        city="Bello",
        cover_image_url="https://placehold.co/1280x720/png?text=Clinica+Sonrisa+Bello",
        logo_image_url="https://placehold.co/300x300/png?text=SONRISA",
    ),
    SeedBusiness(
        owner=SeedOwner("Renata Alarcon", "owner.kine.andina@agenda-demo.co", "+57 305 655 5505"),
        name="Kine Andina Sabaneta",
        slug="kine-andina-sabaneta",
        category="Kinesiologia",
        phone="+57 604 366 5505",
        whatsapp_phone="+57 305 655 5505",
        email="contacto@kineandina.co",
        description="Centro de rehabilitacion musculo-esqueletica y terapia deportiva.",
        public_bio="Evaluacion funcional, planes personalizados y seguimiento clinico continuo.",
        address="Calle 68 Sur #43A-120, Parque Sabaneta",
        city="Sabaneta",
        cover_image_url="https://placehold.co/1280x720/png?text=Kine+Andina+Sabaneta",
        logo_image_url="https://placehold.co/300x300/png?text=KINE",
    ),
]


CITY_FALLBACK_COORDS: dict[str, tuple[float, float]] = {
    "medellin": (6.2442, -75.5812),
    "envigado": (6.1700, -75.5874),
    "bello": (6.3373, -75.5579),
    "sabaneta": (6.1515, -75.6166),
    "itagui": (6.1719, -75.6114),
}


def resolve_coordinates(name: str, address: str, city: str) -> tuple[float | None, float | None, str, str | None, datetime | None]:
    geocoding = geocode_business_location(name=name, address=address, city=city)

    if geocoding.status == GEOCODING_STATUS_SUCCESS and geocoding.latitude is not None and geocoding.longitude is not None:
        return (
            geocoding.latitude,
            geocoding.longitude,
            geocoding.status,
            None,
            datetime.now(timezone.utc),
        )

    city_key = city.strip().lower()
    fallback = CITY_FALLBACK_COORDS.get(city_key)
    if fallback is not None:
        return (
            fallback[0],
            fallback[1],
            GEOCODING_STATUS_MANUAL,
            f"city_fallback:{geocoding.error or 'geocoding_no_results'}",
            datetime.now(timezone.utc),
        )

    return (None, None, geocoding.status, geocoding.error, None)


def upsert_owner(session, owner_data: SeedOwner) -> User:
    owner = (
        session.query(User)
        .filter(func.lower(User.email) == owner_data.email.lower())
        .one_or_none()
    )

    if owner is None:
        owner = User(
            name=owner_data.name,
            email=owner_data.email.lower(),
            phone=owner_data.phone,
            role="business_owner",
            password_hash=hash_password(DEFAULT_OWNER_PASSWORD),
        )
        session.add(owner)
        session.flush()
        return owner

    owner.name = owner_data.name
    owner.phone = owner_data.phone
    owner.role = "business_owner"
    if not owner.password_hash:
        owner.password_hash = hash_password(DEFAULT_OWNER_PASSWORD)

    return owner


def upsert_business(session, owner: User, data: SeedBusiness) -> Business:
    business = session.query(Business).filter(Business.owner_id == owner.id).one_or_none()
    if business is None:
        business = (
            session.query(Business)
            .filter(func.lower(Business.slug) == data.slug.lower())
            .one_or_none()
        )

    latitude, longitude, geocoding_status, geocoding_error, geocoded_at = resolve_coordinates(
        name=data.name,
        address=data.address,
        city=data.city,
    )

    values = {
        "name": data.name,
        "slug": data.slug,
        "category": data.category,
        "phone": data.phone,
        "whatsapp_phone": data.whatsapp_phone,
        "email": data.email,
        "description": data.description,
        "public_bio": data.public_bio,
        "address": data.address,
        "city": data.city,
        "cover_image_url": data.cover_image_url,
        "logo_image_url": data.logo_image_url,
        "latitude": latitude,
        "longitude": longitude,
        "geocoding_status": geocoding_status,
        "geocoding_error": geocoding_error,
        "geocoded_at": geocoded_at,
    }

    if business is None:
        business = Business(owner_id=owner.id, **values)
        session.add(business)
        session.flush()
        return business

    business.owner_id = owner.id
    for key, value in values.items():
        setattr(business, key, value)

    return business


def main() -> None:
    session = SessionLocal()
    created_or_updated: list[Business] = []

    try:
        for entry in SEED_BUSINESSES:
            owner = upsert_owner(session, entry.owner)
            business = upsert_business(session, owner, entry)
            created_or_updated.append(business)

        session.commit()

        print("Seed completed: 5 business owners and 5 businesses are now available.")
        print(f"Default owner password: {DEFAULT_OWNER_PASSWORD}")
        for business in created_or_updated:
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
