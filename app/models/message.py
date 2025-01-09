from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class Message(db.Model):
    __tablename__ = 'messages'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    subject = db.Column(db.String(255))
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'recipient_id': self.recipient_id,
            'subject': self.subject,
            'content': self.content,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    @classmethod
    def get_user_messages(cls, user_id):
        """Get all messages for a user (both sent and received)"""
        return cls.query.filter(
            (cls.sender_id == user_id) | (cls.recipient_id == user_id)
        ).order_by(cls.created_at.desc()).all()

    @classmethod
    def get_unread_messages(cls, user_id):
        """Get unread messages for a user"""
        return cls.query.filter(
            cls.recipient_id == user_id,
            cls.is_read == False
        ).all()

    def mark_as_read(self):
        """Mark message as read"""
        self.is_read = True
        db.session.commit()

    @classmethod
    def create_message(cls, sender_id, recipient_id, content, subject=None):
        """Create a new message"""
        message = cls(
            sender_id=sender_id,
            recipient_id=recipient_id,
            content=content,
            subject=subject
        )
        db.session.add(message)
        db.session.commit()
        return message 