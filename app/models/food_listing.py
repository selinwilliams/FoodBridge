from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime, timedelta
from enum import Enum
from sqlalchemy import func, and_

class FoodType(Enum):
    PRODUCE = 'PRODUCE'
    DAIRY = 'DAIRY'
    BAKERY = 'BAKERY'
    MEAT = 'MEAT'
    PANTRY = 'PANTRY'
    PREPARED = 'PREPARED'
    OTHER = 'OTHER'

class FoodStatus(Enum):
    PENDING = 'PENDING'
    AVAILABLE = 'AVAILABLE'
    RESERVED = 'RESERVED'
    COMPLETED = 'COMPLETED'
    EXPIRED = 'EXPIRED'
    CANCELLED = 'CANCELLED'

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
    original_price = db.Column(db.Float)
    discounted_price = db.Column(db.Float)
    expiration_date = db.Column(db.DateTime, nullable=False)
    best_by_date = db.Column(db.DateTime)
    pickup_window_start = db.Column(db.DateTime, nullable=False)
    pickup_window_end = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Enum(FoodStatus), default=FoodStatus.PENDING)
    allergens = db.Column(db.JSON, default=list)
    storage_instructions = db.Column(db.Text)
    handling_instructions = db.Column(db.Text)
    is_perishable = db.Column(db.Boolean, default=True)
    temperature_requirements = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    image_url = db.Column(db.String(255))

    # Relationships
    provider = db.relationship('Provider', back_populates='food_listings')
    distribution_center = db.relationship('DistributionCenter', back_populates='food_listings')
    reservations = db.relationship('Reservation', back_populates='food_listing', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'provider_id': self.provider_id,
            'title': self.title,
            'description': self.description,
            'food_type': self.food_type.value if self.food_type else None,
            'quantity': self.quantity,
            'unit': self.unit,
            'original_price': self.original_price,
            'discounted_price': self.discounted_price,
            'expiration_date': self.expiration_date.isoformat() if self.expiration_date else None,
            'best_by_date': self.best_by_date.isoformat() if self.best_by_date else None,
            'pickup_window_start': self.pickup_window_start.isoformat() if self.pickup_window_start else None,
            'pickup_window_end': self.pickup_window_end.isoformat() if self.pickup_window_end else None,
            'status': self.status.value if self.status else None,
            'allergens': self.allergens,
            'storage_instructions': self.storage_instructions,
            'handling_instructions': self.handling_instructions,
            'is_perishable': self.is_perishable,
            'temperature_requirements': self.temperature_requirements,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'image_url': self.image_url
        }

    @staticmethod
    def get_system_stats(timeframe='week'):
        """Get system-wide food listing statistics"""
        now = datetime.utcnow()
        
        # Calculate timeframe
        if timeframe == 'week':
            start_date = now - timedelta(days=7)
        elif timeframe == 'month':
            start_date = now - timedelta(days=30)
        elif timeframe == 'year':
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=7)  # default to week
            
        # Get basic stats
        total_listings = FoodListing.query.count()
        new_listings = FoodListing.query.filter(
            FoodListing.created_at >= start_date
        ).count()
        
        # Get listings by status
        status_counts = {}
        for status in FoodStatus:
            count = FoodListing.query.filter(
                FoodListing.status == status
            ).count()
            status_counts[status.value] = count
            
        # Get quantity and value stats
        value_stats = db.session.query(
            func.sum(FoodListing.quantity).label('total_quantity'),
            func.avg(FoodListing.original_price).label('avg_original_price'),
            func.avg(FoodListing.discounted_price).label('avg_discounted_price')
        ).filter(
            FoodListing.created_at >= start_date
        ).first()
        
        # Calculate average discount percentage
        avg_original = value_stats.avg_original_price or 0
        avg_discounted = value_stats.avg_discounted_price or 0
        avg_discount = ((avg_original - avg_discounted) / avg_original * 100) if avg_original > 0 else 0
        
        return {
            'total_listings': total_listings,
            'new_listings': new_listings,
            'status_breakdown': status_counts,
            'total_quantity': float(value_stats.total_quantity or 0),
            'average_original_price': float(avg_original),
            'average_discounted_price': float(avg_discounted),
            'average_discount_percentage': float(avg_discount),
            'timeframe': timeframe,
            'start_date': start_date.isoformat(),
            'end_date': now.isoformat()
        }