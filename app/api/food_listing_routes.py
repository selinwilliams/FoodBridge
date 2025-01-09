from flask import Blueprint, request
from flask_login import login_required, current_user
from app.models import FoodListing, db
from datetime import datetime

food_listing_routes = Blueprint('food_listings', __name__)

@food_listing_routes.route('', methods=['GET'])
def get_listings():
    """Get all available food listings with filters"""
    food_type = request.args.get('food_type')
    filters = {
        'min_quantity': request.args.get('min_quantity', type=float),
        'max_price': request.args.get('max_price', type=float),
        'allergens_exclude': request.args.getlist('allergens_exclude'),
        'perishable': request.args.get('perishable', type=bool),
        'pickup_after': datetime.fromisoformat(request.args.get('pickup_after')) if request.args.get('pickup_after') else None
    }
    
    listings = FoodListing.search_listings(food_type=food_type, **filters)
    return {'listings': [listing.to_dict() for listing in listings]}

@food_listing_routes.route('', methods=['POST'])
@login_required
def create_listing():
    """Create a new food listing"""
    if not current_user.is_provider():
        return {'errors': ['Unauthorized']}, 403
        
    data = request.json
    listing = FoodListing.create_listing(current_user.provider.id, data)
    return listing.to_dict(), 201

@food_listing_routes.route('/<int:id>', methods=['GET'])
def get_listing(id):
    """Get a specific food listing"""
    listing = FoodListing.query.get_or_404(id)
    return listing.to_dict()

@food_listing_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_listing(id):
    """Update a food listing"""
    listing = FoodListing.query.get_or_404(id)
    if listing.provider_id != current_user.provider.id:
        return {'errors': ['Unauthorized']}, 403
        
    data = request.json
    listing.update_listing(data)
    return listing.to_dict()

@food_listing_routes.route('/urgent')
def get_urgent_listings():
    """Get listings that need urgent pickup"""
    hours = request.args.get('hours', 12, type=int)
    listings = FoodListing.get_urgent_listings(hours_threshold=hours)
    return {'listings': [listing.to_dict() for listing in listings]}

@food_listing_routes.route('/<int:id>/similar')
def get_similar_listings(id):
    """Get similar food listings"""
    listing = FoodListing.query.get_or_404(id)
    similar = listing.get_similar_listings()
    return {'listings': [l.to_dict() for l in similar]} 