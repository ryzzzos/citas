"""
Synchronize local development data (Businesses, Branches, Services, Staff, Schedules, Categories) to Supabase Production.

1. Uploads local images from backend/storage/ to Supabase Storage (bucket: agenda-images).
2. Converts image URLs to permanent public Supabase Storage URLs.
3. Generates a standalone, idempotent SQL script: backend/scripts/supabase_production_seed.sql.
4. Optionally applies the SQL directly to Supabase if --db-url is provided.

Usage:
    # 1. Export SQL and upload local images to Supabase Storage:
    python scripts/sync_data_to_supabase.py

    # 2. Directly execute synchronization against Supabase database:
    python scripts/sync_data_to_supabase.py --db-url "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

    # 3. Update local database URLs to use Supabase Storage URLs as well:
    python scripts/sync_data_to_supabase.py --update-local-db
"""

import argparse
import json
import mimetypes
import os
import re
import sys
import uuid
from datetime import datetime
from decimal import Decimal
from pathlib import Path

# Add backend root to sys.path
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import httpx
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.branch import Branch
from app.models.business import Business
from app.models.schedule import Schedule
from app.models.service import Service
from app.models.service_category import ServiceCategory
from app.models.staff import Staff, staff_services
from app.models.user import User


def upload_local_file_to_supabase(local_rel_path: str, backend_dir: Path) -> str | None:
    """
    Uploads a local image file to Supabase Storage and returns its public URL.
    """
    clean_path = local_rel_path.lstrip("/")
    # If path starts with storage/, strip it to find the real file in BACKEND_DIR / storage
    if clean_path.startswith("storage/"):
        disk_path = backend_dir / clean_path
        storage_object_path = clean_path[len("storage/") :]
    else:
        disk_path = backend_dir / "storage" / clean_path
        storage_object_path = clean_path

    if not disk_path.exists() or not disk_path.is_file():
        print(f"    [AVISO] Archivo local no encontrado en disco: {disk_path}")
        return None

    content = disk_path.read_bytes()
    mime_type, _ = mimetypes.guess_type(str(disk_path))
    if not mime_type:
        mime_type = "image/jpeg"

    target_url = (
        f"{settings.supabase_url.rstrip('/')}/storage/v1/object/"
        f"{settings.supabase_storage_bucket}/{storage_object_path}"
    )
    headers = {
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "apikey": settings.supabase_service_role_key,
        "Content-Type": mime_type,
        "x-upsert": "true",
    }

    resp = httpx.post(target_url, content=content, headers=headers, timeout=30.0)
    if resp.status_code in (200, 201):
        public_url = (
            f"{settings.supabase_url.rstrip('/')}/storage/v1/object/public/"
            f"{settings.supabase_storage_bucket}/{storage_object_path}"
        )
        return public_url
    else:
        print(f"    [ERROR] Falló subida a Supabase Storage ({resp.status_code}): {resp.text}")
        return None


def sql_quote(val) -> str:
    """Safely format values for SQL statements."""
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float, Decimal)):
        return str(val)
    if isinstance(val, uuid.UUID):
        return f"'{val}'::uuid"
    if isinstance(val, (dict, list)):
        escaped = json.dumps(val).replace("'", "''")
        return f"'{escaped}'::jsonb"
    if isinstance(val, datetime):
        return f"'{val.isoformat()}'::timestamptz"

    # String value
    escaped = str(val).replace("'", "''")
    return f"'{escaped}'"


