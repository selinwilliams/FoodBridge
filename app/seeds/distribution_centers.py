from app.models import db, DistributionCenter, environment, SCHEMA
import json

def seed_distribution_centers():
    centers = [
        DistributionCenter(
            name="Downtown Food Bank",
            address="456 Center St",
            latitude=37.7749,
            longitude=-122.4194,
            contact_person="Jane Smith",
            phone="415-555-0123",
            operating_hours=json.dumps({
                "Monday": "9:00-17:00",
                "Tuesday": "9:00-17:00",
                "Wednesday": "9:00-17:00",
                "Thursday": "9:00-17:00",
                "Friday": "9:00-17:00",
                "Saturday": "closed",
                "Sunday": "closed"
            }),
            email="downtown@foodbridge.com",
            capacity_limit=500
        ),
        DistributionCenter(
            name="Mission District Center",
            address="789 Mission St",
            latitude=37.7647,
            longitude=-122.4183,
            contact_person="John Doe",
            phone="415-555-0124",
            operating_hours=json.dumps({
                "Monday": "8:00-18:00",
                "Tuesday": "8:00-18:00",
                "Wednesday": "8:00-18:00",
                "Thursday": "8:00-18:00",
                "Friday": "8:00-18:00",
                "Saturday": "8:00-18:00",
                "Sunday": "closed"
            }),
            email="mission@foodbridge.com",
            capacity_limit=300
        ),
        DistributionCenter(
            name="Richmond Food Center",
            address="321 Clement St",
            latitude=37.7833,
            longitude=-122.4667,
            contact_person="Mary Johnson",
            phone="415-555-0125",
            operating_hours=json.dumps({
                "Tuesday": "9:00-17:00",
                "Wednesday": "9:00-17:00",
                "Thursday": "9:00-17:00",
                "Friday": "9:00-17:00",
                "Saturday": "9:00-17:00",
                "Sunday": "9:00-17:00",
                "Monday": "closed"
            }),
            email="richmond@foodbridge.com",
            capacity_limit=400
        )
    ]
    
    for center in centers:
        db.session.add(center)
    
    db.session.commit()

def undo_distribution_centers():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.distribution_centers RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("DELETE FROM distribution_centers")
    
    db.session.commit() 