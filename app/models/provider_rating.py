from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime
from sqlalchemy.orm import validates

class ProviderRating(db.Model):
    __tablename__ = 'provider_ratings'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('providers.id')), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    provider = db.relationship('Provider', back_populates='ratings')
    user = db.relationship('User', backref='provider_ratings')

    @validates('rating')
    def validate_rating(self, key, rating):
        """Validate rating is between 1 and 5"""
        if not 1 <= rating <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return rating

    def to_dict(self):
        return {
            'id': self.id,
            'provider_id': self.provider_id,
            'user_id': self.user_id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    @classmethod
    def get_provider_ratings(cls, provider_id):
        """Get all ratings for a provider"""
        return cls.query.filter_by(provider_id=provider_id).all()

    @classmethod
    def get_average_rating(cls, provider_id):
        """Get average rating for a provider"""
        ratings = cls.query.filter_by(provider_id=provider_id).with_entities(cls.rating).all()
        if not ratings:
            return None
        return sum(r[0] for r in ratings) / len(ratings)

    @classmethod
    def create_rating(cls, provider_id, user_id, rating, comment=None):
        """Create a new rating"""
        rating = cls(
            provider_id=provider_id,
            user_id=user_id,
            rating=rating,
            comment=comment
        )
        db.session.add(rating)
        db.session.commit()
        return rating

    def update_rating(self, rating=None, comment=None):
        """Update rating details"""
        if rating is not None:
            self.rating = rating
        if comment is not None:
            self.comment = comment
        db.session.commit()
        return self 