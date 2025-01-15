from flask import Blueprint, request, current_app
from flask_login import login_required, current_user
from app.models import Provider, FoodListing, db
from app.models.user import UserType
from app.models.provider import BusinessType
from app.models.food_listing import FoodStatus
from functools import wraps
from sqlalchemy.sql import and_

provider_routes = Blueprint('providers', __name__)

def provider_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return {'errors': {'message': 'Authentication required'}}, 401
        if not current_user.is_provider():
            return {'errors': {'message': 'Must be a provider'}}, 403
        return f(*args, **kwargs)
    return decorated_function

@provider_routes.route('/me')
@login_required
def get_current_provider():
    """Get current provider's details"""
    if not current_user.is_provider():
        return {'errors': ['Not a provider']}, 403
        
    return {
        'user': {
            'id': current_user.id,
            'email': current_user.email,
            'user_type': current_user.user_type.value
        },
        'provider': {
            'id': current_user.provider.id,
            'business_name': current_user.provider.business_name,
            'business_type': current_user.provider.business_type.value
        }
    }

@provider_routes.route('/me/listings')
@login_required
def get_current_provider_listings():
    """Get current provider's food listings"""
    if not current_user.is_provider():
        return {'errors': ['Unauthorized - Must be a provider']}, 403
        
    try:
        provider = current_user.provider
        if not provider:
            return {'errors': ['Provider profile not found']}, 404
            
        active_listings = FoodListing.query.filter(
            and_(
                FoodListing.provider_id == provider.id,
                FoodListing.status == FoodStatus.AVAILABLE
            )
        ).all()
        
        return {
            'provider_id': provider.id,
            'business_name': provider.business_name,
            'listings': [listing.to_dict() for listing in active_listings]
        }
        
    except Exception as e:
        return {'errors': [str(e)]}, 500

@provider_routes.route('', methods=['POST'])
@provider_required
def create_provider():
    """Create a new provider profile"""
    if current_user.provider:
        return {'errors': ['Provider profile already exists']}, 400
        
    try:
        data = request.json
        provider = Provider(
            user_id=current_user.id,
            business_name=data.get('business_name'),
            business_type=BusinessType[data.get('business_type', '').upper()],
            address=data.get('address'),
            city='Default City',  # Default values for required fields
            state='CA',
            zip_code='00000',
            phone='000-000-0000'
        )
        
        db.session.add(provider)
        db.session.commit()
        return provider.to_dict(), 201
        
    except Exception as e:
        db.session.rollback()
        return {'errors': [str(e)]}, 400

@provider_routes.route('', methods=['GET'])
def get_all_providers():
    """Get all providers with optional filters"""
    try:
        # Add basic filtering
        business_type = request.args.get('business_type')
        
        query = Provider.query
        if business_type:
            query = query.filter(Provider.business_type == BusinessType[business_type.upper()])
            
        providers = query.all()
        return {'providers': [provider.to_dict() for provider in providers]}
    except Exception as e:
        return {'errors': [str(e)]}, 500

@provider_routes.route('/<int:id>', methods=['GET'])
def get_provider(id):
    """Get a single provider by ID"""
    try:
        provider = Provider.query.get(id)
        if not provider:
            return {'errors': ['Provider not found']}, 404
            
        return provider.to_dict()
    except Exception as e:
        return {'errors': [str(e)]}, 500

@provider_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_provider(id):
    """Update provider profile"""
    provider = Provider.query.get_or_404(id)
    
    # Check if current user owns this provider profile
    if provider.user_id != current_user.id:
        return {'errors': ['Unauthorized - Not the owner']}, 403
        
    try:
        data = request.json
        
        # Update allowed fields
        if 'business_name' in data:
            provider.business_name = data['business_name']
        if 'business_type' in data:
            provider.business_type = BusinessType[data['business_type'].upper()]
        if 'address' in data:
            provider.address = data['address']
        if 'city' in data:
            provider.city = data['city']
        if 'state' in data:
            provider.state = data['state']
        if 'zip_code' in data:
            provider.zip_code = data['zip_code']
        if 'phone' in data:
            provider.phone = data['phone']
        if 'website' in data:
            provider.website = data['website']
            
        db.session.commit()
        return provider.to_dict()
        
    except Exception as e:
        db.session.rollback()
        return {'errors': [str(e)]}, 400

@provider_routes.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_provider(id):
    """Delete provider profile"""
    provider = Provider.query.get_or_404(id)
    
    # Check if current user owns this provider profile
    if provider.user_id != current_user.id:
        return {'errors': ['Unauthorized - Not the owner']}, 403
        
    try:
        db.session.delete(provider)
        db.session.commit()
        return {'message': 'Successfully deleted provider profile'}
        
    except Exception as e:
        db.session.rollback()
        return {'errors': [str(e)]}, 400
