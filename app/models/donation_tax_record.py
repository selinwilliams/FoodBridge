from .db import db, environment, SCHEMA, add_prefix_for_prod

class DonationTaxRecord(db.Model):
    __tablename__ = 'donation_tax_records'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('providers.id')), nullable=False)
    listing_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('food_listings.id')), nullable=False)
    donation_date = db.Column(db.Date, nullable=False)
    food_value = db.Column(db.Float, nullable=False)
    tax_deduction_amount = db.Column(db.Float)
    tax_year = db.Column(db.Integer, nullable=False)
    receipt_number = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relationships
    provider = db.relationship('Provider', back_populates='donation_records')
    food_listing = db.relationship('FoodListing', back_populates='donation_records')

    def to_dict(self):
        return {
            'id': self.id,
            'provider_id': self.provider_id,
            'listing_id': self.listing_id,
            'donation_date': self.donation_date.isoformat(),
            'food_value': self.food_value,
            'tax_deduction_amount': self.tax_deduction_amount,
            'tax_year': self.tax_year,
            'receipt_number': self.receipt_number,
            'created_at': self.created_at.isoformat()
        }

    @classmethod
    def get_records_by_year(cls, tax_year):
        """Get all donation records for a specific tax year"""
        return cls.query.filter(cls.tax_year == tax_year).all()

    @classmethod
    def get_provider_records(cls, provider_id, tax_year=None):
        """Get all records for a provider, optionally filtered by year"""
        query = cls.query.filter(cls.provider_id == provider_id)
        if tax_year:
            query = query.filter(cls.tax_year == tax_year)
        return query.all()

    def calculate_tax_deduction(self):
        """Calculate tax deduction based on food value"""
        # Implement your tax deduction logic here
        return self.food_value * 0.5  # Example calculation 

    @classmethod
    def create_record(cls, data):
        """Create a new donation tax record"""
        record = cls(
            provider_id=data.get('provider_id'),
            listing_id=data.get('listing_id'),
            donation_date=data.get('donation_date'),
            food_value=data.get('food_value'),
            tax_year=data.get('tax_year'),
            receipt_number=data.get('receipt_number')
        )
        record.tax_deduction_amount = record.calculate_tax_deduction()
        db.session.add(record)
        db.session.commit()
        return record

    def update_record(self, data):
        """Update record details"""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        if 'food_value' in data:
            self.tax_deduction_amount = self.calculate_tax_deduction()
        db.session.commit()
        return self

    def delete_record(self):
        """Delete tax record"""
        db.session.delete(self)
        db.session.commit()
        return True

    @classmethod
    def get_yearly_summary(cls, provider_id, year):
        """Get yearly donation summary for a provider"""
        records = cls.get_provider_records(provider_id, year)
        total_value = sum(r.food_value for r in records)
        total_deduction = sum(r.tax_deduction_amount for r in records if r.tax_deduction_amount)
        
        return {
            'year': year,
            'total_donations': len(records),
            'total_value': total_value,
            'total_deduction': total_deduction,
            'records': [r.to_dict() for r in records]
        }

    def generate_receipt_number(self):
        """Generate a unique receipt number"""
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        return f"DON-{self.provider_id}-{timestamp}" 