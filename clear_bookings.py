import sys
import os

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
from app.models.booking import Booking

db = SessionLocal()
try:
    count = db.query(Booking).count()
    if count == 0:
        print("No bookings found in the database. Nothing to delete.")
    else:
        db.query(Booking).delete()
        db.commit()
        print(f"Successfully deleted {count} bookings (and their associated payments via cascade)!")
except Exception as e:
    db.rollback()
    import traceback
    traceback.print_exc()
finally:
    db.close()
