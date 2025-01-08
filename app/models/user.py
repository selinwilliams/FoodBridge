from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin


class User(db.Model, UserMixin):
    __tablename__ = 'users'
    __table_args__ = {'schema': 'food_bridge_schema'}
    
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    hashed_password = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.String(50), nullable=False)  # provider, recipient, admin
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relationships
    provider = db.relationship('Provider', back_populates='user', uselist=False)
    reservations = db.relationship('Reservation', back_populates='recipient')
    allergen_alerts = db.relationship('AllergenAlert', back_populates='user')

    @property
    def password(self):
        return self.hashed_password

    @password.setter
    def password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'user_type': self.user_type,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone
        }

    @classmethod
    def get_by_email(cls, email):
        """Find a user by their email"""
        return cls.query.filter(cls.email == email).first()

    @classmethod
    def get_all_providers(cls):
        """Get all users who are providers"""
        return cls.query.filter(cls.user_type == 'provider').all()

    @classmethod
    def get_all_recipients(cls):
        """Get all users who are recipients"""
        return cls.query.filter(cls.user_type == 'recipient').all()

    def get_active_reservations(self):
        """Get all active reservations for this user"""
        return [r for r in self.reservations if r.status in ['pending', 'confirmed']]

    def get_allergen_list(self):
        """Get list of user's allergens"""
        return [alert.allergen_name for alert in self.allergen_alerts]

    def get_provider_profile(self):
        """Get associated provider profile if exists"""
        return self.provider if self.user_type == 'provider' else None

    def get_dashboard_data(self):
        """Get relevant dashboard data based on user type"""
        if self.user_type == 'provider':
            return {
                'active_listings': len(self.provider.get_active_listings()),
                'total_donations': self.provider.get_total_donations(),
                'pending_reservations': len([r for l in self.provider.food_listings 
                                          for r in l.reservations if r.status == 'pending'])
            }
        elif self.user_type == 'recipient':
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

    def update_notification_preferences(self, preferences):
        """Update user's notification preferences"""
        self.notification_preferences = {
            'email_notifications': preferences.get('email_notifications', True),
            'sms_notifications': preferences.get('sms_notifications', False),
            'notification_types': preferences.get('notification_types', [
                'new_listings',
                'reservation_updates',
                'expiration_reminders'
            ])
        }
        db.session.commit()
