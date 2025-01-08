from .db import db, environment, SCHEMA, add_prefix_for_prod

class AllergenAlert(db.Model):
    __tablename__ = 'allergen_alerts'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    allergen_name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relationships
    user = db.relationship('User', back_populates='allergen_alerts')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'allergen_name': self.allergen_name,
            'created_at': self.created_at.isoformat()
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