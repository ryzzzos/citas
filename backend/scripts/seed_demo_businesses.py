from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import func

from app.core.security import hash_password
from app.database import SessionLocal
from app.models.branch import Branch
from app.models.business import Business
from app.models.schedule import Schedule
from app.models.service import Service
from app.models.staff import Staff
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
class SeedServiceData:
    name: str
    description: str
    duration_minutes: int
    price: Decimal


@dataclass(frozen=True)
class SeedStaffData:
    name: str
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
    services: list[SeedServiceData] = field(default_factory=list)
    staff_members: list[SeedStaffData] = field(default_factory=list)


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
        cover_image_url="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80",
        logo_image_url='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%230f172a"/><path d="M35 35L65 65M65 35L35 65" stroke="%2338bdf8" stroke-width="4"/><circle cx="35" cy="35" r="6" fill="none" stroke="%2338bdf8" stroke-width="3"/><circle cx="65" cy="35" r="6" fill="none" stroke="%2338bdf8" stroke-width="3"/><path d="M38 75Q50 85 62 75" fill="none" stroke="%23fbbf24" stroke-width="4"/></svg>',
        services=[
            SeedServiceData("Corte de Cabello Clásico", "Corte tradicional con perfilado y lavado.", 45, Decimal("35000.00")),
            SeedServiceData("Perfilado de Barba Premium", "Toalla caliente, ritual de aceites y corte de barba.", 30, Decimal("25000.00")),
            SeedServiceData("Combo Corte + Barba", "Experiencia completa de corte y cuidado facial.", 60, Decimal("55000.00")),
        ],
        staff_members=[
            SeedStaffData("Mateo Silva", "+57 301 555 0101"),
            SeedStaffData("Lucas Bermudez", "+57 301 555 0102"),
        ],
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
        cover_image_url="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1200&auto=format&fit=crop&q=80",
        logo_image_url='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23022c22"/><path d="M50 20C36 38 28 52 28 64A22 22 0 0 0 72 64C72 52 64 38 50 20Z" fill="%2310b981"/><path d="M50 35C42 46 38 55 38 62A12 12 0 0 0 62 62C62 55 58 46 50 35Z" fill="%23a7f3d0"/></svg>',
        services=[
            SeedServiceData("Limpieza Facial Profunda", "Exfoliación, extracción e hidratación con alta frecuencia.", 60, Decimal("90000.00")),
            SeedServiceData("Hidratación Capilar Intensiva", "Mascarilla reconstructora con keratina pura.", 60, Decimal("12000.00")),
        ],
        staff_members=[
            SeedStaffData("Sofia Gomez", "+57 302 555 0201"),
        ],
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
        cover_image_url="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&auto=format&fit=crop&q=80",
        logo_image_url='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23064e3b"/><path d="M50 18C30 40 26 66 50 82C74 66 70 40 50 18Z" fill="none" stroke="%2334d399" stroke-width="4"/><path d="M50 30C40 46 38 60 50 72C62 60 60 46 50 30Z" fill="%23059669"/><path d="M50 30V72" stroke="%23ecfdf5" stroke-width="3"/></svg>',
        services=[
            SeedServiceData("Masaje Descontracturante", "Alivio de tensión muscular en espalda y cuello.", 60, Decimal("110000.00")),
            SeedServiceData("Ritual de Relajación Termal", "Aromaterapia, piedras volcánicas y masaje corporal.", 90, Decimal("180000.00")),
        ],
        staff_members=[
            SeedStaffData("Mariana Osorio", "+57 303 555 0301"),
        ],
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
        cover_image_url="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&auto=format&fit=crop&q=80",
        logo_image_url='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%230c4a6e"/><path d="M32 38C32 26 44 24 50 34C56 24 68 26 68 38C68 56 56 74 50 78C44 74 32 56 32 38Z" fill="%230284c7" stroke="%23e0f2fe" stroke-width="3"/><path d="M42 48Q50 60 58 48" fill="none" stroke="%23ffffff" stroke-width="4" stroke-linecap="round"/></svg>',
        services=[
            SeedServiceData("Valoración Odontológica", "Diagnóstico integral con cámara intraoral.", 30, Decimal("50000.00")),
            SeedServiceData("Limpieza Dental Ultrasónica", "Profilaxis profunda y eliminación de sarro.", 45, Decimal("120000.00")),
        ],
        staff_members=[
            SeedStaffData("Dr. Alejandro Restrepo", "+57 304 555 0401"),
        ],
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
        cover_image_url="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80",
        logo_image_url='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23311b92"/><path d="M50 20L78 35V65L50 80L22 65V35Z" fill="none" stroke="%23818cf8" stroke-width="4"/><path d="M36 50L46 60L64 40" fill="none" stroke="%23c7d2fe" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        services=[
            SeedServiceData("Evaluación Kinésica Deportiva", "Análisis biomecánico y prueba de esfuerzo.", 45, Decimal("80000.00")),
            SeedServiceData("Sesión de Rehabilitación Física", "Terapia de movilidad y fortalecimiento Guiado.", 45, Decimal("70000.00")),
        ],
        staff_members=[
            SeedStaffData("Lic. Felipe Cardona", "+57 305 555 0501"),
        ],
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


