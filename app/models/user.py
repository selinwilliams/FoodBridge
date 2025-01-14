from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from datetime import datetime
from enum import Enum

class UserType(Enum):
    ADMIN = 'admin'
    PROVIDER = 'provider'
    RECIPIENT = 'recipient'

class User(db.Model, UserMixin):
    __tablename__ = 'users'

    __table_args__ = (
        db.Index('idx_email_username', 'email', 'username'),
        {'schema': SCHEMA if environment == "production" else None}
    )

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    hashed_password = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.Enum(UserType), nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    profile_image_url = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    is_approved = db.Column(db.Boolean, default=False)
    email_verified = db.Column(db.Boolean, default=False)
    address = db.Column(db.String(255))
    notification_preferences = db.Column(db.JSON, default={
        'email': True,
        'sms': False,
    })

    # Relationships
    provider = db.relationship('Provider', back_populates='user', uselist=False)
    reservations = db.relationship('Reservation', back_populates='recipient')
    allergen_alerts = db.relationship('AllergenAlert', back_populates='user')
    sent_messages = db.relationship('Message', 
                                  foreign_keys='Message.sender_id',
                                  backref='sender')
    received_messages = db.relationship('Message', 
                                      foreign_keys='Message.recipient_id',
                                      backref='recipient')

    @property
    def password(self):
        return self.hashed_password

    @password.setter
    def password(self, password):
        """Set password with validation and hashing"""
        if not password:
            raise ValueError("Password is required")
        
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
            
        # Store hashed password
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'user_type': self.user_type.value,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'is_approved': self.is_approved,
            'email_verified': self.email_verified,
            'address': self.address,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

    # Original Class Methods
    @classmethod
    def get_by_email(cls, email):
        """Find a user by their email"""
        return cls.query.filter(cls.email == email).first()

    @classmethod
    def get_all_providers(cls):
        """Get all users who are providers"""
        return cls.query.filter(cls.user_type == UserType.PROVIDER).all()

    @classmethod
    def get_all_recipients(cls):
        """Get all users who are recipients"""
        return cls.query.filter(cls.user_type == UserType.RECIPIENT).all()

    # User Status Methods
    def get_active_reservations(self):
        """Get all active reservations for this user"""
        return [r for r in self.reservations if r.status in ['pending', 'confirmed']]

    def get_allergen_list(self):
        """Get list of user's allergens"""
        return [alert.allergen_name for alert in self.allergen_alerts]

    def get_provider_profile(self):
        """Get associated provider profile if exists"""
        return self.provider if self.user_type == UserType.PROVIDER else None

    def get_dashboard_data(self):
        """Get relevant dashboard data based on user type"""
        if self.user_type == UserType.PROVIDER:
            return {
                'active_listings': len(self.provider.get_active_listings()),
                'total_donations': self.provider.get_total_donations(),
                'pending_reservations': len([r for l in self.provider.food_listings 
                                          for r in l.reservations if r.status == 'pending'])
            }
        elif self.user_type == UserType.RECIPIENT:
            return {
                'active_reservations': len(self.get_active_reservations()),
                'allergen_alerts': len(self.allergen_alerts)
            }

    def get_food_preferences(self):
        """Get recipient's food preferences and restrictions"""
        completed_reservations = [r for r in self.reservations if r.status == 'completed']
        return {
            'allergens': self.get_allergen_list(),
            'preferred_providers': [r.food_listing.provider_id for r in completed_reservations],
            'preferred_centers': [r.food_listing.distribution_center_id 
                                for r in completed_reservations if r.food_listing.distribution_center_id],
            'favorite_food_types': self.get_favorite_food_types()
        }
    
    def get_favorite_food_types(self):
        """Analyze favorite food types based on reservation history"""
        from collections import Counter
        food_types = [r.food_listing.title.lower() 
                     for r in self.reservations if r.status == 'completed']
        return Counter(food_types).most_common(5)

    # Authorization Methods
    def is_admin(self):
        """Check if user is admin"""
        return self.user_type == UserType.ADMIN

    def is_provider(self):
        """Check if user is a provider"""
        try:
            return (self.user_type == UserType.PROVIDER and 
                    hasattr(self, 'provider') and 
                    self.provider is not None)
        except Exception as e:
            print(f"Error in is_provider check: {str(e)}")
            return False

    def is_recipient(self):
        """Check if user is recipient"""
        return self.user_type == UserType.RECIPIENT

    def can_access_admin_dashboard(self):
        """Check if user can access admin dashboard"""
        return self.is_admin() and self.is_active

    def can_access_provider_dashboard(self):
        """Check if user can access provider dashboard"""
        return self.is_provider() and self.is_active and self.is_approved

    def can_make_reservation(self):
        """Check if user can make reservations"""
        return self.is_recipient() and self.is_active and self.is_approved

    # Message Methods
    def get_unread_messages_count(self):
        """Get count of unread messages"""
        return len([msg for msg in self.received_messages if not msg.is_read])

    # Account Management Methods
    def mark_email_verified(self):
        """Mark user's email as verified"""
        self.email_verified = True
        db.session.commit()

    def update_notification_preferences(self, preferences):
        """Update user's notification preferences"""
        self.notification_preferences.update(preferences)
        db.session.commit()