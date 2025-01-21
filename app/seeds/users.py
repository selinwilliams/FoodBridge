from app.models import db, User, environment, UserType, SCHEMA
from sqlalchemy.sql import text

def seed_users():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM users"))
        
    users = [
        # Admin user
        User(
            username='admin',
            email='admin@foodbridge.com',
            password='password',
            user_type=UserType.ADMIN
        ),
        
        # Demo recipient
        User(
            username='demo_recipient',
            email='recipient@foodbridge.com',
            password='password',
            user_type=UserType.RECIPIENT
        ),
        
        # Provider users
        User(
            username='demo_provider',
            email='provider@foodbridge.com',
            password='password',
            user_type=UserType.PROVIDER
        ),
        User(
            username='freshbakery',
            email='freshbakery@foodbridge.com',
            password='password',
            user_type=UserType.PROVIDER
        ),
        User(
            username='organicfarms',
            email='organicfarms@foodbridge.com',
            password='password',
            user_type=UserType.PROVIDER
        ),
        User(
            username='localmarket',
            email='localmarket@foodbridge.com',
            password='password',
            user_type=UserType.PROVIDER
        ),
        User(
            username='italianrest',
            email='italianrest@foodbridge.com',
            password='password',
            user_type=UserType.PROVIDER
        ),
        User(
            username='cafebeans',
            email='cafebeans@foodbridge.com',
            password='password',
            user_type=UserType.PROVIDER
        ),
        User(
            username='asianfusion',
            email='asianfusion@foodbridge.com',
            password='password',
            user_type=UserType.PROVIDER
        ),
        User(
            username='wholefoods',
            email='wholefoods@foodbridge.com',
            password='password',
            user_type=UserType.PROVIDER
        ),
        User(
            username='sweetstop',
            email='sweetstop@foodbridge.com',
            password='password',
            user_type=UserType.PROVIDER
        ),
        User(
            username='mexicanfood',
            email='mexicanfood@foodbridge.com',
            password='password',
            user_type=UserType.PROVIDER
        ),
        User(
            username='farmersmarket',
            email='farmersmarket@foodbridge.com',
            password='password',
            user_type=UserType.PROVIDER
        ),
        User(
            username='coffeeroasters',
            email='coffeeroasters@foodbridge.com',
            password='password',
            user_type=UserType.PROVIDER
        ),
        
        # Additional recipient users
        User(
            username='shelter_one',
            email='shelter1@foodbridge.com',
            password='password',
            user_type=UserType.RECIPIENT
        ),
        User(
            username='food_pantry',
            email='pantry@foodbridge.com',
            password='password',
            user_type=UserType.RECIPIENT
        ),
        User(
            username='community_kitchen',
            email='kitchen@foodbridge.com',
            password='password',
            user_type=UserType.RECIPIENT
        ),
        User(
            username='youth_center',
            email='youth@foodbridge.com',
            password='password',
            user_type=UserType.RECIPIENT
        ),
        User(
            username='senior_center',
            email='senior@foodbridge.com',
            password='password',
            user_type=UserType.RECIPIENT
        ),
        User(
            username='homeless_shelter',
            email='homeless@foodbridge.com',
            password='password',
            user_type=UserType.RECIPIENT
        ),
        User(
            username='family_services',
            email='family@foodbridge.com',
            password='password',
            user_type=UserType.RECIPIENT
        ),
        User(
            username='veterans_support',
            email='veterans@foodbridge.com',
            password='password',
            user_type=UserType.RECIPIENT
        ),
        User(
            username='womens_shelter',
            email='womens@foodbridge.com',
            password='password',
            user_type=UserType.RECIPIENT
        ),
        User(
            username='food_bank',
            email='foodbank@foodbridge.com',
            password='password',
            user_type=UserType.RECIPIENT
        )
    ]
    
    for user in users:
        db.session.add(user)
    
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
