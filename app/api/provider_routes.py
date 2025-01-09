from flask import Blueprint, request
from flask_login import login_required, current_user
from app.models import Provider, db
from datetime import datetime

provider_routes = Blueprint('providers', __name__)


#Create
@provider_routes.route('/', methods=['POST'])
@login_required
def create_provider():
    """Create a new provider profile"""
    if current_user.provider:
        return {'errors': ['Provider profile already exists']}, 400
    
    data = request.json
    try:
        provider = Provider.create_provider(current_user.id, data)
        return provider.to_dict()
    except ValueError as e:
        return {'errors': [str(e)]}, 400
    
    
#Read
@provider_routes.route('/')
def get_all_providers():
    """Get all providers"""
    providers = Provider.query.all()
    return {'providers': [provider.to_dict() for provider in providers]}

@provider_routes.route('/<int:id>')
def get_provider(id):
    """Get specific provider details"""
    provider = Provider.query.get_or_404(id)
    return provider.to_dict()

@provider_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_provider(id):
    """Update provider profile"""
    provider = Provider.query.get_or_404(id)
    
    if provider.user_id != current_user.id:
        return {'errors': ['Unauthorized']}, 401
    
    data = request.json
    try:
        for key, value in data.items():
            if hasattr(provider, key):
                setattr(provider, key, value)
        db.session.commit()
        return provider.to_dict()
    except Exception as e:
        return {'errors': [str(e)]}, 400

@provider_routes.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_provider(id):
    """Delete provider profile"""
    provider = Provider.query.get_or_404(id)
    
    if provider.user_id != current_user.id:
        return {'errors': ['Unauthorized']}, 401
    
    try:
        db.session.delete(provider)
        db.session.commit()
        return {'message': 'Provider deleted successfully'}
    except Exception as e:
        return {'errors': [str(e)]}, 400

@provider_routes.route('/nearby')
def get_nearby_providers():
    """Get providers near a location"""
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radius = request.args.get('radius', 10, type=int)
    
    if not (lat and lng):
        return {'errors': ['Location required']}, 400
        
    providers = Provider.get_nearby_providers(lat, lng, radius)
    return {'providers': [p.to_dict() for p in providers]}

@provider_routes.route('/<int:id>/stats')
def get_provider_stats(id):
    """Get provider's impact statistics"""
    provider = Provider.query.get_or_404(id)
    return provider.get_provider_stats()

@provider_routes.route('/<int:id>/listings')
def get_provider_listings(id):
    """Get provider's food listings"""
    provider = Provider.query.get_or_404(id)
    return {'listings': [l.to_dict() for l in provider.get_active_listings()]}

@provider_routes.route('/<int:id>/impact')
def get_provider_impact(id):
    """Get provider's waste reduction impact"""
    provider = Provider.query.get_or_404(id)
    return provider.get_waste_reduction_impact()

@provider_routes.route('/<int:id>/dashboard')
@login_required
def get_provider_dashboard(id):
    """Get provider dashboard data"""
    provider = Provider.query.get_or_404(id)
    
    if provider.user_id != current_user.id:
        return {'errors': ['Unauthorized']}, 401
    
    return {
        'stats': provider.get_provider_stats(),
        'impact': provider.get_waste_reduction_impact(),
        'active_listings': [l.to_dict() for l in provider.get_active_listings()],
        'recent_reservations': provider.get_recent_reservations()
    } 