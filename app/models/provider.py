from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime
from enum import Enum
from sqlalchemy.orm import validates
import re

class BusinessType(Enum):
    RESTAURANT = 'restaurant'
    GROCERY = 'grocery'
    CAFE = 'cafe'
    BAKERY = 'bakery'
    HOTEL = 'hotel'
    CATERING = 'catering'
    FARM = 'farm'
    OTHER = 'other'

class Provider(db.Model):
    __tablename__ = 'providers'

    if environment == "production":
        __table_args__ = (
            db.UniqueConstraint('business_name', name='uq_business_name'),
            db.Index('idx_business_type', 'business_type'),
            {'schema': SCHEMA}
        )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    business_name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.Text, nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    business_type = db.Column(db.Enum(BusinessType), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # New columns
    description = db.Column(db.Text)  # Business description
    website = db.Column(db.String(255))
    phone = db.Column(db.String(20))
    operating_hours = db.Column(db.JSON)  # Store hours for each day
    is_verified = db.Column(db.Boolean, default=False)
    average_rating = db.Column(db.Float, default=0.0)
    total_ratings = db.Column(db.Integer, default=0)
    sustainability_score = db.Column(db.Integer, default=0)  # Track waste reduction impact

    # Relationships
    user = db.relationship('User', back_populates='provider')
    food_listings = db.relationship('FoodListing', back_populates='provider', cascade="all, delete-orphan")
    ratings = db.relationship('ProviderRating', back_populates='provider', cascade="all, delete-orphan")
    donation_records = db.relationship('DonationTaxRecord', back_populates='provider')

    @validates('email')
    def validate_email(self, key, email):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise ValueError('Invalid email address')
        return email

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'business_name': self.business_name,
            'address': self.address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'business_type': self.business_type.value,
            'description': self.description,
            'website': self.website,
            'phone': self.phone,
            'operating_hours': self.operating_hours,
            'is_verified': self.is_verified,
            'average_rating': self.average_rating,
            'total_ratings': self.total_ratings,
            'sustainability_score': self.sustainability_score,
            'created_at': self.created_at.isoformat()
        }

    @classmethod
    def get_nearby_providers(cls, latitude, longitude, radius_km=10):
        """Find providers within a certain radius"""
        from sqlalchemy import text
        radius = radius_km / 111  # Rough conversion to degrees
        return cls.query.from_self().filter(text(
            "(latitude BETWEEN :lat - :radius AND :lat + :radius) "
            "AND (longitude BETWEEN :lng - :radius AND :lng + :radius)"
        )).params(lat=latitude, lng=longitude, radius=radius).all()

    def get_active_listings(self):
        """Get all active food listings"""
        return [l for l in self.food_listings if l.status == 'available']

    def get_waste_reduction_impact(self):
        """Calculate provider's waste reduction impact"""
        completed_listings = [l for l in self.food_listings 
                            if l.status == 'completed']
        return {
            'total_kg_saved': sum(l.quantity for l in completed_listings),
            'total_listings': len(self.food_listings),
            'successful_listings': len(completed_listings),
            'co2_emissions_saved': self.calculate_co2_savings(completed_listings),
            'sustainability_score': self.calculate_sustainability_score()
        }

    def calculate_co2_savings(self, completed_listings):
        """Calculate CO2 emissions saved from food waste reduction"""
        # Average CO2 emissions per kg of food waste: 2.5 kg CO2
        return sum(l.quantity * 2.5 for l in completed_listings)

    def calculate_sustainability_score(self):
        """Calculate provider's sustainability score"""
        completed_listings = len([l for l in self.food_listings if l.status == 'completed'])
        total_listings = len(self.food_listings) if self.food_listings else 1
        success_rate = (completed_listings / total_listings) * 100
        
        # Update sustainability score
        self.sustainability_score = int(success_rate)
        db.session.commit()
        
        return self.sustainability_score

    def get_listing_statistics(self):
        """Get detailed listing statistics"""
        return {
            'total_listings': len(self.food_listings),
            'active_listings': len(self.get_active_listings()),
            'completed_listings': len([l for l in self.food_listings if l.status == 'completed']),
            'expired_listings': len([l for l in self.food_listings if l.status == 'expired']),
            'average_pickup_time': self.calculate_average_pickup_time(),
            'most_common_items': self.get_most_listed_items(),
            'peak_listing_times': self.get_peak_listing_times()
        }

    def calculate_average_pickup_time(self):
        """Calculate average time between listing and pickup"""
        completed_listings = [l for l in self.food_listings if l.status == 'completed']
        if not completed_listings:
            return 0
        
        total_hours = sum((l.pickup_time - l.created_at).total_seconds() / 3600 
                         for l in completed_listings)
        return total_hours / len(completed_listings)

    def get_most_listed_items(self):
        """Get most frequently listed items"""
        from collections import Counter
        items = [listing.food_type.lower() for listing in self.food_listings]
        return Counter(items).most_common(5)

    def get_peak_listing_times(self):
        """Analyze peak listing times"""
        from collections import Counter
        times = [listing.created_at.hour for listing in self.food_listings]
        return Counter(times).most_common(3)

    def update_rating(self, new_rating):
        """Update provider's average rating"""
        self.total_ratings += 1
        self.average_rating = ((self.average_rating * (self.total_ratings - 1)) + new_rating) / self.total_ratings
        db.session.commit()

    def is_operating_now(self):
        """Check if provider is currently operating"""
        if not self.operating_hours:
            return False
            
        now = datetime.now()
        day_of_week = now.strftime('%A').lower()
        hours = self.operating_hours.get(day_of_week)
        
        if not hours:
            return False
            
        current_time = now.strftime('%H:%M')
        return hours['open'] <= current_time <= hours['close']

    @classmethod
    def create_provider(cls, user_id, data):
        """Create a new provider profile"""
        try:
            business_type = BusinessType(data.get('business_type').lower())
        except ValueError:
            raise ValueError("Invalid business type. Must be restaurant, grocery, farm, or other")

        provider = cls(
            user_id=user_id,
            business_name=data.get('business_name'),
            address=data.get('address'),
            business_type=business_type,
            latitude=data.get('latitude'),
            longitude=data.get('longitude')
        )
        db.session.add(provider)
        db.session.commit()
        return provider