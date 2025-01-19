from .db import db, environment, SCHEMA, add_prefix_for_prod
from .reservation import Reservation
import re
import json
from sqlalchemy.orm import validates
from math import radians, cos, sin, asin, sqrt
from sqlalchemy import func
from sqlalchemy import text

class DistributionCenter(db.Model):
    __tablename__ = 'distribution_centers'

    # Add indexes for frequently queried fields
    __table_args__ = (
        db.Index('idx_lat_long', 'latitude', 'longitude'),
        {'schema': SCHEMA} if environment == "production" else None
    )

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.Text, nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    contact_person = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    operating_hours = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    email = db.Column(db.String(255))
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(),
                          onupdate=db.func.current_timestamp())
    image_url = db.Column(db.String(255))
    capacity_limit = db.Column(db.Integer, default=100)
    status = db.Column(db.String(50), default='active')

    # Relationships
    food_listings = db.relationship('FoodListing', back_populates='distribution_center', cascade="all, delete-orphan")

    # Add validation for coordinates
    @validates('latitude')
    def validate_latitude(self, key, value):
        if value is not None and not -90 <= value <= 90:
            raise ValueError("Latitude must be between -90 and 90")
        return value

    @validates('longitude')
    def validate_longitude(self, key, value):
        if value is not None and not -180 <= value <= 180:
            raise ValueError("Longitude must be between -180 and 180")
        return value

    # Add phone validation
    @validates('phone')
    def validate_phone(self, key, value):
        if value:
            # Remove any non-digit characters for validation
            digits_only = ''.join(filter(str.isdigit, value))
            if not 9 <= len(digits_only) <= 15:
                raise ValueError("Phone number must have 9-15 digits")
        return value

    # Add operating_hours validation
    @validates('operating_hours')
    def validate_operating_hours(self, key, value):
        # Implement validation based on your hours format
        # Example: JSON format with days of week
        if value:
            try:
                hours = json.loads(value)
                # Add your validation logic here
            except json.JSONDecodeError:
                raise ValueError("Operating hours must be valid JSON")
        return value

    def __repr__(self):
        return f'<DistributionCenter {self.name} at {self.address}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'contact_person': self.contact_person,
            'phone': self.phone,
            'operating_hours': self.operating_hours,
            'email': self.email,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'active_listings': [
                {
                    'id': listing.id,
                    'title': listing.title,
                    'status': listing.status.value if hasattr(listing.status, 'value') else listing.status
                }
                for listing in self.food_listings 
                if listing.status not in ['CANCELLED', 'EXPIRED']
            ] if self.food_listings else []
        } 

    @classmethod
    def get_nearby_centers(cls, latitude, longitude, radius_km=10):
        """Find centers within a certain radius"""
        try:
            # Convert radius from km to degrees (approximate)
            radius_deg = radius_km / 111.0
            
            # Query using simple bounding box first
            centers = cls.query.filter(
                cls.latitude.between(latitude - radius_deg, latitude + radius_deg),
                cls.longitude.between(longitude - radius_deg, longitude + radius_deg)
            ).all()
            
            # Calculate actual distances and filter
            result = []
            for center in centers:
                # Haversine formula
                lat1, lon1 = radians(latitude), radians(longitude)
                lat2, lon2 = radians(center.latitude), radians(center.longitude)
                
                dlat = lat2 - lat1
                dlon = lon2 - lon1
                
                a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
                c = 2 * asin(sqrt(a))
                distance = 6371 * c  # Earth's radius in km
                
                if distance <= radius_km:
                    center_dict = center.to_dict()
                    center_dict['distance'] = round(distance, 2)
                    result.append(center_dict)
            
            print(f"Found {len(result)} centers")  # Debug print
            return sorted(result, key=lambda x: x['distance'])
            
        except Exception as e:
            print(f"Error in get_nearby_centers: {str(e)}")  # Debug print
            return []

    def get_current_inventory(self):
        """Get all available food listings at this center"""
        return [l for l in self.food_listings if l.status == 'available']

    def is_open(self):
        """Check if center is currently open"""
        from datetime import datetime
        import pytz
        # Implement based on operating_hours format
        # This is a basic example
        return True  # Replace with actual logic 

    @classmethod
    def create_center(cls, data):
        """Create a new distribution center"""
        center = cls(
            name=data.get('name'),
            address=data.get('address'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            contact_person=data.get('contact_person'),
            phone=data.get('phone'),
            operating_hours=data.get('operating_hours')
        )
        db.session.add(center)
        db.session.commit()
        return center

    def update_center(self, data):
        """Update center details"""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        db.session.commit()
        return self

    def get_daily_schedule(self, date):
        """Get center's schedule for a specific date"""
        # Implement based on your operating_hours format
        pass

    def get_capacity_status(self):
        """Get current capacity status"""
        current_inventory = len(self.get_current_inventory())
        # Implement your capacity logic
        return {
            'current_inventory': current_inventory,
            'status': 'available' if current_inventory < 100 else 'full'
        } 

    def get_weekly_schedule(self):
        """Get center's weekly schedule"""
        from datetime import datetime, timedelta
        week_end = datetime.utcnow() + timedelta(days=7)
        return Reservation.query.join(FoodListing).filter(
            FoodListing.distribution_center_id == self.id,
            Reservation.pickup_time <= week_end,
            Reservation.status.in_(['pending', 'confirmed'])
        ).order_by(Reservation.pickup_time).all()

    def get_capacity_metrics(self):
        """Get center's capacity metrics"""
        current = len(self.get_current_inventory())
        return {
            'current_items': current,
            'capacity_status': 'available' if current < self.capacity_limit else 'full',
            'upcoming_pickups': len([l for l in self.food_listings 
                                   if any(r.status == 'confirmed' for r in l.reservations)])
        } 

    def get_impact_metrics(self, start_date=None, end_date=None):
        """Get center's impact metrics"""
        from datetime import datetime, timedelta
        
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        if not end_date:
            end_date = datetime.utcnow()
            
        completed_listings = [l for l in self.food_listings 
                            if any(r.status == 'completed' for r in l.reservations)]
        
        return {
            'total_food_distributed': sum(l.quantity for l in completed_listings),
            'total_listings_processed': len(completed_listings),
            'unique_providers': len(set(l.provider_id for l in completed_listings)),
            'unique_recipients': len(set(r.recipient_id for l in completed_listings 
                                      for r in l.reservations if r.status == 'completed')),
            'busiest_times': self.get_busiest_times(),
            'most_common_items': self.get_most_common_items()
        }
    
    def get_busiest_times(self):
        """Analyze busiest times for pickups"""
        from collections import Counter
        pickup_times = [r.pickup_time.hour 
                       for l in self.food_listings 
                       for r in l.reservations if r.status == 'completed']
        return Counter(pickup_times).most_common(3)
    
    def get_most_common_items(self):
        """Get most common food items processed"""
        from collections import Counter
        items = [l.title.lower() for l in self.food_listings]
        return Counter(items).most_common(5) 