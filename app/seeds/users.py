from app.models import db, User, environment, UserType, SCHEMA
from sqlalchemy.sql import text

def seed_users():
    # First, clear existing data
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM users"))

    # Create seed data
    users = [
        User(
            username='Demo',
            email='demo@aa.io',
            password='password',
            user_type=UserType.RECIPIENT
        ),
        User(
            username='DemoProvider',
            email='provider@aa.io',
            password='password',
            user_type=UserType.PROVIDER
        ),
        User(
            username='FoodBank1',
            email='foodbank1@test.io',
            password='password',
            user_type=UserType.PROVIDER
        ),
        User(
            username='Recipient1',
            email='recipient1@test.io',
            password='password',
            user_type=UserType.RECIPIENT
        ),
        User(
            username='Restaurant1',
            email='restaurant1@test.io',
            password='password',
            user_type=UserType.PROVIDER
        )
    ]

    # Add all users to session
    db.session.add_all(users)
    db.session.commit()

    return users

def undo_users():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM users"))
    
    db.session.commit()
