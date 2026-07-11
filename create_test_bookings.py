import sys
import os
import uuid
import random
from datetime import date, time, datetime, timedelta, timezone

# Get directory where the script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_path = os.path.join(script_dir, "backend")
sys.path.append(backend_path)

# Explicitly load backend .env file to override current working directory settings
env_path = os.path.join(backend_path, ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                val = val.strip().strip("'\"")
                os.environ[key.strip()] = val

from app.database import SessionLocal
from app.models.business import Business
from app.models.branch import Branch
from app.models.service import Service
from app.models.staff import Staff
from app.models.booking import Booking

db = SessionLocal()
try:
    # 1. Find Branch with 'enciso' in the name
    branch = db.query(Branch).filter(Branch.name.ilike("%enciso%")).first()
    if not branch:
        print("Error: Could not find a branch with 'enciso' in the name (e.g. Sede Enciso).")
        sys.exit(1)
        
    # 2. Get the Business associated with this branch
    business = db.query(Business).filter(Business.id == branch.business_id).first()
    if not business:
        print(f"Error: Could not find business associated with branch {branch.name} (ID: {branch.id}).")
        sys.exit(1)

    print(f"Using Business: {business.name} (ID: {business.id})")
    print(f"Using Branch: {branch.name} (ID: {branch.id})")

    # 3. Get all services of this business
    services = db.query(Service).filter(Service.business_id == business.id).all()
    if not services:
        print(f"Error: No services found for business {business.name} (ID: {business.id}).")
        sys.exit(1)

    # 4. Get all staff members of this business
    staff_list = db.query(Staff).filter(Staff.business_id == business.id).all()
    if not staff_list:
        print(f"Error: No staff members found for business {business.name} (ID: {business.id}).")
        sys.exit(1)

    today = date.today()

    first_names = ["Alejandro", "Camila", "Laura", "David", "Juan", "Shakira", "Luis", "Carlos", "Paulina", "Ricky", "Marc", "Gloria", "Sebastian", "Karol", "Rosalia", "Natalia", "Julieta", "Andres", "Diego", "Enrique"]
    last_names = ["Sanz", "Cabello", "Pausini", "Bisbal", "Juanes", "Mebarak", "Miguel", "Vives", "Rubio", "Martin", "Anthony", "Estefan", "Yatra", "G", "Vila", "Lafourcade", "Venegas", "Calamaro", "Torres", "Iglesias"]

    created_count = 0

    # 3 appointments per day for Today, Day+1, Day+2, Day+3
    for day_offset in range(4):
        booking_date = today + timedelta(days=day_offset)
        
        for _ in range(3):
            service = random.choice(services)
            
            # Select random status
            if booking_date == today:
                status = random.choice(["confirmed", "pending", "completed"])
            else:
                status = random.choice(["confirmed", "pending"])

            placed = False
            # Try up to 50 times to find a free non-overlapping time for a staff member
            for _ in range(50):
                staff = random.choice(staff_list)
                
                # Pick random hour and minute
                start_hour = random.randint(8, 17)
                start_minute = random.choice([0, 30])
                start_time_val = time(start_hour, start_minute)
                
                duration = getattr(service, "duration_minutes", 60) or 60
                end_datetime = datetime.combine(booking_date, start_time_val) + timedelta(minutes=duration)
                end_time_val = end_datetime.time()
                
                # Check for overlap on the same staff member
                overlap = db.query(Booking).filter(
                    Booking.staff_id == staff.id,
                    Booking.booking_date == booking_date,
                    Booking.start_time < end_time_val,
                    Booking.end_time > start_time_val
                ).first()
                
                if not overlap:
                    cust_name = f"{random.choice(first_names)} {random.choice(last_names)}"
                    cust_phone = f"+573{random.randint(100000000, 999999999)}"
                    cust_email = f"{cust_name.lower().replace(' ', '')}@example.com"
                    
                    b = Booking(
                        business_id=business.id,
                        branch_id=branch.id,
                        service_id=service.id,
                        staff_id=staff.id,
                        booking_date=booking_date,
                        start_time=start_time_val,
                        end_time=end_time_val,
                        status=status,
                        customer_name=cust_name,
                        customer_email=cust_email,
                        customer_phone=cust_phone,
                        customer_whatsapp=cust_phone,
                        notes=f"Cita aleatoria para {cust_name} ({status})",
                        created_at=datetime.now(timezone.utc)
                    )
                    db.add(b)
                    print(f"Created: {cust_name} | Date: {booking_date} | Time: {start_time_val} - {end_time_val} | Staff: {staff.name} | Service: {service.name} | Status: {status}")
                    created_count += 1
                    placed = True
                    break
            
            if not placed:
                print(f"Could not find an available slot on {booking_date} after 50 attempts. Skipping this slot.")

    db.commit()
    print(f"\nSuccessfully added {created_count} new random bookings!")
except Exception as e:
    db.rollback()
    import traceback
    traceback.print_exc()
finally:
    db.close()
