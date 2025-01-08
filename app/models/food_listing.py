from .db import db, environment, SCHEMA, add_prefix_for_prod

class FoodListing(db.Model):
    __tablename__ = 'food_listings'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('providers.id')), nullable=False)
    distribution_center_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('distribution_centers.id')))
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(50))
    expiration_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), default='available')  # available, reserved, completed
    allergens = db.Column(db.ARRAY(db.String))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relationships
    provider = db.relationship('Provider', back_populates='food_listings')
    distribution_center = db.relationship('DistributionCenter', back_populates='food_listings')
    reservations = db.relationship('Reservation', back_populates='food_listing', cascade="all, delete-orphan")
    donation_records = db.relationship('DonationTaxRecord', back_populates='food_listing', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'provider_id': self.provider_id,
            'distribution_center_id': self.distribution_center_id,
            'title': self.title,
            'description': self.description,
            'quantity': self.quantity,
            'unit': self.unit,
            'expiration_date': self.expiration_date.isoformat(),
            'status': self.status,
            'allergens': self.allergens,
            'created_at': self.created_at.isoformat(),
            'provider': self.provider.to_dict() if self.provider else None,
            'distribution_center': self.distribution_center.to_dict() if self.distribution_center else None
        } 

    @classmethod
    def get_available_listings(cls):
        """Get all available food listings"""
        return cls.query.filter(cls.status == 'available').all()

    @classmethod
    def get_expiring_soon(cls, hours=24):
        """Get listings expiring within specified hours"""
        from datetime import datetime, timedelta
        expiry_threshold = datetime.utcnow() + timedelta(hours=hours)
        return cls.query.filter(
            cls.status == 'available',
            cls.expiration_date <= expiry_threshold
        ).all()

    def is_available(self):
        """Check if listing is still available"""
        return self.status == 'available'

    def reserve(self, recipient_id):
        """Reserve this listing"""
        if self.is_available():
            self.status = 'reserved'
            reservation = Reservation(
                listing_id=self.id,
                recipient_id=recipient_id,
                status='pending'
            )
            db.session.add(reservation)
            return reservation
        return None 

    @classmethod
    def create_listing(cls, provider_id, data):
        """Create a new food listing"""
        listing = cls(
            provider_id=provider_id,
            title=data.get('title'),
            description=data.get('description'),
            quantity=data.get('quantity'),
            unit=data.get('unit'),
            expiration_date=data.get('expiration_date'),
            allergens=data.get('allergens', []),
            distribution_center_id=data.get('distribution_center_id')
        )
        db.session.add(listing)
        db.session.commit()
        return listing

    @classmethod
    def search_listings(cls, filters=None):
        """Search listings with filters"""
        query = cls.query.filter(cls.status == 'available')
        
        if filters:
            if filters.get('allergens_exclude'):
                query = query.filter(~cls.allergens.overlap(filters['allergens_exclude']))
            
            if filters.get('provider_id'):
                query = query.filter(cls.provider_id == filters['provider_id'])
            
            if filters.get('distribution_center_id'):
                query = query.filter(cls.distribution_center_id == filters['distribution_center_id'])

        return query.all()

    def update_listing(self, data):
        """Update listing details"""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        db.session.commit()
        return self

    def delete_listing(self):
        """Delete listing if no active reservations"""
        active_reservations = [r for r in self.reservations if r.status in ['pending', 'confirmed']]
        if not active_reservations:
            db.session.delete(self)
            db.session.commit()
            return True
        return False

    def check_expiration(self):
        """Check if listing is expired"""
        from datetime import datetime
        return datetime.utcnow() > self.expiration_date 

    @classmethod
    def get_listings_by_location(cls, lat, lng, radius_km=10):
        """Get listings within radius of location"""
        return cls.query.join(Provider).filter(
            Provider.latitude.between(lat - radius_km/111, lat + radius_km/111),
            Provider.longitude.between(lng - radius_km/111, lng + radius_km/111),
            cls.status == 'available'
        ).all()

    def get_pickup_instructions(self):
        """Get formatted pickup instructions"""
        if self.distribution_center_id:
            return {
                'location': self.distribution_center.address,
                'contact': self.distribution_center.contact_person,
                'phone': self.distribution_center.phone,
                'hours': self.distribution_center.operating_hours
            }
        return {
            'location': self.provider.address,
            'business_name': self.provider.business_name,
            'contact': self.provider.user.first_name
        } 

    def get_similar_listings(self):
        """Find similar food listings"""
        return FoodListing.query.filter(
            FoodListing.status == 'available',
            FoodListing.provider_id != self.provider_id,
            FoodListing.allergens.overlap(self.allergens)
        ).limit(5).all()

    @classmethod
    def search_by_food_type(cls, food_type, **filters):
        """Search listings by food type with additional filters"""
        query = cls.query.filter(cls.status == 'available')
        
        if food_type:
            query = query.filter(cls.title.ilike(f'%{food_type}%'))
        
        if filters.get('expiring_within'):
            from datetime import datetime, timedelta
            threshold = datetime.utcnow() + timedelta(hours=filters['expiring_within'])
            query = query.filter(cls.expiration_date <= threshold)
            
        if filters.get('min_quantity'):
            query = query.filter(cls.quantity >= filters['min_quantity'])
            
        return query.order_by(cls.created_at.desc()).all() 