def sync_data(target_db_url: str | None = None, update_local_db: bool = False):
    print("=" * 75)
    print("SINCRONIZACIÓN DE DATOS DE DESARROLLO A PRODUCCIÓN (SUPABASE)")
    print("=" * 75)

    # 1. Connect to Local DB
    local_engine = create_engine(settings.database_url)
    LocalSession = sessionmaker(bind=local_engine)
    local_db = LocalSession()

    try:
        # 2. Extract non-smoke real businesses
        real_businesses = (
            local_db.query(Business)
            .filter(~Business.name.ilike("%smoke%"), ~Business.slug.ilike("%smoke%"))
            .order_by(Business.created_at)
            .all()
        )
        print(f"\n[1] Negocios reales encontrados en desarrollo: {len(real_businesses)}")
        for b in real_businesses:
            print(f"    - {b.name} (slug: {b.slug}, cat: {b.category})")

        if not real_businesses:
            print("[ERROR] No se encontraron negocios reales para sincronizar.")
            return

        real_biz_ids = [b.id for b in real_businesses]
        owner_ids = [b.owner_id for b in real_businesses if b.owner_id]

        real_owners = local_db.query(User).filter(User.id.in_(owner_ids)).all()
        real_branches = local_db.query(Branch).filter(Branch.business_id.in_(real_biz_ids)).all()
        real_categories = local_db.query(ServiceCategory).filter(ServiceCategory.business_id.in_(real_biz_ids)).all()
        real_services = local_db.query(Service).filter(Service.business_id.in_(real_biz_ids)).all()
        real_staff = local_db.query(Staff).filter(Staff.business_id.in_(real_biz_ids)).all()
        real_staff_ids = [s.id for s in real_staff]
        real_schedules = local_db.query(Schedule).filter(Schedule.business_id.in_(real_biz_ids)).all()

        # Query staff_services association table
        staff_srv_rows = local_db.execute(
            text("SELECT staff_id, service_id FROM staff_services WHERE staff_id = ANY(:ids)"),
            {"ids": real_staff_ids},
        ).fetchall()

        print(f"\n[2] Resumen de entidades a exportar/sincronizar:")
        print(f"    - Propietarios (Usuarios): {len(real_owners)}")
        print(f"    - Negocios: {len(real_businesses)}")
        print(f"    - Sedes (Sucursales): {len(real_branches)}")
        print(f"    - Categorías de servicio: {len(real_categories)}")
        print(f"    - Servicios: {len(real_services)}")
        print(f"    - Especialistas (Staff): {len(real_staff)}")
        print(f"    - Relaciones Especialista-Servicio: {len(staff_srv_rows)}")
        print(f"    - Horarios de atención: {len(real_schedules)}")

        # 3. Handle image uploads to Supabase Storage
        print("\n[3] Verificando y migrando imágenes locales a Supabase Storage...")
        url_replacements: dict[str, str] = {}

        def process_image_url(url: str | None) -> str | None:
            if not url:
                return url
            if "localhost" in url or url.startswith("/storage/"):
                # Check if already processed
                if url in url_replacements:
                    return url_replacements[url]

                # Extract relative storage path
                match = re.search(r"/(storage/.+)$", url)
                rel_path = match.group(1) if match else url
                print(f"    Subiendo a Supabase Storage: {rel_path} ...")
                cloud_url = upload_local_file_to_supabase(rel_path, BACKEND_DIR)
                if cloud_url:
                    print(f"    -> OK: {cloud_url}")
                    url_replacements[url] = cloud_url
                    return cloud_url
                else:
                    print(f"    -> No se pudo subir, manteniendo URL original.")
                    return url
            return url

        # Process business cover & logo images
        for b in real_businesses:
            b.cover_image_url = process_image_url(b.cover_image_url)
            b.logo_image_url = process_image_url(b.logo_image_url)

        # Process service images
        for s in real_services:
            s.image_url = process_image_url(s.image_url)

        # Process staff photos
        for st in real_staff:
            st.photo_url = process_image_url(st.photo_url)

        if update_local_db and url_replacements:
            print("\n[3.1] Actualizando base de datos local con las URLs públicas de Supabase...")
            local_db.commit()
            print("   [OK] Base de datos local actualizada con URLs de almacenamiento en la nube.")

        # 4. Generate SQL Script
        print("\n[4] Generando script SQL idempotente de producción...")
        sql_lines: list[str] = [
            "-- ==========================================================================",
            "-- Agenda Web Platform - Production Seed Data (Local to Supabase)",
            f"-- Generado el: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "-- Script idempotente con manejo de ON CONFLICT para inserción segura.",
            "-- ==========================================================================",
            "BEGIN;",
            "",
        ]

        # 4.1 USERS
        sql_lines.append("-- 1. USUARIOS (PROPIETARIOS)")
        for u in real_owners:
            sql_lines.append(
                f"INSERT INTO users (id, name, email, password_hash, phone, role, created_at) "
                f"VALUES ({sql_quote(u.id)}, {sql_quote(u.name)}, {sql_quote(u.email)}, "
                f"{sql_quote(u.password_hash)}, {sql_quote(u.phone)}, {sql_quote(u.role)}, {sql_quote(u.created_at)}) "
                f"ON CONFLICT (id) DO UPDATE SET "
                f"name = EXCLUDED.name, email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, "
                f"phone = EXCLUDED.phone, role = EXCLUDED.role;"
            )
        sql_lines.append("")

        # 4.2 BUSINESSES
        sql_lines.append("-- 2. NEGOCIOS")
        for b in real_businesses:
            sql_lines.append(
                f"INSERT INTO businesses (id, owner_id, name, description, slug, category, timezone, phone, "
                f"whatsapp_phone, email, public_bio, cover_image_url, logo_image_url, created_at) "
                f"VALUES ({sql_quote(b.id)}, {sql_quote(b.owner_id)}, {sql_quote(b.name)}, {sql_quote(b.description)}, "
                f"{sql_quote(b.slug)}, {sql_quote(b.category)}, {sql_quote(b.timezone)}, {sql_quote(b.phone)}, "
                f"{sql_quote(b.whatsapp_phone)}, {sql_quote(b.email)}, {sql_quote(b.public_bio)}, "
                f"{sql_quote(b.cover_image_url)}, {sql_quote(b.logo_image_url)}, {sql_quote(b.created_at)}) "
                f"ON CONFLICT (id) DO UPDATE SET "
                f"name = EXCLUDED.name, description = EXCLUDED.description, slug = EXCLUDED.slug, "
                f"category = EXCLUDED.category, timezone = EXCLUDED.timezone, phone = EXCLUDED.phone, "
                f"whatsapp_phone = EXCLUDED.whatsapp_phone, email = EXCLUDED.email, public_bio = EXCLUDED.public_bio, "
                f"cover_image_url = EXCLUDED.cover_image_url, logo_image_url = EXCLUDED.logo_image_url;"
            )
        sql_lines.append("")

        # 4.3 BRANCHES
        sql_lines.append("-- 3. SEDES (SUCURSALES)")
        for br in real_branches:
            sql_lines.append(
                f"INSERT INTO branches (id, business_id, name, address, city, phone, whatsapp_phone, is_active, "
                f"latitude, longitude, geocoding_status, geocoding_error, geocoded_at, created_at) "
                f"VALUES ({sql_quote(br.id)}, {sql_quote(br.business_id)}, {sql_quote(br.name)}, {sql_quote(br.address)}, "
                f"{sql_quote(br.city)}, {sql_quote(br.phone)}, {sql_quote(br.whatsapp_phone)}, {sql_quote(br.is_active)}, "
                f"{sql_quote(br.latitude)}, {sql_quote(br.longitude)}, {sql_quote(br.geocoding_status)}, "
                f"{sql_quote(br.geocoding_error)}, {sql_quote(br.geocoded_at)}, {sql_quote(br.created_at)}) "
                f"ON CONFLICT (id) DO UPDATE SET "
                f"name = EXCLUDED.name, address = EXCLUDED.address, city = EXCLUDED.city, phone = EXCLUDED.phone, "
                f"whatsapp_phone = EXCLUDED.whatsapp_phone, is_active = EXCLUDED.is_active, latitude = EXCLUDED.latitude, "
                f"longitude = EXCLUDED.longitude, geocoding_status = EXCLUDED.geocoding_status, "
                f"geocoding_error = EXCLUDED.geocoding_error, geocoded_at = EXCLUDED.geocoded_at;"
            )
        sql_lines.append("")

        # 4.4 SERVICE CATEGORIES
        sql_lines.append("-- 4. CATEGORÍAS DE SERVICIOS")
        for cat in real_categories:
            sql_lines.append(
                f"INSERT INTO service_categories (id, business_id, name, description, position) "
                f"VALUES ({sql_quote(cat.id)}, {sql_quote(cat.business_id)}, {sql_quote(cat.name)}, "
                f"{sql_quote(cat.description)}, {sql_quote(cat.position)}) "
                f"ON CONFLICT (id) DO UPDATE SET "
                f"name = EXCLUDED.name, description = EXCLUDED.description, position = EXCLUDED.position;"
            )
        sql_lines.append("")

        # 4.5 SERVICES
        sql_lines.append("-- 5. SERVICIOS")
        for s in real_services:
            sql_lines.append(
                f"INSERT INTO services (id, business_id, service_category_id, name, description, price, duration_minutes, "
                f"is_active, image_url) "
                f"VALUES ({sql_quote(s.id)}, {sql_quote(s.business_id)}, {sql_quote(s.service_category_id)}, {sql_quote(s.name)}, "
                f"{sql_quote(s.description)}, {sql_quote(s.price)}, {sql_quote(s.duration_minutes)}, "
                f"{sql_quote(s.is_active)}, {sql_quote(s.image_url)}) "
                f"ON CONFLICT (id) DO UPDATE SET "
                f"service_category_id = EXCLUDED.service_category_id, name = EXCLUDED.name, description = EXCLUDED.description, "
                f"price = EXCLUDED.price, duration_minutes = EXCLUDED.duration_minutes, is_active = EXCLUDED.is_active, "
                f"image_url = EXCLUDED.image_url;"
            )
        sql_lines.append("")

        # 4.6 STAFF
        sql_lines.append("-- 6. ESPECIALISTAS (STAFF)")
        for st in real_staff:
            sql_lines.append(
                f"INSERT INTO staff (id, business_id, branch_id, name, email, phone, photo_url, is_active) "
                f"VALUES ({sql_quote(st.id)}, {sql_quote(st.business_id)}, {sql_quote(st.branch_id)}, "
                f"{sql_quote(st.name)}, {sql_quote(st.email)}, {sql_quote(st.phone)}, {sql_quote(st.photo_url)}, "
                f"{sql_quote(st.is_active)}) "
                f"ON CONFLICT (id) DO UPDATE SET "
                f"branch_id = EXCLUDED.branch_id, name = EXCLUDED.name, email = EXCLUDED.email, "
                f"phone = EXCLUDED.phone, photo_url = EXCLUDED.photo_url, is_active = EXCLUDED.is_active;"
            )
        sql_lines.append("")

        # 4.7 STAFF SERVICES
        sql_lines.append("-- 7. RELACIONES ESPECIALISTAS - SERVICIOS")
        for row in staff_srv_rows:
            sql_lines.append(
                f"INSERT INTO staff_services (staff_id, service_id) "
                f"VALUES ({sql_quote(row[0])}, {sql_quote(row[1])}) "
                f"ON CONFLICT (staff_id, service_id) DO NOTHING;"
            )
        sql_lines.append("")

        # 4.8 SCHEDULES
        sql_lines.append("-- 8. HORARIOS DE ATENCIÓN")
        for sc in real_schedules:
            sql_lines.append(
                f"INSERT INTO schedules (id, business_id, branch_id, staff_id, day_of_week, intervals) "
                f"VALUES ({sql_quote(sc.id)}, {sql_quote(sc.business_id)}, {sql_quote(sc.branch_id)}, "
                f"{sql_quote(sc.staff_id)}, {sql_quote(sc.day_of_week)}, {sql_quote(sc.intervals)}) "
                f"ON CONFLICT (id) DO UPDATE SET "
                f"branch_id = EXCLUDED.branch_id, staff_id = EXCLUDED.staff_id, "
                f"day_of_week = EXCLUDED.day_of_week, intervals = EXCLUDED.intervals;"
            )
        sql_lines.append("")

        sql_lines.append("COMMIT;")
        sql_lines.append("")

        sql_content = "\n".join(sql_lines)
        sql_path = BACKEND_DIR / "scripts" / "supabase_production_seed.sql"
        sql_path.write_text(sql_content, encoding="utf-8")
        print(f"   [OK] Archivo SQL generado exitosamente: {sql_path}")
        print(f"   Tamaño: {len(sql_content):,} bytes | Total líneas: {len(sql_lines):,}")

        # 5. Execute against target DB if provided
        if target_db_url:
            print("\n[5] Conectando y aplicando cambios directamente en la base de datos de producción...")
            prod_engine = create_engine(target_db_url)
            with prod_engine.connect() as conn:
                # Execute in transaction
                with conn.begin():
                    # Execute statement by statement
                    statements = [stmt.strip() for stmt in sql_content.split(";") if stmt.strip()]
                    executed_count = 0
                    for stmt in statements:
                        if stmt.upper() in ("BEGIN", "COMMIT"):
                            continue
                        conn.execute(text(stmt))
                        executed_count += 1
            print(f"   [OK] ¡Sincronización completada! {executed_count} sentencias ejecutadas en Supabase.")

        print("\n" + "=" * 75)
        print("PROCESO COMPLETADO EXITOSAMENTE")
        print("=" * 75)

    except Exception as exc:
        local_db.rollback()
        print(f"\n[ERROR CRÍTICO] La sincronización falló: {exc}")
        raise exc
    finally:
        local_db.close()


def main():
    parser = argparse.ArgumentParser(description="Sincroniza datos de desarrollo a producción (Supabase).")
    parser.add_argument(
        "--db-url",
        dest="db_url",
        default=None,
        help="URL de la base de datos de Supabase. Si se pasa, ejecuta el SQL directamente.",
    )
    parser.add_argument(
        "--update-local-db",
        action="store_true",
        help="Actualiza las URLs en la BD local con las URLs públicas de Supabase Storage.",
    )
    args = parser.parse_args()

    sync_data(target_db_url=args.db_url, update_local_db=args.update_local_db)


if __name__ == "__main__":
    main()
