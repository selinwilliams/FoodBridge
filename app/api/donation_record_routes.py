from flask import Blueprint, request
from flask_login import login_required, current_user
from app.models import DonationTaxRecord, db
from datetime import datetime

donation_routes = Blueprint('donations', __name__)

@donation_routes.route('', methods=['POST'])
@login_required
def create_record():
    """Create a new donation tax record"""
    if not current_user.is_provider():
        return {'errors': ['Unauthorized']}, 403
        
    data = request.json
    data['provider_id'] = current_user.provider.id
    record = DonationTaxRecord.create_record(data)
    return record.to_dict(), 201

@donation_routes.route('/provider')
@login_required
def get_provider_records():
    """Get provider's donation records"""
    if not current_user.is_provider():
        return {'errors': ['Unauthorized']}, 403
        
    tax_year = request.args.get('tax_year', type=int)
    records = DonationTaxRecord.get_provider_records(current_user.provider.id, tax_year)
    return {'records': [r.to_dict() for r in records]}

@donation_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_record(id):
    """Update a donation record"""
    record = DonationTaxRecord.query.get_or_404(id)
    if record.provider_id != current_user.provider.id:
        return {'errors': ['Unauthorized']}, 403
        
    data = request.json
    record.update_record(data)
    return record.to_dict()

@donation_routes.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_record(id):
    """Delete a donation record"""
    record = DonationTaxRecord.query.get_or_404(id)
    if record.provider_id != current_user.provider.id:
        return {'errors': ['Unauthorized']}, 403
        
    record.delete_record()
    return {'message': 'Record deleted successfully'}

@donation_routes.route('/summary')
@login_required
def get_donation_summary():
    """Get donation summary for tax year"""
    if not current_user.is_provider():
        return {'errors': ['Unauthorized']}, 403
        
    tax_year = request.args.get('tax_year', datetime.now().year, type=int)
    summary = DonationTaxRecord.get_yearly_summary(current_user.provider.id, tax_year)
    return summary

@donation_routes.route('/tax-forms/<int:id>')
@login_required
def generate_tax_forms(id):
    """Generate tax forms for a donation record"""
    record = DonationTaxRecord.query.get_or_404(id)
    if record.provider_id != current_user.provider.id:
        return {'errors': ['Unauthorized']}, 403
        
    if record.generate_tax_forms():
        return {'message': 'Tax forms generated successfully'}
    return {'errors': ['Unable to generate tax forms']}, 400 