from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime
from enum import Enum
from sqlalchemy.orm import validates

class ReservationStatus(Enum):
    PENDING = 'pending'
    CONFIRMED = 'confirmed'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    EXPIRED = 'expired'  # For time-sensitive items that weren't picked up

class Reservation(db.Model):
    __tablename__ = 'reservations'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('food_listings.id')), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    pickup_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Enum(ReservationStatus), default=ReservationStatus.PENDING)
    notes = db.Column(db.Text)  # Special handling instructions or dietary restrictions
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Important fields for food waste reduction
    quantity_reserved = db.Column(db.Integer, nullable=False)  # Amount of food reserved
    expiration_time = db.Column(db.DateTime, nullable=False)  # When food needs to be picked up by
    pickup_window_start = db.Column(db.DateTime, nullable=False)  # Earliest pickup time
    pickup_window_end = db.Column(db.DateTime, nullable=False)  # Latest pickup time
    actual_pickup_time = db.Column(db.DateTime)  # Track when food was picked up

    # Relationships
    food_listing = db.relationship('FoodListing', back_populates='reservations')
    recipient = db.relationship('User', back_populates='reservations')

    def to_dict(self):
        return {
            'id': self.id,
            'listing_id': self.listing_id,
            'recipient_id': self.recipient_id,
            'pickup_time': self.pickup_time.isoformat(),
            'status': self.status.value,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'quantity_reserved': self.quantity_reserved,
            'expiration_time': self.expiration_time.isoformat(),
            'pickup_window_start': self.pickup_window_start.isoformat(),
            'pickup_window_end': self.pickup_window_end.isoformat(),
            'actual_pickup_time': self.actual_pickup_time.isoformat() if self.actual_pickup_time else None,
            'food_listing': self.food_listing.to_dict() if self.food_listing else None,
            'recipient': self.recipient.to_dict() if self.recipient else None
        }

    @classmethod
    def get_pending_reservations(cls):
        """Get all pending reservations"""
        return cls.query.filter(cls.status == ReservationStatus.PENDING).all()

    @classmethod
    def create_reservation(cls, data):
        """Create a new reservation with availability check"""
        listing = FoodListing.query.get(data.get('listing_id'))
        
        # Check if listing exists and has enough quantity
        if not listing or listing.available_quantity < data.get('quantity_reserved', 0):
            return None
            
        # Check if pickup time is within allowed window
        pickup_time = data.get('pickup_time')
        if not (listing.pickup_window_start <= pickup_time <= listing.pickup_window_end):
            return None

        reservation = cls(
            listing_id=data.get('listing_id'),
            recipient_id=data.get('recipient_id'),
            pickup_time=pickup_time,
            quantity_reserved=data.get('quantity_reserved'),
            notes=data.get('notes'),
            expiration_time=listing.expiration_time,
            pickup_window_start=listing.pickup_window_start,
            pickup_window_end=listing.pickup_window_end
        )
        
        # Update available quantity
        listing.available_quantity -= reservation.quantity_reserved
        
        db.session.add(reservation)
        db.session.commit()
        return reservation

    def confirm(self):
        """Confirm this reservation"""
        if self.status == ReservationStatus.PENDING:
            if datetime.utcnow() <= self.expiration_time:
                self.status = ReservationStatus.CONFIRMED
                db.session.commit()
                self.send_status_notification()
                return True
        return False

    def complete(self):
        """Complete reservation and record pickup time"""
        if self.status == ReservationStatus.CONFIRMED:
            self.status = ReservationStatus.COMPLETED
            self.actual_pickup_time = datetime.utcnow()
            db.session.commit()
            self.send_status_notification()
            return True
        return False

    def cancel(self):
        """Cancel reservation and return quantity to listing"""
        if self.status in [ReservationStatus.PENDING, ReservationStatus.CONFIRMED]:
            self.status = ReservationStatus.CANCELLED
            # Return the reserved quantity back to the listing
            self.food_listing.available_quantity += self.quantity_reserved
            db.session.commit()
            self.send_status_notification()
            return True
        return False

    def check_expiration(self):
        """Check and update reservation if expired"""
        if self.status in [ReservationStatus.PENDING, ReservationStatus.CONFIRMED]:
            if datetime.utcnow() > self.expiration_time:
                self.status = ReservationStatus.EXPIRED
                self.food_listing.available_quantity += self.quantity_reserved
                db.session.commit()
                self.send_status_notification()
                return True
        return False

    def is_pickup_time_valid(self):
        """Check if current time is within pickup window"""
        now = datetime.utcnow()
        return self.pickup_window_start <= now <= self.pickup_window_end

    def send_status_notification(self):
        """Send notification based on reservation status"""
        notification_data = {
            'recipient_id': self.recipient_id,
            'listing_id': self.listing_id,
            'status': self.status.value,
            'pickup_time': self.pickup_time,
            'quantity': self.quantity_reserved,
            'provider_name': self.food_listing.provider.business_name,
            'food_name': self.food_listing.title,
            'expiration_time': self.expiration_time,
            'pickup_window': f"{self.pickup_window_start.strftime('%H:%M')} - {self.pickup_window_end.strftime('%H:%M')}"
        }
        
        recipient = self.recipient
        if recipient.notification_preferences.get('email'):
            self._send_email_notification(notification_data)
        if recipient.notification_preferences.get('sms'):
            self._send_sms_notification(notification_data)
        
        return True

    @classmethod
    def get_user_reservations(cls, user_id, status=None):
        """Get all reservations for a user"""
        query = cls.query.filter(cls.recipient_id == user_id)
        if status:
            query = query.filter(cls.status == status)
        return query.order_by(cls.pickup_time.desc()).all()

    def update_pickup_time(self, new_time):
        """Update pickup time if within allowed window"""
        if (self.status == ReservationStatus.PENDING and 
            self.pickup_window_start <= new_time <= self.pickup_window_end):
            self.pickup_time = new_time
            db.session.commit()
            return True
        return False

    @validates('pickup_time')
    def validate_pickup_time(self, key, value):
        if value <= datetime.utcnow():
            raise ValueError("Pickup time must be in the future")
        return value

    def transition_status(self, new_status):
        """Handle status transitions"""
        valid_transitions = {
            ReservationStatus.PENDING: [ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED],
            ReservationStatus.CONFIRMED: [ReservationStatus.COMPLETED, ReservationStatus.CANCELLED],
        }
        if new_status in valid_transitions.get(self.status, []):
            self.status = new_status
            db.session.commit()
            return True
        return False