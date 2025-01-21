from app.models import db, User, Provider, environment, SCHEMA, BusinessType
from sqlalchemy.sql import text

def seed_providers():
    providers_data = [
        {
            'email': 'provider@foodbridge.com',
            'business_name': 'Demo Restaurant',
            'business_type': BusinessType.RESTAURANT,
            'address': '123 Demo St',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94110',
            'phone': '123-456-7890'
        },
        {
            'email': 'freshbakery@foodbridge.com',
            'business_name': 'Fresh Morning Bakery',
            'business_type': BusinessType.BAKERY,
            'address': '456 Market St',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94102',
            'phone': '415-555-0101'
        },
        {
            'email': 'organicfarms@foodbridge.com',
            'business_name': 'Bay Area Organic Farms',
            'business_type': BusinessType.FARM,
            'address': '789 Farm Road',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94124',
            'phone': '415-555-0102'
        },
        {
            'email': 'localmarket@foodbridge.com',
            'business_name': 'Local Market & Deli',
            'business_type': BusinessType.GROCERY,
            'address': '321 Valencia St',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94103',
            'phone': '415-555-0103'
        },
        {
            'email': 'italianrest@foodbridge.com',
            'business_name': 'Little Italy Restaurant',
            'business_type': BusinessType.RESTAURANT,
            'address': '567 Columbus Ave',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94133',
            'phone': '415-555-0104'
        },
        {
            'email': 'cafebeans@foodbridge.com',
            'business_name': 'Cafe Beans & More',
            'business_type': BusinessType.CAFE,
            'address': '890 Hayes St',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94117',
            'phone': '415-555-0105'
        },
        {
            'email': 'asianfusion@foodbridge.com',
            'business_name': 'Asian Fusion Kitchen',
            'business_type': BusinessType.RESTAURANT,
            'address': '432 Clement St',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94118',
            'phone': '415-555-0106'
        },
        {
            'email': 'wholefoods@foodbridge.com',
            'business_name': 'Whole Foods Market SF',
            'business_type': BusinessType.GROCERY,
            'address': '1765 California St',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94109',
            'phone': '415-555-0107'
        },
        {
            'email': 'sweetstop@foodbridge.com',
            'business_name': 'Sweet Stop Bakery',
            'business_type': BusinessType.BAKERY,
            'address': '234 Fillmore St',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94115',
            'phone': '415-555-0108'
        },
        {
            'email': 'mexicanfood@foodbridge.com',
            'business_name': 'Authentic Mexican Grill',
            'business_type': BusinessType.RESTAURANT,
            'address': '678 Mission St',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94105',
            'phone': '415-555-0109'
        },
        {
            'email': 'farmersmarket@foodbridge.com',
            'business_name': 'City Farmers Market',
            'business_type': BusinessType.GROCERY,
            'address': '901 Castro St',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94114',
            'phone': '415-555-0110'
        },
        {
            'email': 'coffeeroasters@foodbridge.com',
            'business_name': 'SF Coffee Roasters',
            'business_type': BusinessType.CAFE,
            'address': '543 Divisadero St',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94117',
            'phone': '415-555-0111'
        }
    ]

    # First, clear existing data
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.providers RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM providers"))

    for provider_data in providers_data:
        # Create or get user
        email = provider_data.pop('email')
        user = User.query.filter(User.email == email).first()
        
        if not user:
            # If this is a production error, you might want to handle it differently
            print(f"Warning: User with email {email} not found. Skipping provider creation.")
            continue

        # Create provider
        provider = Provider(
            user_id=user.id,
            **provider_data
        )
        
        try:
            db.session.add(provider)
        except Exception as e:
            print(f"Error adding provider {provider_data['business_name']}: {str(e)}")
            db.session.rollback()
            continue

    try:
        db.session.commit()
        print("Successfully seeded providers")
    except Exception as e:
        print(f"Error committing providers: {str(e)}")
        db.session.rollback()
        raise e

def undo_providers():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.providers RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM providers"))
        
    db.session.commit() 