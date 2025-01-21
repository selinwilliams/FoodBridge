from app.models import db, User, Provider, environment, SCHEMA, BusinessType
from sqlalchemy.sql import text

def seed_providers():
    print("\n=== Starting Provider Seeding ===")
    
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.providers RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM providers"))
        
    # Get the demo provider user
    demo_provider_user = User.query.filter(User.email == 'provider@foodbridge.com').first()
    
    if not demo_provider_user:
        raise Exception("Demo provider user not found! Make sure to seed users first.")
    
    demo_provider = Provider(
        user_id=demo_provider_user.id,
        business_name='Demo Restaurant',
        business_type=BusinessType.RESTAURANT,
        address='123 Demo St',
        city='Demo City',
        state='CA',
        zip_code='12345',
        phone='123-456-7890'
    )

    try:
        db.session.add(demo_provider)
        db.session.commit()
        print("Successfully seeded providers")
    except Exception as e:
        print(f"Error seeding providers: {str(e)}")
        db.session.rollback()
        raise e

def undo_providers():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.providers RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM providers"))
        
    db.session.commit() 