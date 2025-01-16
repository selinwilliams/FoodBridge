from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from .db import db, environment, SCHEMA
from datetime import datetime, timedelta
from enum import Enum
from sqlalchemy import func, and_

class UserType(Enum):
    PROVIDER = 'PROVIDER'
    RECIPIENT = 'RECIPIENT'
    ADMIN = 'ADMIN' 

class User(db.Model, UserMixin):
    __tablename__ = 'users'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    hashed_password = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.Enum(UserType), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    provider = db.relationship('Provider', back_populates='user', uselist=False)
    reservations = db.relationship('Reservation', back_populates='recipient', foreign_keys='Reservation.recipient_id')

    @property
    def password(self):
        return self.hashed_password

    @password.setter
    def password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def is_provider(self):
        return self.user_type == UserType.PROVIDER

    def is_recipient(self):
        return self.user_type == UserType.RECIPIENT

    def is_admin(self):
        return self.user_type == UserType.ADMIN

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'user_type': self.user_type.value,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    @staticmethod
    def get_system_stats(timeframe='week'):
        """Get system-wide user statistics"""
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
        total_users = User.query.count()
        new_users = User.query.filter(User.created_at >= start_date).count()
        
        # Get users by type
        provider_count = User.query.filter(User.user_type == UserType.PROVIDER).count()
        recipient_count = User.query.filter(User.user_type == UserType.RECIPIENT).count()
        admin_count = User.query.filter(User.user_type == UserType.ADMIN).count()
        
        # Get active users (users who have logged in within timeframe)
        active_users = User.query.filter(User.updated_at >= start_date).count()
        
        return {
            'total_users': total_users,
            'new_users': new_users,
            'active_users': active_users,
            'user_types': {
                'providers': provider_count,
                'recipients': recipient_count,
                'admins': admin_count
            },
            'timeframe': timeframe,
            'start_date': start_date.isoformat(),
            'end_date': now.isoformat()
        }