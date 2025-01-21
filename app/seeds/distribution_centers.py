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
        ),
        DistributionCenter(
            name="Sunset Community Hub",
            address="1234 Irving St",
            latitude=37.7642,
            longitude=-122.4682,
            contact_person="Sarah Lee",
            phone="415-555-0126",
            operating_hours=json.dumps({
                "Monday": "10:00-19:00",
                "Tuesday": "10:00-19:00",
                "Wednesday": "10:00-19:00",
                "Thursday": "10:00-19:00",
                "Friday": "10:00-19:00",
                "Saturday": "10:00-16:00",
                "Sunday": "closed"
            }),
            email="sunset@foodbridge.com",
            capacity_limit=350
        ),
        DistributionCenter(
            name="Bayview Food Assistance",
            address="567 Third St",
            latitude=37.7749,
            longitude=-122.3889,
            contact_person="Michael Chen",
            phone="415-555-0127",
            operating_hours=json.dumps({
                "Monday": "8:30-16:30",
                "Tuesday": "8:30-16:30",
                "Wednesday": "8:30-16:30",
                "Thursday": "8:30-16:30",
                "Friday": "8:30-16:30",
                "Saturday": "9:00-14:00",
                "Sunday": "closed"
            }),
            email="bayview@foodbridge.com",
            capacity_limit=450
        ),
        DistributionCenter(
            name="North Beach Food Pantry",
            address="890 Columbus Ave",
            latitude=37.8015,
            longitude=-122.4109,
            contact_person="Lisa Garcia",
            phone="415-555-0128",
            operating_hours=json.dumps({
                "Monday": "9:00-18:00",
                "Tuesday": "9:00-18:00",
                "Wednesday": "9:00-18:00",
                "Thursday": "9:00-18:00",
                "Friday": "9:00-18:00",
                "Saturday": "closed",
                "Sunday": "closed"
            }),
            email="nbeach@foodbridge.com",
            capacity_limit=250
        ),
        DistributionCenter(
            name="Hayes Valley Hub",
            address="432 Hayes St",
            latitude=37.7770,
            longitude=-122.4260,
            contact_person="David Wilson",
            phone="415-555-0129",
            operating_hours=json.dumps({
                "Monday": "8:00-17:00",
                "Tuesday": "8:00-17:00",
                "Wednesday": "8:00-17:00",
                "Thursday": "8:00-17:00",
                "Friday": "8:00-17:00",
                "Saturday": "9:00-15:00",
                "Sunday": "closed"
            }),
            email="hayes@foodbridge.com",
            capacity_limit=300
        ),
        DistributionCenter(
            name="SOMA Food Support",
            address="765 Folsom St",
            latitude=37.7849,
            longitude=-122.4005,
            contact_person="Rachel Kim",
            phone="415-555-0130",
            operating_hours=json.dumps({
                "Monday": "7:00-19:00",
                "Tuesday": "7:00-19:00",
                "Wednesday": "7:00-19:00",
                "Thursday": "7:00-19:00",
                "Friday": "7:00-19:00",
                "Saturday": "8:00-16:00",
                "Sunday": "closed"
            }),
            email="soma@foodbridge.com",
            capacity_limit=600
        ),
        DistributionCenter(
            name="Marina District Center",
            address="2145 Chestnut St",
            latitude=37.8008,
            longitude=-122.4369,
            contact_person="Tom Martinez",
            phone="415-555-0131",
            operating_hours=json.dumps({
                "Monday": "9:30-17:30",
                "Tuesday": "9:30-17:30",
                "Wednesday": "9:30-17:30",
                "Thursday": "9:30-17:30",
                "Friday": "9:30-17:30",
                "Saturday": "10:00-15:00",
                "Sunday": "closed"
            }),
            email="marina@foodbridge.com",
            capacity_limit=275
        ),
        DistributionCenter(
            name="Potrero Hill Food Bank",
            address="1050 17th St",
            latitude=37.7649,
            longitude=-122.4021,
            contact_person="Emma Thompson",
            phone="415-555-0132",
            operating_hours=json.dumps({
                "Monday": "8:00-16:00",
                "Tuesday": "8:00-16:00",
                "Wednesday": "8:00-16:00",
                "Thursday": "8:00-16:00",
                "Friday": "8:00-16:00",
                "Saturday": "9:00-13:00",
                "Sunday": "closed"
            }),
            email="potrero@foodbridge.com",
            capacity_limit=325
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