from flask import Blueprint, request
from flask_login import current_user
from app.models import FoodListing, Provider, DistributionCenter
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

search_routes = Blueprint('search', __name__)

@search_routes.route('/listings')
def search_listings():
    """Search food listings with advanced filters"""
    query = request.args.get('q')
    filters = {
        'food_type': request.args.get('food_type'),
        'min_quantity': request.args.get('min_quantity', type=float),
        'max_price': request.args.get('max_price', type=float),
        'allergens_exclude': request.args.getlist('allergens_exclude'),
        'perishable': request.args.get('perishable', type=bool),
        'pickup_after': datetime.fromisoformat(request.args.get('pickup_after')) if request.args.get('pickup_after') else None,
        'provider_id': request.args.get('provider_id', type=int),
        'distance': request.args.get('distance', type=float),
        'lat': request.args.get('lat', type=float),
        'lng': request.args.get('lng', type=float),
        'sort_by': request.args.get('sort_by', 'relevance'),  # relevance, distance, expiry
        'page': request.args.get('page', 1, type=int),
        'per_page': request.args.get('per_page', 20, type=int)
    }
    
    results = FoodListing.search(query, **filters)
    return {
        'listings': [listing.to_dict() for listing in results.items],
        'total': results.total,
        'pages': results.pages,
        'current_page': results.page
    }

@search_routes.route('/providers')
def search_providers():
    """Search providers with filters"""
    query = request.args.get('q')
    filters = {
        'verified': request.args.get('verified', type=bool),
        'food_types': request.args.getlist('food_types'),
        'distance': request.args.get('distance', type=float),
        'lat': request.args.get('lat', type=float),
        'lng': request.args.get('lng', type=float),
        'sort_by': request.args.get('sort_by', 'relevance'),  # relevance, distance, rating
        'page': request.args.get('page', 1, type=int),
        'per_page': request.args.get('per_page', 20, type=int)
    }
    
    results = Provider.search(query, **filters)
    return {
        'providers': [provider.to_dict() for provider in results.items],
        'total': results.total,
        'pages': results.pages,
        'current_page': results.page
    }

@search_routes.route('/distribution-centers')
def search_centers():
    """Search distribution centers with filters"""
    query = request.args.get('q')
    filters = {
        'services': request.args.getlist('services'),
        'distance': request.args.get('distance', type=float),
        'lat': request.args.get('lat', type=float),
        'lng': request.args.get('lng', type=float),
        'sort_by': request.args.get('sort_by', 'relevance'),  # relevance, distance
        'page': request.args.get('page', 1, type=int),
        'per_page': request.args.get('per_page', 20, type=int)
    }
    
    results = DistributionCenter.search(query, **filters)
    return {
        'centers': [center.to_dict() for center in results.items],
        'total': results.total,
        'pages': results.pages,
        'current_page': results.page
    }

@search_routes.route('/distribution-centers/nearby')
def search_nearby_centers():
    """Search nearby distribution centers"""
    try:
        # Get and validate parameters
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        radius = request.args.get('radius', 10.0, type=float)
        
        if not (lat and lng):
            return {'errors': ['Latitude and longitude are required']}, 400
            
        if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
            return {'errors': ['Invalid coordinates']}, 400
            
        if radius <= 0 or radius > 100:  # Set a reasonable maximum radius
            return {'errors': ['Invalid radius']}, 400
            
        # Get nearby centers
        centers = DistributionCenter.get_nearby_centers(lat, lng, radius)
        
        return {
            'centers': centers,
            'total': len(centers),
            'metadata': {
                'latitude': lat,
                'longitude': lng,
                'radius_km': radius
            }
        }
        
    except ValueError as e:
        return {'errors': [str(e)]}, 400
    except Exception as e:
        db.session.rollback()
        return {'errors': ['An unexpected error occurred']}, 500

@search_routes.route('/advanced')
def advanced_search():
    """Advanced search across all entities"""
    query = request.args.get('q')
    entity_types = request.args.getlist('types')  # listings, providers, centers
    filters = {
        'distance': request.args.get('distance', type=float),
        'lat': request.args.get('lat', type=float),
        'lng': request.args.get('lng', type=float),
        'sort_by': request.args.get('sort_by', 'relevance'),
        'page': request.args.get('page', 1, type=int),
        'per_page': request.args.get('per_page', 20, type=int)
    }
    
    results = {}
    if not entity_types or 'listings' in entity_types:
        listing_results = FoodListing.search(query, **filters)
        results['listings'] = {
            'items': [listing.to_dict() for listing in listing_results.items],
            'total': listing_results.total
        }
    
    if not entity_types or 'providers' in entity_types:
        provider_results = Provider.search(query, **filters)
        results['providers'] = {
            'items': [provider.to_dict() for provider in provider_results.items],
            'total': provider_results.total
        }
    
    if not entity_types or 'centers' in entity_types:
        center_results = DistributionCenter.search(query, **filters)
        results['centers'] = {
            'items': [center.to_dict() for center in center_results.items],
            'total': center_results.total
        }
    
    return results 