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
                title="Fresh Mixed Vegetables",
                description="Assorted fresh vegetables including carrots, broccoli, and bell peppers",
                food_type=FoodType.PRODUCE,
                quantity=5.0,
                unit="kg",
                original_price=25.99,
                discounted_price=12.99,
                expiration_date=get_dates(5)[0],
                best_by_date=get_dates(4)[0],
                pickup_window_start=get_dates(5)[1],
                pickup_window_end=get_dates(5)[2],
                allergens=["None"],
                is_perishable=True,
                storage_instructions="Keep refrigerated",
                handling_instructions="Handle with care, wash before use",
                temperature_requirements="34-40°F",
                image_url="/veggie.jpg",
                status=FoodStatus.AVAILABLE
            ),
            FoodListing(
                provider_id=provider.id,
                title="Fresh Chicken Breasts",
                description="Fresh, never frozen chicken breasts perfect for grilling",
                food_type=FoodType.MEAT,
                quantity=3.0,
                unit="kg",
                original_price=35.99,
                discounted_price=17.99,
                expiration_date=get_dates(3)[0],
                best_by_date=get_dates(2)[0],
                pickup_window_start=get_dates(3)[1],
                pickup_window_end=get_dates(3)[2],
                allergens=["None"],
                is_perishable=True,
                storage_instructions="Keep frozen or refrigerated",
                handling_instructions="Keep at safe temperature",
                temperature_requirements="Below 40°F",
                image_url="/chicken.jpg",
                status=FoodStatus.AVAILABLE
            ),
            FoodListing(
                provider_id=provider.id,
                title="Fresh Milk Gallons",
                description="Fresh whole milk, perfect for families",
                food_type=FoodType.DAIRY,
                quantity=10,
                unit="gallons",
                original_price=45.99,
                discounted_price=22.99,
                expiration_date=get_dates(7)[0],
                best_by_date=get_dates(5)[0],
                pickup_window_start=get_dates(7)[1],
                pickup_window_end=get_dates(7)[2],
                allergens=["Milk"],
                is_perishable=True,
                storage_instructions="Keep refrigerated",
                handling_instructions="Handle with care",
                temperature_requirements="Below 40°F",
                image_url="/milk.avif",
                status=FoodStatus.AVAILABLE
            ),
            FoodListing(
                provider_id=provider.id,
                title="Fresh Baked Pastries",
                description="Assorted freshly baked pastries including croissants and danishes",
                food_type=FoodType.BAKERY,
                quantity=20,
                unit="pieces",
                original_price=40.00,
                discounted_price=18.99,
                expiration_date=get_dates(2)[0],
                best_by_date=get_dates(1)[0],
                pickup_window_start=get_dates(2)[1],
                pickup_window_end=get_dates(2)[2],
                allergens=["Wheat", "Milk", "Eggs"],
                is_perishable=True,
                storage_instructions="Store in a cool, dry place",
                handling_instructions="Handle with care",
                temperature_requirements="Room temperature",
                image_url="/pastry.png",
                status=FoodStatus.AVAILABLE
            ),
            FoodListing(
                provider_id=provider.id,
                title="Canned Goods Assortment",
                description="Mixed canned vegetables, fruits, and beans",
                food_type=FoodType.PANTRY,
                quantity=15,
                unit="cans",
                original_price=30.00,
                discounted_price=14.99,
                expiration_date=get_dates(365)[0],
                best_by_date=get_dates(300)[0],
                pickup_window_start=get_dates(30)[1],
                pickup_window_end=get_dates(30)[2],
                allergens=["None"],
                is_perishable=False,
                storage_instructions="Store in a cool, dry place",
                handling_instructions="Check cans for dents or damage",
                temperature_requirements="Room temperature",
                image_url="/canned.jpg",
                status=FoodStatus.AVAILABLE
            ),
            FoodListing(
                provider_id=provider.id,
                title="Prepared Meal Boxes",
                description="Ready-to-eat meal boxes with balanced nutrition",
                food_type=FoodType.PREPARED,
                quantity=8,
                unit="boxes",
                original_price=64.00,
                discounted_price=29.99,
                expiration_date=get_dates(4)[0],
                best_by_date=get_dates(3)[0],
                pickup_window_start=get_dates(4)[1],
                pickup_window_end=get_dates(4)[2],
                allergens=["Milk", "Wheat", "Soy"],
                is_perishable=True,
                storage_instructions="Keep refrigerated",
                handling_instructions="Reheat thoroughly before consuming",
                temperature_requirements="Below 40°F",
                image_url="/meal-box.jpg",
                status=FoodStatus.AVAILABLE
            ),
            FoodListing(
                provider_id=provider.id,
                title="Assorted Snacks",
                description="Mixed healthy snacks including granola bars and dried fruits",
                food_type=FoodType.OTHER,
                quantity=25,
                unit="packages",
                original_price=50.00,
                discounted_price=24.99,
                expiration_date=get_dates(90)[0],
                best_by_date=get_dates(60)[0],
                pickup_window_start=get_dates(30)[1],
                pickup_window_end=get_dates(30)[2],
                allergens=["Nuts", "Soy"],
                is_perishable=False,
                storage_instructions="Store in a cool, dry place",
                handling_instructions="Check package integrity",
                temperature_requirements="Room temperature",
                image_url="/snck.jpg",
                status=FoodStatus.AVAILABLE
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

# Helper function to create datetime objects
def get_dates(days_until_expiry=7, pickup_window_hours=48):
    now = datetime.now()
    expiry = now + timedelta(days=days_until_expiry)
    pickup_start = now + timedelta(hours=1)
    pickup_end = pickup_start + timedelta(hours=pickup_window_hours)
    return expiry, pickup_start, pickup_end 