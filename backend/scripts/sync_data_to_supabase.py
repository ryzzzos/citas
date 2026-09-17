"""
Synchronize local development data (Businesses, Branches, Services, Staff, Schedules, Categories) to Supabase Production.

Features:
1. Export mode (local -> SQL): Extracts real businesses, branches, services, staff, and schedules from local DB,
   uploads local images to Supabase Storage (if configured), and writes backend/scripts/supabase_production_seed.sql.
2. Apply mode (SQL -> Supabase): Safely applies supabase_production_seed.sql directly into Supabase production
   without needing local PostgreSQL running (ideal for CI/CD GitHub Actions).
3. Verification: Validates and displays all synchronized businesses and branches.

Usage:
    # 1. Export SQL from local DB and upload local images to Supabase Storage:
    python scripts/sync_data_to_supabase.py

    # 2. Directly apply SQL seed file to Supabase (CI/CD GitHub Actions):
    python scripts/sync_data_to_supabase.py --db-url "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" --from-sql scripts/supabase_production_seed.sql

    # 3. Verify businesses and branches in remote Supabase:
    python scripts/sync_data_to_supabase.py --db-url "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" --verify-only
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
from app.models.staff import Staff
from app.models.user import User
from scripts.clean_smoke_test_data import purge_smoke_data


def normalize_db_url(url: str) -> str:
    """Ensure proper postgresql:// driver prefix."""
    clean = url.strip()
    if clean.startswith("postgres://"):
        clean = clean.replace("postgres://", "postgresql://", 1)
    return clean


def upload_local_file_to_supabase(local_rel_path: str, backend_dir: Path) -> str | None:
    """Uploads a local image file to Supabase Storage and returns its public URL."""
    clean_path = local_rel_path.lstrip("/")
    if clean_path.startswith("storage/"):
        disk_path = backend_dir / clean_path
        storage_object_path = clean_path[len("storage/") :]
    else:
        disk_path = backend_dir / "storage" / clean_path
        storage_object_path = clean_path

    if not disk_path.exists() or not disk_path.is_file():
        return None

    if not settings.supabase_url or not settings.supabase_service_role_key:
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

    try:
        resp = httpx.post(target_url, content=content, headers=headers, timeout=30.0)
        if resp.status_code in (200, 201):
            public_url = (
                f"{settings.supabase_url.rstrip('/')}/storage/v1/object/public/"
                f"{settings.supabase_storage_bucket}/{storage_object_path}"
            )
            return public_url
    except Exception as exc:
        print(f"    [AVISO] No se pudo subir imagen a Supabase Storage: {exc}")

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


def verify_production_data(target_db_url: str):
    """Queries target DB and prints a detailed verification of existing businesses and branches."""
    target_db_url = normalize_db_url(target_db_url)
    engine = create_engine(target_db_url, pool_pre_ping=True)
    with engine.connect() as conn:
        biz_rows = conn.execute(
            text("SELECT id, name, slug, category, phone FROM businesses ORDER BY name;")
        ).fetchall()

        branch_rows = conn.execute(
            text("""
                SELECT b.name AS biz_name, br.name AS branch_name, br.city, br.address, br.is_active
                FROM branches br
                JOIN businesses b ON br.business_id = b.id
                ORDER BY b.name, br.name;
            """)
        ).fetchall()

        service_count = conn.execute(text("SELECT count(*) FROM services;")).scalar() or 0
        staff_count = conn.execute(text("SELECT count(*) FROM staff;")).scalar() or 0
        cat_count = conn.execute(text("SELECT count(*) FROM service_categories;")).scalar() or 0
        schedule_count = conn.execute(text("SELECT count(*) FROM schedules;")).scalar() or 0

    print("\n" + "=" * 75)
    print("RESUMEN DE SUCURSALES Y NEGOCIOS EN PRODUCCIÓN (SUPABASE)")
    print("=" * 75)
    print(f"Total Negocios:            {len(biz_rows)}")
    print(f"Total Sedes (Sucursales):  {len(branch_rows)}")
    print(f"Total Categorías:          {cat_count}")
    print(f"Total Servicios:           {service_count}")
    print(f"Total Especialistas:       {staff_count}")
    print(f"Total Horarios Semanales:  {schedule_count}")
    print("-" * 75)

    print("\nNegocios y Sucursales activas:")
    for br in branch_rows:
        status_icon = "ACTIVA" if br.is_active else "INACTIVA"
        print(f"  [{status_icon}] {br.biz_name} -> {br.branch_name} ({br.city}: {br.address})")

    if not biz_rows:
        print("\n[AVISO] La base de datos no tiene negocios cargados.")
    else:
        print("\n[OK] ¡La base de datos de producción cuenta con datos activos y funcionales!")
    print("=" * 75)