def upsert_business_and_branch(session, owner: User, data: SeedBusiness) -> Business:
    business = session.query(Business).filter(Business.owner_id == owner.id).one_or_none()
    if business is None:
        business = (
            session.query(Business)
            .filter(func.lower(Business.slug) == data.slug.lower())
            .one_or_none()
        )

    biz_values = {
        "name": data.name,
        "slug": data.slug,
        "category": data.category,
        "phone": data.phone,
        "whatsapp_phone": data.whatsapp_phone,
        "email": data.email,
        "description": data.description,
        "public_bio": data.public_bio,
        "cover_image_url": data.cover_image_url,
        "logo_image_url": data.logo_image_url,
    }

    if business is None:
        business = Business(owner_id=owner.id, **biz_values)
        session.add(business)
        session.flush()
    else:
        business.owner_id = owner.id
        for key, value in biz_values.items():
            setattr(business, key, value)
        session.flush()

    # Primary Branch handling
    branch = session.query(Branch).filter(Branch.business_id == business.id).first()

    latitude, longitude, geocoding_status, geocoding_error, geocoded_at = resolve_coordinates(
        name=data.name,
        address=data.address,
        city=data.city,
    )

    branch_values = {
        "name": f"{data.name} - Sede Principal",
        "address": data.address,
        "city": data.city,
        "phone": data.phone,
        "whatsapp_phone": data.whatsapp_phone,
        "latitude": latitude,
        "longitude": longitude,
        "geocoding_status": geocoding_status,
        "geocoding_error": geocoding_error,
        "geocoded_at": geocoded_at,
    }

    if branch is None:
        branch = Branch(business_id=business.id, **branch_values)
        session.add(branch)
        session.flush()
    else:
        for key, value in branch_values.items():
            setattr(branch, key, value)
        session.flush()

    # Seed Services
    for s_data in data.services:
        existing_service = (
            session.query(Service)
            .filter(Service.business_id == business.id, func.lower(Service.name) == s_data.name.lower())
            .first()
        )
        if not existing_service:
            new_service = Service(
                business_id=business.id,
                name=s_data.name,
                description=s_data.description,
                duration_minutes=s_data.duration_minutes,
                price=s_data.price,
                is_active=True,
            )
            session.add(new_service)
    session.flush()

    # Seed Staff Members
    db_services = session.query(Service).filter(Service.business_id == business.id).all()
    for st_data in data.staff_members:
        existing_staff = (
            session.query(Staff)
            .filter(Staff.business_id == business.id, func.lower(Staff.name) == st_data.name.lower())
            .first()
        )
        if not existing_staff:
            new_staff = Staff(
                business_id=business.id,
                branch_id=branch.id,
                name=st_data.name,
                phone=st_data.phone,
                is_active=True,
            )
            new_staff.services = db_services
            session.add(new_staff)
            session.flush()

            # Add Schedule for staff (Mon-Sat, 09:00 - 18:00)
            for day in range(0, 6):
                schedule = Schedule(
                    business_id=business.id,
                    branch_id=branch.id,
                    staff_id=new_staff.id,
                    day_of_week=day,
                    intervals=[{"start": "09:00", "end": "18:00"}],
                )
                session.add(schedule)

    session.flush()
    return business


def main() -> None:
    session = SessionLocal()
    created_or_updated: list[Business] = []

    try:
        for entry in SEED_BUSINESSES:
            owner = upsert_owner(session, entry.owner)
            business = upsert_business_and_branch(session, owner, entry)
            created_or_updated.append(business)

        session.commit()

        print("=== Seed completed: 5 business owners, 5 businesses, branches, services, staff and schedules are ready. ===")
        print(f"Default owner password: {DEFAULT_OWNER_PASSWORD}")
        for business in created_or_updated:
            branch = business.branches[0] if business.branches else None
            print(
                "- {name} | {city} | {address} | services={srv_count} | staff={staff_count} | lat={lat} lng={lng}".format(
                    name=business.name,
                    city=branch.city if branch else "",
                    address=branch.address if branch else "",
                    srv_count=len(business.services),
                    staff_count=len(business.staff),
                    lat=branch.latitude if branch else None,
                    lng=branch.longitude if branch else None,
                )
            )
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    main()
