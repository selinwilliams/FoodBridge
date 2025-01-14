from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime
from enum import Enum
from sqlalchemy.orm import validates

class FoodStatus(Enum):
    AVAILABLE = 'available'
    RESERVED = 'reserved'
    COMPLETED = 'completed'
    EXPIRED = 'expired'
    CANCELLED = 'cancelled'

class FoodType(Enum):
    PREPARED_MEALS = 'prepared_meals'
    PRODUCE = 'produce'
    BAKERY = 'bakery'
    DAIRY = 'dairy'
    MEAT = 'meat'
    PANTRY = 'pantry'
    BEVERAGES = 'beverages'
    OTHER = 'other'

class FoodListing(db.Model):
    __tablename__ = 'food_listings'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('providers.id')), nullable=False)
    distribution_center_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('distribution_centers.id')))
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    food_type = db.Column(db.Enum(FoodType), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(50))
    original_price = db.Column(db.Float)  # Original retail price
    discounted_price = db.Column(db.Float)  # Optional discounted price
    expiration_date = db.Column(db.DateTime, nullable=False)
    best_by_date = db.Column(db.DateTime)  # Optional best by date
    pickup_window_start = db.Column(db.DateTime, nullable=False)
    pickup_window_end = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Enum(FoodStatus), default=FoodStatus.AVAILABLE)
    allergens = db.Column(db.ARRAY(db.String))
    storage_instructions = db.Column(db.Text)
    handling_instructions = db.Column(db.Text)
    is_perishable = db.Column(db.Boolean, default=True)
    temperature_requirements = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    available_quantity = db.Column(db.Float)  # Tracks remaining quantity
    image_url = db.Column(db.String(255))  # Optional food image

    # Relationships
    provider = db.relationship('Provider', back_populates='food_listings')
    distribution_center = db.relationship('DistributionCenter', back_populates='food_listings')
    reservations = db.relationship('Reservation', back_populates='food_listing', cascade="all, delete-orphan")
    donation_records = db.relationship('DonationTaxRecord', back_populates='food_listing')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.available_quantity = self.quantity  # Initialize available quantity

    def to_dict(self):
        return {
            'id': self.id,
            'provider_id': self.provider_id,
            'distribution_center_id': self.distribution_center_id,
            'title': self.title,
            'description': self.description,
            'food_type': self.food_type.value,
            'quantity': self.quantity,
            'available_quantity': self.available_quantity,
            'unit': self.unit,
            'original_price': self.original_price,
            'discounted_price': self.discounted_price,
            'expiration_date': self.expiration_date.isoformat(),
            'best_by_date': self.best_by_date.isoformat() if self.best_by_date else None,
            'pickup_window_start': self.pickup_window_start.isoformat(),
            'pickup_window_end': self.pickup_window_end.isoformat(),
            'status': self.status.value,
            'allergens': self.allergens,
            'storage_instructions': self.storage_instructions,
            'handling_instructions': self.handling_instructions,
            'is_perishable': self.is_perishable,
            'temperature_requirements': self.temperature_requirements,
            'created_at': self.created_at.isoformat(),
            'image_url': self.image_url,
            'provider': self.provider.to_dict() if self.provider else None,
            'distribution_center': self.distribution_center.to_dict() if self.distribution_center else None
        }

    @classmethod
    def create_listing(cls, provider_id, data):
        """Create a new food listing with validation"""
        # Convert string dates to datetime objects and make them timezone-naive
        expiration_date = datetime.fromisoformat(data.get('expiration_date').replace('Z', '')).replace(tzinfo=None)
        pickup_window_start = datetime.fromisoformat(data.get('pickup_window_start').replace('Z', '')).replace(tzinfo=None)
        pickup_window_end = datetime.fromisoformat(data.get('pickup_window_end').replace('Z', '')).replace(tzinfo=None)
        
        # Get current time as naive datetime
        current_time = datetime.utcnow()
        
        # Validate dates
        if current_time >= expiration_date:
            raise ValueError("Expiration date must be in the future")
        if current_time >= pickup_window_start:
            raise ValueError("Pickup window must be in the future")
        if pickup_window_end <= pickup_window_start:
            raise ValueError("Pickup window end must be after start")
        
        # Convert food type string to enum
        food_type = FoodType[data.get('food_type')]

        listing = cls(
            provider_id=provider_id,
            title=data.get('title'),
            description=data.get('description'),
            food_type=food_type,
            quantity=data.get('quantity'),
            unit=data.get('unit'),
            expiration_date=expiration_date,
            pickup_window_start=pickup_window_start,
            pickup_window_end=pickup_window_end,
            is_perishable=data.get('is_perishable', True)
        )
        db.session.add(listing)
        db.session.commit()
        return listing

    def update_quantity(self, reserved_quantity):
        """Update available quantity and status"""
        if reserved_quantity <= self.available_quantity:
            self.available_quantity -= reserved_quantity
            if self.available_quantity == 0:
                self.status = FoodStatus.RESERVED
            db.session.commit()
            return True
        return False

    def check_availability(self):
        """Check if listing is still valid and available"""
        now = datetime.utcnow()
        if now >= self.expiration_date:
            self.status = FoodStatus.EXPIRED
            db.session.commit()
            return False
        return self.status == FoodStatus.AVAILABLE and self.available_quantity > 0

    @classmethod
    def get_urgent_listings(cls, hours_threshold=12):
        """Get listings that need urgent pickup"""
        from datetime import timedelta
        urgent_threshold = datetime.utcnow() + timedelta(hours=hours_threshold)
        return cls.query.filter(
            cls.status == FoodStatus.AVAILABLE,
            cls.expiration_date <= urgent_threshold,
            cls.available_quantity > 0
        ).order_by(cls.expiration_date.asc()).all()

    @classmethod
    def search_listings(cls, **filters):
        """Advanced search with multiple filters"""
        query = cls.query.filter(cls.status == FoodStatus.AVAILABLE)
        
        if filters.get('food_type'):
            query = query.filter(cls.food_type == filters['food_type'])
        
        if filters.get('min_quantity'):
            query = query.filter(cls.available_quantity >= filters['min_quantity'])
            
        if filters.get('max_price'):
            query = query.filter(cls.discounted_price <= filters['max_price'])
            
        if filters.get('allergens_exclude'):
            query = query.filter(~cls.allergens.overlap(filters['allergens_exclude']))
            
        if filters.get('perishable') is not None:
            query = query.filter(cls.is_perishable == filters['perishable'])
            
        if filters.get('pickup_after'):
            query = query.filter(cls.pickup_window_start >= filters['pickup_after'])
            
        return query.order_by(cls.expiration_date.asc()).all()

    def calculate_savings(self):
        """Calculate monetary and environmental savings"""
        monetary_savings = (self.original_price - self.discounted_price) if self.discounted_price else self.original_price
        # Average CO2 emissions per kg of food waste: 2.5 kg CO2
        co2_savings = self.quantity * 2.5  
        return {
            'monetary_savings': monetary_savings,
            'co2_savings': co2_savings,
            'water_savings': self.quantity * 1000  # Rough estimate of water savings in liters
        }

    def is_pickup_window_valid(self):
        """Check if current time is within pickup window"""
        now = datetime.utcnow()
        return self.pickup_window_start <= now <= self.pickup_window_end

    @validates('expiration_date', 'pickup_window_start', 'pickup_window_end')
    def validate_dates(self, key, value):
        if key == 'expiration_date' and value <= datetime.utcnow():
            raise ValueError("Expiration date must be in the future")
        if key in ['pickup_window_start', 'pickup_window_end']:
            if value <= datetime.utcnow():
                raise ValueError("Pickup window must be in the future")
        return value