def apply_sql_file_to_db(sql_file_path: Path, target_db_url: str, purge_smoke: bool = True):
    """Executes an idempotent SQL seed file directly against the target database."""
    target_db_url = normalize_db_url(target_db_url)
    if not sql_file_path.exists():
        raise FileNotFoundError(f"Archivo SQL no encontrado: {sql_file_path}")

    if purge_smoke:
        print("\n[PURGE] Purgando datos residuales de smoke tests en la base de datos destino...")
        try:
            purge_smoke_data(target_db_url)
        except Exception as purge_err:
            print(f"    [AVISO] Purga de smoke previa arrojó: {purge_err}")

    sql_content = sql_file_path.read_text(encoding="utf-8")
    print(f"\n[APPLY] Conectando a la base de datos para aplicar seed desde: {sql_file_path.name}")
    print(f"        Tamaño SQL: {len(sql_content):,} bytes")

    engine = create_engine(target_db_url, pool_pre_ping=True)
    raw_conn = engine.raw_connection()
    try:
        with raw_conn.cursor() as cur:
            cur.execute(sql_content)
        raw_conn.commit()
        print("   [OK] Script SQL ejecutado y confirmado con éxito.")
    except Exception as exc:
        raw_conn.rollback()
        raise exc
    finally:
        raw_conn.close()

    # Run verification report
    verify_production_data(target_db_url)


