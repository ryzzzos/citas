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
from app.models.staff import Staff, staff_services
from app.models.user import User


def purge_smoke_data(database_url: str, dry_run: bool = False):
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

    engine = create_engine(database_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # 1. Identify target smoke businesses
        smoke_biz_filter = or_(
            Business.name.ilike("%smoke%"),
            Business.slug.ilike("%smoke%"),
            Business.email.ilike("%smoke-test%"),
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
            User.email.ilike("other.%@test.com"),
            User.id.in_(target_owner_ids) if target_owner_ids else False,
        )
        target_users = db.query(User).filter(smoke_user_filter).all()
        target_user_ids = [u.id for u in target_users]
        print(f"\n[2] Usuarios Smoke detectados: {len(target_users)}")

        # 3. Identify target bookings & payments
        booking_filter = or_(
            Booking.business_id.in_(target_biz_ids) if target_biz_ids else False,
            Booking.customer_email.ilike("%@smoke-test.com%"),
            Booking.customer_email.ilike("%@smoke-test.local%"),
            Booking.user_id.in_(target_user_ids) if target_user_ids else False,
        )
        target_bookings = db.query(Booking).filter(booking_filter).all()
        target_booking_ids = [bk.id for bk in target_bookings]

        target_payments = []
        if target_booking_ids:
            target_payments = db.query(Payment).filter(Payment.booking_id.in_(target_booking_ids)).all()

        print(f"\n[3] Reservas asociadas: {len(target_bookings)}")
        print(f"    Pagos asociados: {len(target_payments)}")

        # 4. Identify branches, staff, services
        target_branches = []
        target_staff = []
        target_services = []
        target_schedules = []
        target_schedule_blocks = []

        if target_biz_ids:
            target_branches = db.query(Branch).filter(Branch.business_id.in_(target_biz_ids)).all()
            target_staff = db.query(Staff).filter(Staff.business_id.in_(target_biz_ids)).all()
            target_services = db.query(Service).filter(Service.business_id.in_(target_biz_ids)).all()
            target_schedules = db.query(Schedule).filter(Schedule.business_id.in_(target_biz_ids)).all()
            target_schedule_blocks = db.query(ScheduleBlock).filter(ScheduleBlock.business_id.in_(target_biz_ids)).all()

        target_staff_ids = [s.id for s in target_staff]

        print(f"\n[4] Sedes asociadas: {len(target_branches)}")
        print(f"    Especialistas asociados: {len(target_staff)}")
        print(f"    Servicios asociados: {len(target_services)}")
        print(f"    Horarios / Bloques asociados: {len(target_schedules)} / {len(target_schedule_blocks)}")

        total_records = (
            len(target_businesses)
            + len(target_branches)
            + len(target_users)
            + len(target_bookings)
            + len(target_payments)
            + len(target_staff)
            + len(target_services)
            + len(target_schedules)
            + len(target_schedule_blocks)
        )

        if total_records == 0:
            print("\n[OK] ¡La base de datos ya está limpia! No se encontraron registros de pruebas de humo.")
            return

        if dry_run:
            print(f"\n[DRY RUN] Se habrían eliminado {total_records} registros en total. Ninguna acción tomada.")
            return

        # EXECUTION: Strict topological order
        print("\n--> Procediendo con la eliminación ordenada...")

        # A. Payments
        if target_booking_ids:
            deleted_p = db.query(Payment).filter(Payment.booking_id.in_(target_booking_ids)).delete(synchronize_session=False)
            print(f"    Eliminados {deleted_p} pagos.")

        # B. Bookings
        if target_booking_ids:
            deleted_b = db.query(Booking).filter(Booking.id.in_(target_booking_ids)).delete(synchronize_session=False)
            print(f"    Eliminadas {deleted_b} reservas.")

        # C. Schedule Blocks & Schedules
        if target_biz_ids:
            deleted_sb = db.query(ScheduleBlock).filter(ScheduleBlock.business_id.in_(target_biz_ids)).delete(synchronize_session=False)
            deleted_sc = db.query(Schedule).filter(Schedule.business_id.in_(target_biz_ids)).delete(synchronize_session=False)
            print(f"    Eliminados {deleted_sb} bloques de horario y {deleted_sc} horarios.")

        # D. Staff_Services & Staff
        if target_staff_ids:
            db.execute(staff_services.delete().where(staff_services.c.staff_id.in_(target_staff_ids)))
            deleted_st = db.query(Staff).filter(Staff.id.in_(target_staff_ids)).delete(synchronize_session=False)
            print(f"    Eliminados {deleted_st} especialistas y sus relaciones de servicio.")

        # E. Services
        if target_biz_ids:
            deleted_sv = db.query(Service).filter(Service.business_id.in_(target_biz_ids)).delete(synchronize_session=False)
            print(f"    Eliminados {deleted_sv} servicios.")

        # F. Branches
        if target_biz_ids:
            deleted_br = db.query(Branch).filter(Branch.business_id.in_(target_biz_ids)).delete(synchronize_session=False)
            print(f"    Eliminadas {deleted_br} sedes.")

        # G. Businesses
        if target_biz_ids:
            deleted_bz = db.query(Business).filter(Business.id.in_(target_biz_ids)).delete(synchronize_session=False)
            print(f"    Eliminados {deleted_bz} negocios Smoke.")

        # H. Users
        if target_user_ids:
            deleted_u = db.query(User).filter(User.id.in_(target_user_ids)).delete(synchronize_session=False)
            print(f"    Eliminados {deleted_u} usuarios Smoke / de prueba.")

        db.commit()
        print("\n[OK] Transacción en base de datos completada exitosamente.")

        # I. Clean local storage artifacts if they exist
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

        print("=" * 70)
        print("PURGA COMPLETADA EXITOSAMENTE")
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
        help="URL completa de la base de datos (PostgreSQL o Supabase). Si no se indica, usa la configurada en .env.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Muestra los registros que se borrarían sin ejecutar cambios reales.",
    )
    args = parser.parse_args()

    database_url = args.db_url or settings.database_url
    purge_smoke_data(database_url=database_url, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
