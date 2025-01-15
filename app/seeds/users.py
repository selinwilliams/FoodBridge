from app.models import db, User, environment, UserType, SCHEMA
from sqlalchemy.sql import text

def seed_users():
    print("\n=== Starting User Seeding ===")
    
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM users"))
        
    admin = User(
        username='admin',
        email='admin@foodbridge.com',
        password='password',  # This will be hashed by the model
        user_type=UserType.ADMIN
    )
    
    demo_provider = User(
        username='demo_provider',
        email='provider@foodbridge.com',
        password='password',
        user_type=UserType.PROVIDER
    )
    
    demo_recipient = User(
        username='demo_recipient',
        email='recipient@foodbridge.com',
        password='password',
        user_type=UserType.RECIPIENT
    )
    
    db.session.add(admin)
    db.session.add(demo_provider)
    db.session.add(demo_recipient)
    
    try:
        db.session.commit()
        print("Successfully seeded users")
        print(f"Admin credentials: admin@foodbridge.com / password")
    except Exception as e:
        print(f"Error seeding users: {str(e)}")
        db.session.rollback()
        raise e

def undo_users():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM users"))
    
    db.session.commit()
