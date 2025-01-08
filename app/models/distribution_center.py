from .db import db, environment, SCHEMA, add_prefix_for_prod

class DistributionCenter(db.Model):
    __tablename__ = 'distribution_centers'

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

    # Relationships
    food_listings = db.relationship('FoodListing', back_populates='distribution_center', cascade="all, delete-orphan")

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
            'created_at': self.created_at.isoformat()
        } 

    @classmethod
    def get_nearby_centers(cls, latitude, longitude, radius_km=10):
        """Find centers within a certain radius"""
        radius = radius_km / 111  # Rough conversion to degrees
        return cls.query.filter(
            cls.latitude.between(latitude - radius, latitude + radius),
            cls.longitude.between(longitude - radius, longitude + radius)
        ).all()

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
            'capacity_status': 'available' if current < 100 else 'full',
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