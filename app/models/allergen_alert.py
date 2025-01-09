from .db import db, environment, SCHEMA, add_prefix_for_prod
from enum import Enum
from sqlalchemy.orm import validates

class AllergenSeverity(Enum):
    MILD = 'mild'
    MODERATE = 'moderate'
    SEVERE = 'severe'
    LIFE_THREATENING = 'life_threatening'

class AllergenAlert(db.Model):
    __tablename__ = 'allergen_alerts'

    if environment == "production":
        __table_args__ = (
            db.UniqueConstraint('user_id', 'allergen_name', name='uq_user_allergen'),
            db.Index('idx_user_allergens', 'user_id'),
            {'schema': SCHEMA}
        )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id'), name='fk_allergen_user'), nullable=False)
    allergen_name = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.Enum(AllergenSeverity), default=AllergenSeverity.MODERATE)
    notes = db.Column(db.Text)  # Additional notes about the allergy
    medical_documentation = db.Column(db.Boolean, default=False)  # If medical documentation is provided
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    is_active = db.Column(db.Boolean, default=True)  # To temporarily disable alerts

    # Relationships
    user = db.relationship('User', back_populates='allergen_alerts')

    @validates('allergen_name')
    def validate_allergen_name(self, key, name):
        """Validate allergen name against common allergens"""
        common_allergens = self.get_common_allergens()
        normalized_name = name.lower().replace(' ', '_')
        if normalized_name not in common_allergens:
            raise ValueError(f"Invalid allergen name. Must be one of: {', '.join(common_allergens)}")
        return normalized_name

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'allergen_name': self.allergen_name,
            'severity': self.severity.value if self.severity else None,
            'notes': self.notes,
            'medical_documentation': self.medical_documentation,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_active': self.is_active
        }

    @classmethod
    def get_user_allergen_summary(cls, user_id):
        """Get detailed summary of user's allergen alerts"""
        alerts = cls.get_user_allergens(user_id)
        return {
            'user_id': user_id,
            'total_alerts': len(alerts),
            'allergens': [{
                'name': alert.allergen_name,
                'severity': alert.severity.value if alert.severity else None,
                'is_active': alert.is_active
            } for alert in alerts],
            'has_severe_allergies': any(
                alert.severity in [AllergenSeverity.SEVERE, AllergenSeverity.LIFE_THREATENING]
                for alert in alerts
            ),
            'created_at': min(alert.created_at for alert in alerts) if alerts else None
        }

    def toggle_active_status(self):
        """Toggle the active status of the alert"""
        self.is_active = not self.is_active
        db.session.commit()
        return self.is_active

    @classmethod
    def get_severe_alerts(cls, user_id):
        """Get all severe or life-threatening allergen alerts"""
        return cls.query.filter(
            cls.user_id == user_id,
            cls.severity.in_([AllergenSeverity.SEVERE, AllergenSeverity.LIFE_THREATENING]),
            cls.is_active == True
        ).all()

    @classmethod
    def check_food_safety(cls, user_id, food_allergens):
        """Check food safety based on user's allergen alerts"""
        user_alerts = cls.get_user_allergens(user_id)
        if not user_alerts or not food_allergens:
            return {'is_safe': True, 'alerts': []}

        dangerous_allergens = []
        for alert in user_alerts:
            if alert.is_active and alert.allergen_name in food_allergens:
                dangerous_allergens.append({
                    'allergen': alert.allergen_name,
                    'severity': alert.severity.value if alert.severity else None
                })

        return {
            'is_safe': len(dangerous_allergens) == 0,
            'alerts': dangerous_allergens
        }

    @classmethod
    def get_user_allergens(cls, user_id):
        """Get all allergen alerts for a user"""
        return cls.query.filter(cls.user_id == user_id).all()

    @classmethod
    def check_food_allergens(cls, user_id, food_allergens):
        """Check if any food allergens match user's alerts"""
        user_allergens = set(alert.allergen_name for alert in cls.get_user_allergens(user_id))
        food_allergens = set(food_allergens or [])
        return user_allergens.intersection(food_allergens) 

    @classmethod
    def create_alert(cls, data):
        """Create a new allergen alert"""
        alert = cls(
            user_id=data.get('user_id'),
            allergen_name=data.get('allergen_name')
        )
        db.session.add(alert)
        db.session.commit()
        return alert

    def update_alert(self, data):
        """Update alert details"""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        db.session.commit()
        return self

    def delete_alert(self):
        """Delete allergen alert"""
        db.session.delete(self)
        db.session.commit()
        return True

    @classmethod
    def bulk_create_alerts(cls, user_id, allergens):
        """Create multiple allergen alerts for a user"""
        alerts = []
        for allergen in allergens:
            alert = cls(user_id=user_id, allergen_name=allergen)
            alerts.append(alert)
        db.session.add_all(alerts)
        db.session.commit()
        return alerts

    @classmethod
    def get_common_allergens(cls):
        """Get list of commonly tracked allergens"""
        return [
            'peanuts', 'tree_nuts', 'milk', 'eggs', 'soy',
            'wheat', 'fish', 'shellfish', 'sesame'
        ]

    def is_allergen_in_food(self, food_allergens):
        """Check if this allergen is present in food"""
        if not food_allergens:
            return False
        return self.allergen_name in food_allergens

    @classmethod
    def get_alerts_by_allergen(cls, allergen_name):
        """Get all alerts for a specific allergen"""
        return cls.query.filter(cls.allergen_name == allergen_name).all()

    @classmethod
    def get_user_alert_summary(cls, user_id):
        """Get summary of user's allergen alerts"""
        alerts = cls.get_user_allergens(user_id)
        return {
            'user_id': user_id,
            'total_alerts': len(alerts),
            'allergens': [alert.allergen_name for alert in alerts],
            'created_at': min(alert.created_at for alert in alerts) if alerts else None
        } 