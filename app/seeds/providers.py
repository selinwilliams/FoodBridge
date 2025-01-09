from app.models import db, Provider, User, BusinessType, environment, SCHEMA
from sqlalchemy.sql import text
from .users import seed_users

def seed_providers():
    # First, clear existing data
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.providers RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM providers"))

    # Get or create users first
    users = seed_users()
    
    # Create provider entries
    providers = [
        Provider(
            user_id=users[1].id,  # DemoProvider
            business_name="Demo Food Bank",
            business_type=BusinessType.OTHER,
            address="123 Main St",
            latitude=37.7749,
            longitude=-122.4194,
            phone="(555) 555-5555",
            website="www.demofoodbank.org",
            description="A demo food bank providing food to those in need."
        ),
        Provider(
            user_id=users[2].id,  # FoodBank1
            business_name="Community Food Bank",
            business_type=BusinessType.OTHER,
            address="456 Market St",
            latitude=37.7897,
            longitude=-122.4000,
            phone="(555) 555-5556",
            website="www.communityfoodbank.org",
            description="Serving the community since 1990."
        ),
        Provider(
            user_id=users[4].id,  # Restaurant1
            business_name="Fresh Eats Restaurant",
            business_type=BusinessType.RESTAURANT,
            address="789 Mission St",
            latitude=37.7850,
            longitude=-122.4064,
            phone="(555) 555-5557",
            website="www.fresheats.com",
            description="Farm to table restaurant committed to reducing food waste."
        )
    ]

    # Add all providers to session
    db.session.add_all(providers)
    db.session.commit()

    return providers

def undo_providers():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.providers RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM providers"))
        
    db.session.commit() 