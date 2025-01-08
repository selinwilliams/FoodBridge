from .db import db, environment, SCHEMA, add_prefix_for_prod

class Provider(db.Model):
    __tablename__ = 'providers'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    business_name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.Text, nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    business_type = db.Column(db.String(50))  # restaurant, grocery, farm
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relationships
    user = db.relationship('User', back_populates='provider')
    food_listings = db.relationship('FoodListing', back_populates='provider', cascade="all, delete-orphan")
    donation_records = db.relationship('DonationTaxRecord', back_populates='provider', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'business_name': self.business_name,
            'address': self.address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'business_type': self.business_type,
            'created_at': self.created_at.isoformat()
        } 

    @classmethod
    def get_nearby_providers(cls, latitude, longitude, radius_km=10):
        """Find providers within a certain radius"""
        from sqlalchemy import text
        radius = radius_km / 111  # Rough conversion to degrees
        query = text("""
            SELECT * FROM providers
            WHERE (latitude BETWEEN :lat - :radius AND :lat + :radius)
            AND (longitude BETWEEN :lng - :radius AND :lng + :radius)
        """)
        return cls.query.from_self().filter(text(
            "(latitude BETWEEN :lat - :radius AND :lat + :radius) "
            "AND (longitude BETWEEN :lng - :radius AND :lng + :radius)"
        )).params(lat=latitude, lng=longitude, radius=radius).all()

    def get_active_listings(self):
        """Get all active food listings for this provider"""
        return [l for l in self.food_listings if l.status == 'available']

    def get_total_donations(self):
        """Calculate total donations value"""
        return sum(record.food_value for record in self.donation_records) 

    @classmethod
    def create_provider(cls, user_id, data):
        """Create a new provider profile"""
        provider = cls(
            user_id=user_id,
            business_name=data.get('business_name'),
            address=data.get('address'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            business_type=data.get('business_type')
        )
        db.session.add(provider)
        db.session.commit()
        return provider

    def update_provider(self, data):
        """Update provider details"""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        db.session.commit()
        return self

    def get_donation_statistics(self):
        """Get provider's donation statistics"""
        total_donations = len(self.donation_records)
        total_value = sum(record.food_value for record in self.donation_records)
        total_deductions = sum(record.tax_deduction_amount or 0 for record in self.donation_records)
        
        return {
            'total_donations': total_donations,
            'total_value': total_value,
            'total_deductions': total_deductions,
            'average_donation_value': total_value / total_donations if total_donations > 0 else 0
        }

    def get_reservation_history(self):
        """Get provider's reservation history"""
        reservations = []
        for listing in self.food_listings:
            reservations.extend(listing.reservations)
        return sorted(reservations, key=lambda x: x.created_at, reverse=True) 

    def get_provider_stats(self):
        """Get provider's impact statistics"""
        completed_reservations = [r for l in self.food_listings 
                                for r in l.reservations if r.status == 'completed']
        return {
            'total_meals_provided': sum(r.estimated_meals for r in self.donation_records),
            'food_waste_reduced': sum(r.food_value for r in self.donation_records),
            'total_recipients_helped': len(set(r.recipient_id for r in completed_reservations)),
            'most_common_items': self.get_most_donated_items(),
            'peak_donation_times': self.get_peak_donation_times()
        }
    
    def get_most_donated_items(self):
        """Get most frequently donated items"""
        from collections import Counter
        items = [listing.title.lower() for listing in self.food_listings]
        return Counter(items).most_common(5)
    
    def get_peak_donation_times(self):
        """Analyze peak donation times"""
        from collections import Counter
        times = [listing.created_at.hour for listing in self.food_listings]
        return Counter(times).most_common(3) 