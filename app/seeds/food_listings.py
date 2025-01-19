from app.models import db, FoodListing, Provider, FoodType, FoodStatus, environment, SCHEMA
from sqlalchemy.sql import text
from datetime import datetime, timedelta

def seed_food_listings():
    print("\n=== Starting Food Listing Seeding ===")
    
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.food_listings RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM food_listings"))
    
    providers = Provider.query.all()
    print(f"Found {len(providers)} providers")
    
    listings = []
    for provider in providers:
        print(f"Creating listings for provider {provider.id}")
        listings.extend([
            FoodListing(
                provider_id=provider.id,
                title="Fresh Vegetables",
                description="Assorted fresh vegetables including carrots, tomatoes, and lettuce",
                food_type=FoodType.PRODUCE,
                quantity=25.0,
                unit="kg",
                original_price=100.00,
                discounted_price=50.00,
                expiration_date=datetime.utcnow() + timedelta(days=7),
                pickup_window_start=datetime.utcnow() + timedelta(hours=1),
                pickup_window_end=datetime.utcnow() + timedelta(hours=8),
                status=FoodStatus.AVAILABLE,
                allergens=["none"],
                storage_instructions="Keep refrigerated",
                handling_instructions="Handle with care",
                is_perishable=True
            ),
            FoodListing(
                provider_id=provider.id,
                title="Bread and Pastries",
                description="Day-old bread and pastries",
                food_type=FoodType.BAKERY,
                quantity=50,
                unit="pieces",
                original_price=200.00,
                discounted_price=75.00,
                expiration_date=datetime.utcnow() + timedelta(days=2),
                pickup_window_start=datetime.utcnow() + timedelta(hours=1),
                pickup_window_end=datetime.utcnow() + timedelta(hours=4),
                status=FoodStatus.AVAILABLE,
                allergens=["gluten", "dairy"],
                storage_instructions="Room temperature",
                handling_instructions="Stack carefully",
                is_perishable=True
            )
        ])
    
    try:
        for listing in listings:
            db.session.add(listing)
            print(f"Adding listing: {listing.title} with status {listing.status}")
        
        db.session.commit()
        print(f"Successfully seeded {len(listings)} food listings")
        
        # Verify listings
        all_listings = FoodListing.query.all()
        for listing in all_listings:
            print(f"Verified listing {listing.id}: {listing.title} - Status: {listing.status}")
        
        return listings
    except Exception as e:
        print(f"Error seeding food listings: {str(e)}")
        db.session.rollback()
        raise e

def undo_food_listings():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.food_listings RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM food_listings"))
    db.session.commit() 