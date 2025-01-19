from app.models import db, User, Provider, environment, SCHEMA, BusinessType

def seed_providers():
    demo_provider = Provider(
        user_id=1,
        business_name='Demo Restaurant',
        business_type=BusinessType.RESTAURANT,
        address='123 Demo St',
        city='Demo City',
        state='CA',
        zip_code='12345',
        phone='123-456-7890'
    )

    db.session.add(demo_provider)
    db.session.commit()

def undo_providers():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.providers RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("DELETE FROM providers")
        
    db.session.commit() 