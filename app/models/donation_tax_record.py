from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime, date
from enum import Enum
import uuid
from sqlalchemy.orm import validates

class DonationType(Enum):
    PERISHABLE = 'perishable'
    NON_PERISHABLE = 'non_perishable'
    PREPARED_FOOD = 'prepared_food'

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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # New columns for enhanced tracking and incentives
    donation_type = db.Column(db.Enum(DonationType), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(50))
    fair_market_value = db.Column(db.Float)  # Current market value
    environmental_impact = db.Column(db.JSON)  # Store environmental savings metrics
    verification_status = db.Column(db.Boolean, default=False)  # For tax authority verification
    tax_form_generated = db.Column(db.Boolean, default=False)
    additional_benefits = db.Column(db.JSON)  # Store any additional incentives
    notes = db.Column(db.Text)
    
    # Add image_url for receipt/documentation images
    receipt_image_url = db.Column(db.String(255))
    
    # Add updated_at timestamp
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Add description field for detailed donation information
    description = db.Column(db.Text)

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
            'fair_market_value': self.fair_market_value,
            'tax_deduction_amount': self.tax_deduction_amount,
            'tax_year': self.tax_year,
            'receipt_number': self.receipt_number,
            'donation_type': self.donation_type.value,
            'quantity': self.quantity,
            'unit': self.unit,
            'environmental_impact': self.environmental_impact,
            'verification_status': self.verification_status,
            'tax_form_generated': self.tax_form_generated,
            'additional_benefits': self.additional_benefits,
            'created_at': self.created_at.isoformat()
        }

    @classmethod
    def create_record(cls, data):
        """Create a new donation tax record with enhanced benefits calculation"""
        record = cls(
            provider_id=data.get('provider_id'),
            listing_id=data.get('listing_id'),
            donation_date=data.get('donation_date'),
            food_value=data.get('food_value'),
            tax_year=data.get('tax_year') or date.today().year,
            donation_type=data.get('donation_type'),
            quantity=data.get('quantity'),
            unit=data.get('unit'),
            fair_market_value=data.get('fair_market_value'),
            notes=data.get('notes'),
            receipt_number=cls.generate_receipt_number()
        )
        
        # Calculate tax deduction and environmental impact
        record.calculate_tax_deduction()
        record.calculate_environmental_impact()
        record.calculate_additional_benefits()
        
        db.session.add(record)
        db.session.commit()
        return record

    def calculate_tax_deduction(self):
        """Calculate enhanced tax deduction based on various factors"""
        base_deduction = self.fair_market_value or self.food_value
        
        # Enhanced deduction multipliers
        multipliers = {
            DonationType.PERISHABLE: 1.5,      # 50% bonus for perishable items
            DonationType.PREPARED_FOOD: 1.3,    # 30% bonus for prepared food
            DonationType.NON_PERISHABLE: 1.2    # 20% bonus for non-perishable
        }
        
        # Apply multiplier based on donation type
        enhanced_deduction = base_deduction * multipliers.get(self.donation_type, 1.0)
        
        # Additional bonus for large quantities
        if self.quantity > 100:  # Example threshold
            enhanced_deduction *= 1.1  # 10% bonus for large donations
            
        self.tax_deduction_amount = enhanced_deduction
        return enhanced_deduction

    def calculate_environmental_impact(self):
        """Calculate environmental impact of food waste prevention"""
        self.environmental_impact = {
            'co2_savings': self.quantity * 2.5,  # kg of CO2 saved
            'water_savings': self.quantity * 1000,  # liters of water saved
            'landfill_reduction': self.quantity * 0.5,  # cubic meters of landfill space saved
            'energy_savings': self.quantity * 4.5  # kWh of energy saved
        }

    def calculate_additional_benefits(self):
        """Calculate additional incentives and benefits"""
        self.additional_benefits = {
            'sustainability_points': int(self.quantity * 10),
            'community_impact_score': int(self.food_value * 0.5),
            'tax_credit_eligibility': self.food_value > 1000,
            'certification_eligibility': self.quantity > 500
        }

    @classmethod
    def generate_receipt_number(cls):
        """Generate a unique receipt number"""
        return f"DON-{uuid.uuid4().hex[:8].upper()}"

    @classmethod
    def get_provider_summary(cls, provider_id, tax_year=None):
        """Get comprehensive donation summary for a provider"""
        query = cls.query.filter(cls.provider_id == provider_id)
        if tax_year:
            query = query.filter(cls.tax_year == tax_year)
        
        records = query.all()
        
        return {
            'total_donations': len(records),
            'total_value': sum(r.food_value for r in records),
            'total_deduction': sum(r.tax_deduction_amount for r in records),
            'environmental_impact': cls.aggregate_environmental_impact(records),
            'sustainability_score': cls.calculate_sustainability_score(records),
            'tax_benefits': cls.calculate_tax_benefits(records),
            'community_impact': cls.calculate_community_impact(records)
        }

    @staticmethod
    def aggregate_environmental_impact(records):
        """Aggregate environmental impact across multiple records"""
        total_impact = {
            'co2_savings': 0,
            'water_savings': 0,
            'landfill_reduction': 0,
            'energy_savings': 0
        }
        
        for record in records:
            if record.environmental_impact:
                for key in total_impact:
                    total_impact[key] += record.environmental_impact.get(key, 0)
                    
        return total_impact

    @staticmethod
    def calculate_sustainability_score(records):
        """Calculate overall sustainability score"""
        if not records:
            return 0
            
        total_points = sum(r.additional_benefits.get('sustainability_points', 0) 
                          for r in records if r.additional_benefits)
        return total_points / len(records)

    def generate_tax_forms(self):
        """Generate necessary tax forms for the donation"""
        if not self.tax_form_generated:
            # Implementation for generating tax forms
            self.tax_form_generated = True
            db.session.commit()
            return True
        return False

    @classmethod
    def get_tax_summary_report(cls, provider_id, tax_year):
        """Generate comprehensive tax summary report"""
        records = cls.get_provider_records(provider_id, tax_year)
        
        return {
            'year': tax_year,
            'total_deductions': sum(r.tax_deduction_amount for r in records),
            'deductions_by_type': cls.group_deductions_by_type(records),
            'monthly_summary': cls.get_monthly_summary(records),
            'verification_status': all(r.verification_status for r in records),
            'forms_generated': all(r.tax_form_generated for r in records)
        }

    @classmethod
    def get_monthly_summary(cls, records):
        """Get monthly donation summary"""
        monthly_summary = {}
        for record in records:
            month = record.donation_date.strftime('%Y-%m')
            if month not in monthly_summary:
                monthly_summary[month] = {
                    'total_value': 0,
                    'total_deduction': 0,
                    'count': 0
                }
            monthly_summary[month]['total_value'] += record.food_value
            monthly_summary[month]['total_deduction'] += record.tax_deduction_amount
            monthly_summary[month]['count'] += 1
        return monthly_summary

    @classmethod
    def calculate_tax_benefits(cls, records):
        """Calculate detailed tax benefits"""
        return {
            'total_deduction': sum(r.tax_deduction_amount for r in records),
            'average_deduction': sum(r.tax_deduction_amount for r in records) / len(records) if records else 0,
            'total_market_value': sum(r.fair_market_value for r in records if r.fair_market_value),
            'verified_donations': len([r for r in records if r.verification_status])
        }

    @classmethod
    def calculate_community_impact(cls, records):
        """Calculate community impact metrics"""
        return {
            'total_quantity': sum(r.quantity for r in records),
            'total_meals_equivalent': sum(r.quantity for r in records) * 1.2,  # Assuming 1.2 meals per quantity unit
            'donation_frequency': len(records) / 12 if records else 0,  # Monthly average
            'impact_score': sum(r.additional_benefits.get('community_impact_score', 0) for r in records if r.additional_benefits)
        }

    @validates('food_value', 'tax_deduction_amount', 'quantity')
    def validate_numeric(self, key, value):
        if value is not None and value < 0:
            raise ValueError(f"{key} cannot be negative")
        return value