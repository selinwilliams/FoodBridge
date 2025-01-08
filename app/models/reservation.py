from .db import db, environment, SCHEMA, add_prefix_for_prod

class Reservation(db.Model):
    __tablename__ = 'reservations'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('food_listings.id')), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    pickup_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), default='pending')  # pending, confirmed, completed, cancelled
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relationships
    food_listing = db.relationship('FoodListing', back_populates='reservations')
    recipient = db.relationship('User', back_populates='reservations')

    def to_dict(self):
        return {
            'id': self.id,
            'listing_id': self.listing_id,
            'recipient_id': self.recipient_id,
            'pickup_time': self.pickup_time.isoformat(),
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'food_listing': self.food_listing.to_dict() if self.food_listing else None,
            'recipient': self.recipient.to_dict() if self.recipient else None
        }

    @classmethod
    def get_pending_reservations(cls):
        """Get all pending reservations"""
        return cls.query.filter(cls.status == 'pending').all()

    def confirm(self):
        """Confirm this reservation"""
        if self.status == 'pending':
            self.status = 'confirmed'
            return True
        return False

    def complete(self):
        """Mark reservation as completed"""
        if self.status == 'confirmed':
            self.status = 'completed'
            self.food_listing.status = 'completed'
            return True
        return False

    def cancel(self):
        """Cancel this reservation"""
        if self.status in ['pending', 'confirmed']:
            self.status = 'cancelled'
            self.food_listing.status = 'available'
            return True
        return False

    @classmethod
    def create_reservation(cls, data):
        """Create a new reservation"""
        reservation = cls(
            listing_id=data.get('listing_id'),
            recipient_id=data.get('recipient_id'),
            pickup_time=data.get('pickup_time'),
            notes=data.get('notes')
        )
        db.session.add(reservation)
        db.session.commit()
        return reservation

    @classmethod
    def get_user_reservations(cls, user_id, status=None):
        """Get all reservations for a user"""
        query = cls.query.filter(cls.recipient_id == user_id)
        if status:
            query = query.filter(cls.status == status)
        return query.order_by(cls.pickup_time.desc()).all()

    def update_pickup_time(self, new_time):
        """Update pickup time if reservation is still pending"""
        if self.status == 'pending':
            self.pickup_time = new_time
            db.session.commit()
            return True
        return False

    def send_notification(self, notification_type):
        """Send notification based on reservation status change"""
        # Implement your notification logic
        pass 

    def send_status_notification(self):
        """Send notification based on reservation status"""
        notification_data = {
            'recipient_id': self.recipient_id,
            'listing_id': self.listing_id,
            'status': self.status,
            'pickup_time': self.pickup_time,
            'provider_name': self.food_listing.provider.business_name
        }
        
        # Check recipient's notification preferences
        recipient = self.recipient
        if recipient.notification_preferences.get('email_notifications'):
            self._send_email_notification(notification_data)
        if recipient.notification_preferences.get('sms_notifications'):
            self._send_sms_notification(notification_data)
        
        return True

    def _send_email_notification(self, data):
        """Send email notification"""
        # Implement email notification logic
        pass

    def _send_sms_notification(self, data):
        """Send SMS notification"""
        # Implement SMS notification logic
        pass 