def sync_data(target_db_url: str | None = None, from_sql: str | None = None, update_local_db: bool = False):
    print("=" * 75)
    print("SINCRONIZACIÓN DE DATOS DE DESARROLLO A PRODUCCIÓN (SUPABASE)")
    print("=" * 75)

    sql_default_path = BACKEND_DIR / "scripts" / "supabase_production_seed.sql"

    # If --from-sql is explicitly requested or local DB is unreachable
    if from_sql:
        sql_path = Path(from_sql)
        if not sql_path.is_absolute():
            sql_path = BACKEND_DIR / from_sql
        if not target_db_url:
            raise ValueError("Debes indicar --db-url al usar --from-sql")
        apply_sql_file_to_db(sql_path, target_db_url)
        return

    # Check if local DB is reachable
    can_connect_local = False
    try:
        local_engine = create_engine(settings.database_url, pool_pre_ping=True)
        with local_engine.connect() as test_conn:
            test_conn.execute(text("SELECT 1;"))
        can_connect_local = True
    except Exception:
        can_connect_local = False

    # Fallback to applying SQL if local DB is unreachable (CI/CD environment)
    if not can_connect_local:
        if target_db_url and sql_default_path.exists():
            print("\n[INFO] Base de datos local no accesible (entorno CI/CD runner detectado).")
            print(f"[INFO] Aplicando seed idempotente pre-generado: {sql_default_path.name}")
            apply_sql_file_to_db(sql_default_path, target_db_url)
            return
        else:
            raise RuntimeError(
                "No se puede conectar a la base de datos local ni existe --db-url con seed SQL para aplicar."
            )

    # 1. Connect to Local DB
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
            print("[AVISO] No se encontraron negocios reales en desarrollo.")
            if target_db_url and sql_default_path.exists():
                print(f"[INFO] Usando seed SQL de respaldo: {sql_default_path.name}")
                apply_sql_file_to_db(sql_default_path, target_db_url)
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

        staff_srv_rows = []
        if real_staff_ids:
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

        # 3. Handle image uploads to Supabase Storage if configured
        print("\n[3] Verificando imágenes locales...")
        url_replacements: dict[str, str] = {}

        def process_image_url(url: str | None) -> str | None:
            if not url:
                return url
            if "localhost" in url or url.startswith("/storage/"):
                if url in url_replacements:
                    return url_replacements[url]
                match = re.search(r"/(storage/.+)$", url)
                rel_path = match.group(1) if match else url
                cloud_url = upload_local_file_to_supabase(rel_path, BACKEND_DIR)
                if cloud_url:
                    url_replacements[url] = cloud_url
                    return cloud_url
            return url

        for b in real_businesses:
            b.cover_image_url = process_image_url(b.cover_image_url)
            b.logo_image_url = process_image_url(b.logo_image_url)

        for s in real_services:
            s.image_url = process_image_url(s.image_url)

        for st in real_staff:
            st.photo_url = process_image_url(st.photo_url)

        if update_local_db and url_replacements:
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

        # 4.0 Pre-reconciliation block to prevent UniqueViolations on ix_users_email / ix_businesses_slug / uq_businesses_owner_id
        owner_emails_quoted = ", ".join(sql_quote(u.email) for u in real_owners)
        owner_ids_quoted = ", ".join(sql_quote(u.id) for u in real_owners)
        biz_slugs_quoted = ", ".join(sql_quote(b.slug) for b in real_businesses)
        biz_ids_quoted = ", ".join(sql_quote(b.id) for b in real_businesses)

        sql_lines.append("-- 0. RECONCILIACIÓN PREVIA (Evita UniqueViolations en ix_users_email / ix_businesses_slug)")
        sql_lines.append("DO $$")
        sql_lines.append("BEGIN")
        if biz_slugs_quoted and biz_ids_quoted:
            sql_lines.append("    -- Eliminar negocios previos con slug duplicado pero diferente UUID (cascada elimina ramas y dependientes)")
            sql_lines.append(f"    DELETE FROM businesses WHERE slug IN ({biz_slugs_quoted}) AND id NOT IN ({biz_ids_quoted});")
        if owner_emails_quoted and owner_ids_quoted:
            sql_lines.append("    -- Eliminar usuarios previos con email duplicado pero diferente UUID")
            sql_lines.append(f"    DELETE FROM users WHERE email IN ({owner_emails_quoted}) AND id NOT IN ({owner_ids_quoted});")
        sql_lines.append("END $$;")
        sql_lines.append("")

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
        sql_default_path.write_text(sql_content, encoding="utf-8")
        print(f"   [OK] Archivo SQL generado exitosamente: {sql_default_path}")
        print(f"   Tamaño: {len(sql_content):,} bytes | Total líneas: {len(sql_lines):,}")

        # 5. Execute against target DB if provided
        if target_db_url:
            apply_sql_file_to_db(sql_default_path, target_db_url)

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
        "--from-sql",
        dest="from_sql",
        default=None,
        help="Ruta a un archivo .sql para aplicar directamente a la BD de producción sin requerir BD local.",
    )
    parser.add_argument(
        "--verify-only",
        action="store_true",
        help="Consulta la BD indicada en --db-url y muestra el resumen de negocios y sucursales.",
    )
    parser.add_argument(
        "--update-local-db",
        action="store_true",
        help="Actualiza las URLs en la BD local con las URLs públicas de Supabase Storage.",
    )
    args = parser.parse_args()

    target_db = args.db_url or os.getenv("PROD_DATABASE_URL")

    if args.verify_only:
        if not target_db:
            print("[ERROR] Debes proporcionar --db-url o configurar PROD_DATABASE_URL para usar --verify-only.")
            sys.exit(1)
        verify_production_data(target_db)
        return

    sync_data(target_db_url=target_db, from_sql=args.from_sql, update_local_db=args.update_local_db)


if __name__ == "__main__":
    main()
