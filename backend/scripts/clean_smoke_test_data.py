"""
Utility script to purge historical smoke test data from the database.
Works on local PostgreSQL or remote Supabase PostgreSQL.

Usage:
    # Dry run on default (local) DB:
    python scripts/clean_smoke_test_data.py --dry-run

    # Execute purge on default (local) DB:
    python scripts/clean_smoke_test_data.py

    # Execute purge on Supabase / remote DB:
    python scripts/clean_smoke_test_data.py --db-url "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
"""

import argparse
import os
import shutil
import sys
from pathlib import Path

# Add backend root to sys.path
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import create_engine, or_, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.models.booking import Booking
from app.models.branch import Branch
from app.models.business import Business
from app.models.payment import Payment
from app.models.schedule import Schedule
from app.models.schedule_block import ScheduleBlock
from app.models.service import Service
from app.models.service_category import ServiceCategory
from app.models.staff import Staff, staff_services
from app.models.user import User


def normalize_db_url(url: str) -> str:
    """Ensure proper postgresql:// driver prefix."""
    clean = url.strip()
    if clean.startswith("postgres://"):
        clean = clean.replace("postgres://", "postgresql://", 1)
    return clean


def purge_smoke_data(database_url: str, dry_run: bool = False):
    database_url = normalize_db_url(database_url)
    print("=" * 70)
    # Mask password for display
    display_url = database_url
    if "@" in display_url and "://" in display_url:
        protocol_and_creds, host_part = display_url.split("@", 1)
        protocol, user_pwd = protocol_and_creds.split("://", 1)
        if ":" in user_pwd:
            user, _ = user_pwd.split(":", 1)
            display_url = f"{protocol}://{user}:***@{host_part}"
    print(f"Target Database: {display_url}")
    print(f"Mode: {'DRY RUN (no changes will be made)' if dry_run else 'ACTIVE PURGE'}")
    print("=" * 70)

    engine = create_engine(database_url, pool_pre_ping=True)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # 1. Identify target smoke businesses
        smoke_biz_filter = or_(
            Business.name.ilike("%smoke%"),
            Business.slug.ilike("%smoke%"),
            Business.email.ilike("%smoke-test%"),
            Business.email.ilike("%smoke%"),
        )
        target_businesses = db.query(Business).filter(smoke_biz_filter).all()
        target_biz_ids = [b.id for b in target_businesses]
        target_owner_ids = [b.owner_id for b in target_businesses if b.owner_id]

        print(f"\n[1] Negocios Smoke detectados: {len(target_businesses)}")
        for b in target_businesses[:10]:
            print(f"    - {b.name} (id: {b.id}, slug: {b.slug})")
        if len(target_businesses) > 10:
            print(f"    ... y {len(target_businesses) - 10} más.")

        # 2. Identify target users
        smoke_user_filter = or_(
            User.email.ilike("%@smoke-test.com%"),
            User.email.ilike("%@smoke-test.local%"),
            User.email.ilike("%smoke%"),
            User.email.ilike("other.%@test.com"),
            User.name.ilike("%Owner Test%"),
            User.name.ilike("%Owner B%"),
            User.name.ilike("%smoke%"),
            User.id.in_(target_owner_ids) if target_owner_ids else False,
        )
        target_users = db.query(User).filter(smoke_user_filter).all()
        target_user_ids = [u.id for u in target_users]
        print(f"\n[2] Usuarios Smoke detectados: {len(target_users)}")

        # 3. Identify branches, staff, services, categories, schedules
        target_branches = []
        target_staff = []
        target_services = []
        target_categories = []
        target_schedules = []
        target_schedule_blocks = []

        if target_biz_ids:
            target_branches = db.query(Branch).filter(Branch.business_id.in_(target_biz_ids)).all()
            target_staff = db.query(Staff).filter(
                or_(
                    Staff.business_id.in_(target_biz_ids),
                    Staff.name.ilike("%Barbero Alex%"),
                    Staff.name.ilike("%smoke%"),
                )
            ).all()
            target_services = db.query(Service).filter(
                or_(
                    Service.business_id.in_(target_biz_ids),
                    Service.name.ilike("%Corte Deluxe%"),
                )
            ).all()
            target_categories = db.query(ServiceCategory).filter(ServiceCategory.business_id.in_(target_biz_ids)).all()
            target_schedules = db.query(Schedule).filter(Schedule.business_id.in_(target_biz_ids)).all()
            target_schedule_blocks = db.query(ScheduleBlock).filter(ScheduleBlock.business_id.in_(target_biz_ids)).all()
        else:
            # Fallback search for orphaned entities by name
            target_staff = db.query(Staff).filter(
                or_(Staff.name.ilike("%Barbero Alex%"), Staff.name.ilike("%smoke%"))
            ).all()
            target_services = db.query(Service).filter(Service.name.ilike("%Corte Deluxe%")).all()

        target_branch_ids = [br.id for br in target_branches]
        target_staff_ids = [s.id for s in target_staff]
        target_service_ids = [sv.id for sv in target_services]
        target_category_ids = [c.id for c in target_categories]

        print(f"\n[3] Sedes asociadas: {len(target_branches)}")
        print(f"    Especialistas asociados: {len(target_staff)}")
        print(f"    Servicios asociados: {len(target_services)}")
        print(f"    Categorías asociadas: {len(target_categories)}")
        print(f"    Horarios / Bloques asociados: {len(target_schedules)} / {len(target_schedule_blocks)}")

        # 4. Identify target bookings & payments (exhaustive filter)
        booking_filter_clauses = []
        if target_biz_ids:
            booking_filter_clauses.append(Booking.business_id.in_(target_biz_ids))
        if target_branch_ids:
            booking_filter_clauses.append(Booking.branch_id.in_(target_branch_ids))
        if target_staff_ids:
            booking_filter_clauses.append(Booking.staff_id.in_(target_staff_ids))
        if target_service_ids:
            booking_filter_clauses.append(Booking.service_id.in_(target_service_ids))
        if target_user_ids:
            booking_filter_clauses.append(Booking.user_id.in_(target_user_ids))

        booking_filter_clauses.append(Booking.customer_email.ilike("%@smoke-test.com%"))
        booking_filter_clauses.append(Booking.customer_email.ilike("%@smoke-test.local%"))
        booking_filter_clauses.append(Booking.customer_email.ilike("%smoke%"))
        booking_filter_clauses.append(Booking.customer_name.ilike("%Concurrent%"))
        booking_filter_clauses.append(Booking.customer_name.ilike("%Cliente Pruebas%"))

        target_bookings = db.query(Booking).filter(or_(*booking_filter_clauses)).all()
        target_booking_ids = [bk.id for bk in target_bookings]

        target_payments = []
        if target_booking_ids:
            target_payments = db.query(Payment).filter(Payment.booking_id.in_(target_booking_ids)).all()

        print(f"\n[4] Reservas asociadas: {len(target_bookings)}")
        print(f"    Pagos asociados: {len(target_payments)}")

        total_records = (
            len(target_businesses)
            + len(target_branches)
            + len(target_users)
            + len(target_bookings)
            + len(target_payments)
            + len(target_staff)
            + len(target_services)
            + len(target_categories)
            + len(target_schedules)
            + len(target_schedule_blocks)
        )

        if total_records == 0:
            print("\n[OK] ¡La base de datos ya está limpia! No se encontraron registros de pruebas de humo.")
            return

        if dry_run:
            print(f"\n[DRY RUN] Se habrían eliminado {total_records} registros en total. Ninguna acción tomada.")
            return

        # EXECUTION: Strict topological order with SQL fallback sweep
        print("\n--> Procediendo con la eliminación ordenada y en cascada...")

        # A. Payments
        if target_booking_ids:
            deleted_p = db.query(Payment).filter(Payment.booking_id.in_(target_booking_ids)).delete(synchronize_session=False)
            print(f"    [1/11] Eliminados {deleted_p} pagos.")

        # B. Bookings
        if target_booking_ids:
            deleted_b = db.query(Booking).filter(Booking.id.in_(target_booking_ids)).delete(synchronize_session=False)
            print(f"    [2/11] Eliminadas {deleted_b} reservas.")

        # C. Schedule Blocks & Schedules
        if target_biz_ids or target_branch_ids or target_staff_ids:
            sb_filter = or_(
                ScheduleBlock.business_id.in_(target_biz_ids) if target_biz_ids else False,
                ScheduleBlock.branch_id.in_(target_branch_ids) if target_branch_ids else False,
                ScheduleBlock.staff_id.in_(target_staff_ids) if target_staff_ids else False,
            )
            deleted_sb = db.query(ScheduleBlock).filter(sb_filter).delete(synchronize_session=False)

            sc_filter = or_(
                Schedule.business_id.in_(target_biz_ids) if target_biz_ids else False,
                Schedule.branch_id.in_(target_branch_ids) if target_branch_ids else False,
                Schedule.staff_id.in_(target_staff_ids) if target_staff_ids else False,
            )
            deleted_sc = db.query(Schedule).filter(sc_filter).delete(synchronize_session=False)
            print(f"    [3/11] Eliminados {deleted_sb} bloques de horario y {deleted_sc} horarios.")

        # D. Staff_Services & Staff
        if target_staff_ids or target_service_ids:
            staff_srv_filter = or_(
                staff_services.c.staff_id.in_(target_staff_ids) if target_staff_ids else False,
                staff_services.c.service_id.in_(target_service_ids) if target_service_ids else False,
            )
            db.execute(staff_services.delete().where(staff_srv_filter))
            deleted_st = db.query(Staff).filter(Staff.id.in_(target_staff_ids)).delete(synchronize_session=False) if target_staff_ids else 0
            print(f"    [4/11] Eliminados {deleted_st} especialistas y sus relaciones de servicio.")

        # E. Services
        if target_service_ids or target_biz_ids:
            srv_filter = or_(
                Service.id.in_(target_service_ids) if target_service_ids else False,
                Service.business_id.in_(target_biz_ids) if target_biz_ids else False,
            )
            deleted_sv = db.query(Service).filter(srv_filter).delete(synchronize_session=False)
            print(f"    [5/11] Eliminados {deleted_sv} servicios.")

        # F. Service Categories
        if target_category_ids or target_biz_ids:
            cat_filter = or_(
                ServiceCategory.id.in_(target_category_ids) if target_category_ids else False,
                ServiceCategory.business_id.in_(target_biz_ids) if target_biz_ids else False,
            )
            deleted_cat = db.query(ServiceCategory).filter(cat_filter).delete(synchronize_session=False)
            print(f"    [6/11] Eliminadas {deleted_cat} categorías de servicio.")

        # G. Branches
        if target_branch_ids or target_biz_ids:
            br_filter = or_(
                Branch.id.in_(target_branch_ids) if target_branch_ids else False,
                Branch.business_id.in_(target_biz_ids) if target_biz_ids else False,
            )
            deleted_br = db.query(Branch).filter(br_filter).delete(synchronize_session=False)
            print(f"    [7/11] Eliminadas {deleted_br} sedes.")

        # H. Businesses
        if target_biz_ids:
            deleted_bz = db.query(Business).filter(Business.id.in_(target_biz_ids)).delete(synchronize_session=False)
            print(f"    [8/11] Eliminados {deleted_bz} negocios Smoke.")

        # I. Users
        if target_user_ids:
            deleted_u = db.query(User).filter(User.id.in_(target_user_ids)).delete(synchronize_session=False)
            print(f"    [9/11] Eliminados {deleted_u} usuarios Smoke / de prueba.")

        # J. Direct SQL Sweep (Safety net for any leftover unindexed/orphaned smoke rows)
        print("    [10/11] Ejecutando barrido final SQL para garantizar tolerancia cero a residuos...")
        sweep_sql = """
        -- 1. Payments of smoke bookings
        DELETE FROM payments WHERE booking_id IN (
            SELECT id FROM bookings WHERE business_id IN (SELECT id FROM businesses WHERE name ILIKE '%smoke%' OR slug ILIKE '%smoke%')
            OR customer_email ILIKE '%smoke%'
        );
        -- 2. Bookings
        DELETE FROM bookings WHERE business_id IN (SELECT id FROM businesses WHERE name ILIKE '%smoke%' OR slug ILIKE '%smoke%')
            OR customer_email ILIKE '%smoke%'
            OR customer_name ILIKE '%Concurrent%'
            OR customer_name ILIKE '%Cliente Pruebas%';
        -- 3. Schedule Blocks
        DELETE FROM schedule_blocks WHERE business_id IN (SELECT id FROM businesses WHERE name ILIKE '%smoke%' OR slug ILIKE '%smoke%');
        -- 4. Schedules
        DELETE FROM schedules WHERE business_id IN (SELECT id FROM businesses WHERE name ILIKE '%smoke%' OR slug ILIKE '%smoke%');
        -- 5. Staff Services
        DELETE FROM staff_services WHERE staff_id IN (SELECT id FROM staff WHERE business_id IN (SELECT id FROM businesses WHERE name ILIKE '%smoke%' OR slug ILIKE '%smoke%'))
            OR service_id IN (SELECT id FROM services WHERE business_id IN (SELECT id FROM businesses WHERE name ILIKE '%smoke%' OR slug ILIKE '%smoke%'));
        -- 6. Staff
        DELETE FROM staff WHERE business_id IN (SELECT id FROM businesses WHERE name ILIKE '%smoke%' OR slug ILIKE '%smoke%')
            OR name ILIKE '%Barbero Alex%';
        -- 7. Services
        DELETE FROM services WHERE business_id IN (SELECT id FROM businesses WHERE name ILIKE '%smoke%' OR slug ILIKE '%smoke%')
            OR name ILIKE '%Corte Deluxe%';
        -- 8. Service Categories
        DELETE FROM service_categories WHERE business_id IN (SELECT id FROM businesses WHERE name ILIKE '%smoke%' OR slug ILIKE '%smoke%');
        -- 9. Branches
        DELETE FROM branches WHERE business_id IN (SELECT id FROM businesses WHERE name ILIKE '%smoke%' OR slug ILIKE '%smoke%');
        -- 10. Businesses
        DELETE FROM businesses WHERE name ILIKE '%smoke%' OR slug ILIKE '%smoke%' OR email ILIKE '%smoke%';
        -- 11. Users
        DELETE FROM users WHERE email ILIKE '%smoke%' OR email ILIKE 'other.%@test.com' OR name ILIKE '%Owner Test%' OR name ILIKE '%Owner B%';
        """
        for stmt in sweep_sql.split(";"):
            cleaned = stmt.strip()
            if cleaned:
                db.execute(text(cleaned))

        db.commit()
        print("    [11/11] Transacción confirmada exitosamente en la base de datos.")

        # K. Storage Cleanup (Local backend storage)
        local_storage_base = BACKEND_DIR / "storage"
        if local_storage_base.exists() and target_biz_ids:
            removed_folders = 0
            for biz_id in target_biz_ids:
                biz_str = str(biz_id)
                for subfolder in ["services", "businesses", "staff"]:
                    target_dir = local_storage_base / subfolder / biz_str
                    if target_dir.exists():
                        try:
                            shutil.rmtree(target_dir)
                            removed_folders += 1
                        except Exception as storage_err:
                            print(f"    (Aviso) No se pudo eliminar carpeta {target_dir}: {storage_err}")
            if removed_folders > 0:
                print(f"    Eliminadas {removed_folders} carpetas de archivos locales asociadas.")

        # L. POST-PURGE VERIFICATION (Zero-tolerance check)
        remaining_biz = db.execute(
            text("SELECT count(*) FROM businesses WHERE name ILIKE '%smoke%' OR slug ILIKE '%smoke%'")
        ).scalar()
        remaining_users = db.execute(
            text("SELECT count(*) FROM users WHERE email ILIKE '%smoke%' OR email ILIKE 'other.%@test.com'")
        ).scalar()

        print("\n" + "-" * 70)
        print(f"VERIFICACIÓN POST-PURGA:")
        print(f"    - Negocios Smoke restantes: {remaining_biz}")
        print(f"    - Usuarios Smoke restantes: {remaining_users}")
        print("-" * 70)

        if remaining_biz > 0 or remaining_users > 0:
            raise RuntimeError(
                f"FALLO DE PURGA: Aún existen residuos en la base de datos! "
                f"({remaining_biz} negocios, {remaining_users} usuarios restantes)."
            )

        print("=" * 70)
        print("¡PURGA COMPLETADA EXITOSAMENTE! CERO RESIDUOS DE SMOKE EN LA BD.")
        print("=" * 70)

    except Exception as exc:
        db.rollback()
        print(f"\n[ERROR CRÍTICO] La purga falló: {exc}")
        raise exc
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Purga de datos residuales de smoke tests.")
    parser.add_argument(
        "--db-url",
        dest="db_url",
        default=None,
        help="URL completa de la base de datos (PostgreSQL o Supabase). Si no se indica, usa la configurada en .env o variables de entorno.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Muestra los registros que se borrarían sin ejecutar cambios reales.",
    )
    args = parser.parse_args()

    database_url = args.db_url or os.getenv("PROD_DATABASE_URL") or os.getenv("DATABASE_URL") or settings.database_url
    purge_smoke_data(database_url=database_url, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
