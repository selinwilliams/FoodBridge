from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime, timedelta
from enum import Enum
from sqlalchemy import func, and_
from .food_listing import FoodStatus, FoodListing

class BusinessType(Enum):
    RESTAURANT = 'RESTAURANT'
    GROCERY = 'GROCERY'
    BAKERY = 'BAKERY'
    CAFE = 'CAFE'
    FARM = 'FARM'
    OTHER = 'OTHER'

class Provider(db.Model):
    __tablename__ = 'providers'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    business_name = db.Column(db.String(100), nullable=False)
    business_type = db.Column(db.Enum(BusinessType), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(2), nullable=False)
    zip_code = db.Column(db.String(10), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    website = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='provider')
    food_listings = db.relationship('FoodListing', back_populates='provider', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'business_name': self.business_name,
            'business_type': self.business_type.value,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'phone': self.phone,
            'website': self.website,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def get_active_listings(self):
        """Get all active food listings for this provider"""
        return [listing for listing in self.food_listings if listing.status == 'AVAILABLE']

    def get_total_donations(self):
        """Calculate total donations made"""
        completed_listings = [l for l in self.food_listings if l.status == 'COMPLETED']
        return sum(l.quantity for l in completed_listings)

    @staticmethod
    def get_system_stats(timeframe='week'):
        """Get system-wide provider statistics"""
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
        total_providers = Provider.query.count()
        new_providers = Provider.query.filter(
            Provider.created_at >= start_date
        ).count()
        
        # Get active providers (those with listings)
        active_providers = Provider.query.join(FoodListing).filter(
            and_(
                FoodListing.created_at >= start_date,
                FoodListing.status != FoodStatus.CANCELLED
            )
        ).distinct().count()
        
        # Get donation stats
        donation_stats = db.session.query(
            func.count(FoodListing.id).label('total_listings'),
            func.sum(FoodListing.quantity).label('total_quantity')
        ).filter(
            and_(
                FoodListing.created_at >= start_date,
                FoodListing.status == FoodStatus.COMPLETED
            )
        ).first()
        
        return {
            'total_providers': total_providers,
            'new_providers': new_providers,
            'active_providers': active_providers,
            'total_donations': donation_stats.total_listings or 0,
            'total_quantity_donated': float(donation_stats.total_quantity or 0),
            'timeframe': timeframe,
            'start_date': start_date.isoformat(),
            'end_date': now.isoformat()
        }