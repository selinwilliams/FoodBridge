from flask import Blueprint, request
from flask_login import login_required, current_user
from app.models import Provider, db
from datetime import datetime

provider_routes = Blueprint('providers', __name__)

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