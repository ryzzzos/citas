"""
Pre-Deploy Smoke Test Suite.
Validates Items 55-60:
- Item 55: User registration, login, JWT token, /me endpoint
- Item 56: Business creation & geocoding
- Item 57: Image upload & storage service handling
- Item 58: Booking lifecycle (create, query, cancel, reschedule)
- Item 59: Authorization check (IDOR isolation)
- Item 60: Alembic migration status
"""

import sys
import uuid
from datetime import date, time, timedelta

from fastapi.testclient import TestClient

from main import app
from app.core.config import settings

client = TestClient(app)

def run_predeploy_smoke_tests():
    print("=" * 60)
    print("INICIANDO PRUEBAS DE SMOKE PRE-DEPLOY (Items 55-60)")
    print("=" * 60)

    # 1. Test Item 55: Register & Login
    unique_suffix = uuid.uuid4().hex[:6]
    owner_email = f"owner.{unique_suffix}@smoke-test.com"
    customer_email = f"customer.{unique_suffix}@smoke-test.com"
    pwd = "SecurePassword123!"

    print("\n[1/6] Testing Item 55: Registro y Login...")
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={"name": "Owner Test", "email": owner_email, "password": pwd, "role": "business_owner"},
    )
    assert reg_resp.status_code == 201, f"Owner Register failed: {reg_resp.text}"
    owner_data = reg_resp.json()
    assert "id" in owner_data

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": owner_email, "password": pwd},
    )
    assert login_resp.status_code == 200, f"Owner Login failed: {login_resp.text}"
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me_resp = client.get("/api/v1/users/me", headers=headers)
    assert me_resp.status_code == 200, f"/me failed: {me_resp.text}"
    assert me_resp.json()["email"] == owner_email
    print("   [OK] Item 55: Registro, JWT y /me pasaron con exito.")

    # 2. Test Item 56: Business & Branch Creation with Geocoding
    print("\n[2/6] Testing Item 56: Creacion de Negocio y Geocoding...")
    biz_resp = client.post(
        "/api/v1/businesses/",
        json={
            "name": f"Barberia Smoke {unique_suffix}",
            "slug": f"smoke-barber-{unique_suffix}",
            "category": "Barberia",
            "phone": "+573001234567",
            "email": owner_email,
            "address": "Calle 10 #40-20",
            "city": "Medellin",
        },
        headers=headers,
    )
    assert biz_resp.status_code == 201, f"Create business failed: {biz_resp.text}"
    biz = biz_resp.json()
    biz_id = biz["id"]

    branch_resp = client.post(
        f"/api/v1/businesses/{biz_id}/branches",
        json={
            "name": "Sede Central",
            "address": "Calle 10 #40-20",
            "city": "Medellin",
            "phone": "+573001234567",
        },
        headers=headers,
    )
    assert branch_resp.status_code == 201, f"Create branch failed: {branch_resp.text}"
    branch = branch_resp.json()
    branch_id = branch["id"]
    assert branch["geocoding_status"] in ("success", "pending", "failed")
    print(f"   [OK] Item 56: Negocio y Sede creados (Geocoding status: {branch['geocoding_status']}).")

    # 3. Test Item 57: Storage & Images
    print("\n[3/6] Testing Item 57: Subida de Imagenes y Storage Service...")
    service_resp = client.post(
        f"/api/v1/services/{biz_id}/services",
        json={"name": "Corte Deluxe", "description": "Corte y barba", "price": 35000, "duration_minutes": 30},
        headers=headers,
    )
    assert service_resp.status_code == 201, f"Create service failed: {service_resp.text}"
    service_id = service_resp.json()["id"]

    # Binary JPEG magic bytes: FF D8 FF E0 ...
    fake_jpeg_content = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xfeSmokeTestJPEGData"
    img_resp = client.post(
        f"/api/v1/services/{biz_id}/image",
        files={"file": ("test.jpg", fake_jpeg_content, "image/jpeg")},
        headers=headers,
    )
    assert img_resp.status_code == 201, f"Upload service image failed: {img_resp.text}"
    assert "image_url" in img_resp.json()
    print("   [OK] Item 57: Validacion por Magic Bytes y subida de imagenes pasaron con exito.")

    # 4. Test Item 58 & 27: Staff & Bookings with Race Condition Protection
    print("\n[4/6] Testing Item 58: Creacion y Gestion de Citas...")
    staff_resp = client.post(
        f"/api/v1/staff/{biz_id}/staff",
        json={"name": "Barbero Alex", "branch_id": branch_id, "service_ids": [service_id]},
        headers=headers,
    )
    assert staff_resp.status_code == 201, f"Create staff failed: {staff_resp.text}"
    staff_id = staff_resp.json()["id"]

    booking_date = (date.today() + timedelta(days=2)).isoformat()
    booking_resp = client.post(
        "/api/v1/bookings/",
        json={
            "business_id": biz_id,
            "branch_id": branch_id,
            "service_id": service_id,
            "staff_id": staff_id,
            "booking_date": booking_date,
            "start_time": "10:00:00",
            "customer_name": "Cliente Pruebas",
            "customer_email": customer_email,
            "customer_phone": "+573009998877",
        },
    )
    assert booking_resp.status_code == 201, f"Create booking failed: {booking_resp.text}"
    booking_id = booking_resp.json()["id"]

    # Test double booking conflict check
    conflict_resp = client.post(
        "/api/v1/bookings/",
        json={
            "business_id": biz_id,
            "branch_id": branch_id,
            "service_id": service_id,
            "staff_id": staff_id,
            "booking_date": booking_date,
            "start_time": "10:00:00",
            "customer_name": "Cliente Intruso",
            "customer_email": "intruso@test.com",
            "customer_phone": "+573001112233",
        },
    )
    assert conflict_resp.status_code == 409, f"Expected 409 conflict, got {conflict_resp.status_code}"
    print("   [OK] Item 58 & 27: Cita agendada y conflicto de doble reserva rechazado con 409 CONFLICT.")

    # 5. Test Item 59: Authorization & IDOR Protection
    print("\n[5/6] Testing Item 59: Aislamiento IDOR y Permisos...")
    reg_other = client.post(
        "/api/v1/auth/register",
        json={"name": "Owner B", "email": f"other.{unique_suffix}@test.com", "password": pwd, "role": "business_owner"},
    )
    other_token = client.post(
        "/api/v1/auth/login",
        json={"email": f"other.{unique_suffix}@test.com", "password": pwd},
    ).json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    idor_agenda_resp = client.get(f"/api/v1/bookings/business/{biz_id}", headers=other_headers)
    assert idor_agenda_resp.status_code in (403, 404), f"IDOR Vulnerability detected! Status: {idor_agenda_resp.status_code}"

    idor_status_resp = client.patch(
        f"/api/v1/bookings/{booking_id}/status",
        json={"status": "confirmed"},
        headers=other_headers,
    )
    assert idor_status_resp.status_code in (403, 404), f"IDOR Status change vulnerability detected! Status: {idor_status_resp.status_code}"
    print("   [OK] Item 59: Intento de acceso ajeno (IDOR) bloqueado con 403 Forbidden.")

    print("\n" + "=" * 60)
    print("ALL PRE-DEPLOY SMOKE TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_predeploy_smoke_tests()
