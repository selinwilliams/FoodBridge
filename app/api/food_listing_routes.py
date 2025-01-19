from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import FoodListing, db
from app.models.food_listing import FoodStatus, FoodType
from datetime import datetime, timedelta
from sqlalchemy import and_, or_
from functools import wraps
import json
from app.utils.error_handlers import handle_errors


food_listing_routes = Blueprint('food_listings', __name__, url_prefix='/api/food-listings')

def provider_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return {'errors': {'message': 'Authentication required'}}, 401
        if not current_user.is_provider():
            return {'errors': {'message': 'Must be a provider'}}, 403
        return f(*args, **kwargs)
    return decorated_function

@food_listing_routes.route('/urgent', methods=['GET'])
def get_urgent_listings():
    """Get urgent food listings (expiring within 3 days)"""
    # Calculate the urgent threshold (3 days from now)
    urgent_threshold = datetime.utcnow() + timedelta(days=3)
    
    # Build query for urgent listings
    query = FoodListing.query.filter(
        and_(
            FoodListing.status == FoodStatus.AVAILABLE,
            FoodListing.expiration_date <= urgent_threshold
        )
    ).order_by(FoodListing.expiration_date.asc())
    
    # Parse pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Execute paginated query
    paginated_listings = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    return {
        'listings': [listing.to_dict() for listing in paginated_listings.items],
        'total': paginated_listings.total,
        'pages': paginated_listings.pages,
        'current_page': paginated_listings.page,
        'has_next': paginated_listings.has_next,
        'has_prev': paginated_listings.has_prev
    }

@food_listing_routes.route('', methods=['GET'])
def get_listings():
    """Get all available food listings with filters"""
    # Parse query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    sort_by = request.args.get('sort_by', 'created_at')
    order = request.args.get('order', 'desc')
    
    # Build base query
    query = FoodListing.query.filter(FoodListing.status == FoodStatus.AVAILABLE)
    
    # Apply filters
    if food_type := request.args.get('food_type'):
        try:
            query = query.filter(FoodListing.food_type == FoodType[food_type.upper()])
        except KeyError:
            return {'errors': ['Invalid food type']}, 400
            
    if min_quantity := request.args.get('min_quantity', type=float):
        query = query.filter(FoodListing.quantity >= min_quantity)
        
    if max_price := request.args.get('max_price', type=float):
        query = query.filter(FoodListing.discounted_price <= max_price)
        
    if allergens_exclude := request.args.getlist('allergens_exclude'):
        for allergen in allergens_exclude:
            query = query.filter(~FoodListing.allergens.contains(allergen))
            
    if pickup_after := request.args.get('pickup_after'):
        try:
            pickup_date = datetime.fromisoformat(pickup_after.replace('Z', ''))
            query = query.filter(FoodListing.pickup_window_start >= pickup_date)
        except ValueError:
            return {'errors': ['Invalid date format']}, 400
            
    if request.args.get('perishable') is not None:
        is_perishable = request.args.get('perishable').lower() == 'true'
        query = query.filter(FoodListing.is_perishable == is_perishable)
        
    if provider_id := request.args.get('provider_id', type=int):
        query = query.filter(FoodListing.provider_id == provider_id)
        
    if distribution_center_id := request.args.get('distribution_center_id', type=int):
        query = query.filter(FoodListing.distribution_center_id == distribution_center_id)
    
    # Apply sorting
    if sort_by == 'expiration':
        query = query.order_by(
            FoodListing.expiration_date.asc() if order == 'asc' 
            else FoodListing.expiration_date.desc()
        )
    elif sort_by == 'price':
        query = query.order_by(
            FoodListing.discounted_price.asc() if order == 'asc'
            else FoodListing.discounted_price.desc()
        )
    else:  # default to created_at
        query = query.order_by(
            FoodListing.created_at.asc() if order == 'asc'
            else FoodListing.created_at.desc()
        )
    
    # Execute paginated query
    paginated_listings = query.paginate(
        page=page, 
        per_page=per_page,
        error_out=False
    )
    
    return {
        'listings': [listing.to_dict() for listing in paginated_listings.items],
        'total': paginated_listings.total,
        'pages': paginated_listings.pages,
        'current_page': paginated_listings.page,
        'has_next': paginated_listings.has_next,
        'has_prev': paginated_listings.has_prev
    }

@food_listing_routes.route('/<int:id>', methods=['GET'])
def get_listing(id):
    """Get a single food listing"""
    listing = FoodListing.query.get(id)
    if not listing:
        return {'message': "Food listing couldn't be found"}, 404
    return listing.to_dict()

@food_listing_routes.route('', methods=['POST'])
@provider_required
@handle_errors
def create_listing():
    """Create a new food listing"""
    try:
        data = request.json
        
        # Set default pickup window if not provided
        now = datetime.utcnow()
        pickup_start = now + timedelta(hours=1)
        pickup_end = now + timedelta(hours=8)

        # Create the listing with required fields
        listing = FoodListing(
            provider_id=current_user.provider.id,
            title=data['title'],
            description=data['description'],
            food_type=FoodType.PRODUCE,  # Default to PRODUCE, should be made dynamic
            quantity=data['quantity'],
            unit=data['unit'],
            expiration_date=datetime.fromisoformat(data['expiration_date'].replace('Z', '')),
            pickup_window_start=data.get('pickup_window_start', pickup_start),
            pickup_window_end=data.get('pickup_window_end', pickup_end),
            status=FoodStatus.AVAILABLE,
            allergens=json.dumps(data.get('allergens', [])),
            is_perishable=data.get('is_perishable', True)
        )
        
        if 'distribution_center_id' in data:
            listing.distribution_center_id = data['distribution_center_id']
            
        db.session.add(listing)
        db.session.commit()
        return listing.to_dict(), 201
        
    except KeyError as e:
        return {
            'message': 'Validation error',
            'errors': {str(e).strip("'"): 'This field is required'}
        }, 400
    except Exception as e:
        db.session.rollback()
        return {'errors': [str(e)]}, 400

@food_listing_routes.route('/<int:id>', methods=['PUT'])
@provider_required
def update_listing(id):
    """Update a food listing"""
    listing = FoodListing.query.get(id)
    if not listing:
        return {'message': "Food listing couldn't be found"}, 404
        
    if listing.provider_id != current_user.provider.id:
        return {'errors': ['Unauthorized - Not the owner']}, 403
        
    try:
        data = request.json
        
        # Update allowed fields
        if 'title' in data:
            listing.title = data['title']
        if 'description' in data:
            listing.description = data['description']
        if 'quantity' in data:
            listing.quantity = data['quantity']
        if 'status' in data:
            listing.status = data['status']
            
        db.session.commit()
        return listing.to_dict()
    except Exception as e:
        db.session.rollback()
        return {'errors': [str(e)]}, 400

@food_listing_routes.route('/<int:id>', methods=['DELETE'])
@provider_required
def delete_listing(id):
    """Delete a food listing"""
    listing = FoodListing.query.get(id)
    if not listing:
        return {'message': "Food listing couldn't be found"}, 404
        
    if listing.provider_id != current_user.provider.id:
        return {'errors': ['Unauthorized - Not the owner']}, 403
        
    try:
        db.session.delete(listing)
        db.session.commit()
        return {'message': 'Successfully deleted'}
    except Exception as e:
        db.session.rollback()
        return {'errors': [str(e)]}, 400 