from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import User, Provider, FoodListing, Reservation, db
from datetime import datetime, timedelta
from functools import wraps

admin_routes = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin():
            return {'errors': ['Unauthorized']}, 403
        return f(*args, **kwargs)
    return decorated_function

@admin_routes.route('/users')
@admin_required
def manage_users():
    """Get all users with filters"""
    status = request.args.get('status')
    role = request.args.get('role')
    users = User.get_filtered_users(status=status, role=role)
    return {'users': [user.to_dict() for user in users]}

@admin_routes.route('/providers')
@admin_required
def manage_providers():
    """Get all providers with filters"""
    status = request.args.get('status')
    verified = request.args.get('verified', type=bool)
    providers = Provider.get_filtered_providers(status=status, verified=verified)
    return {'providers': [provider.to_dict() for provider in providers]}

@admin_routes.route('/listings')
@admin_required
def manage_listings():
    """Get all food listings with filters"""
    status = request.args.get('status')
    provider_id = request.args.get('provider_id', type=int)
    listings = FoodListing.get_filtered_listings(status=status, provider_id=provider_id)
    return {'listings': [listing.to_dict() for listing in listings]}

@admin_routes.route('/reservations')
@admin_required
def manage_reservations():
    """Get all reservations with filters"""
    status = request.args.get('status')
    provider_id = request.args.get('provider_id', type=int)
    recipient_id = request.args.get('recipient_id', type=int)
    reservations = Reservation.get_filtered_reservations(
        status=status,
        provider_id=provider_id,
        recipient_id=recipient_id
    )
    return {'reservations': [reservation.to_dict() for reservation in reservations]}

@admin_routes.route('/centers')
@admin_required
def manage_centers():
    """Get all distribution centers with filters"""
    status = request.args.get('status')
    centers = DistributionCenter.get_filtered_centers(status=status)
    return {'centers': [center.to_dict() for center in centers]}

@admin_routes.route('/statistics', methods=['GET'])
@login_required
@admin_required
def get_admin_statistics():
    """Get comprehensive admin dashboard statistics"""
    try:
        # Get provider count - check both user_type and is_provider
        provider_count = User.query.filter(
            (User.user_type == 'PROVIDER') | (User.is_provider == True)
        ).count()
        
        # Get recipient count - exclude providers and admins
        recipient_count = User.query.filter(
            User.user_type == 'RECIPIENT',
            User.is_provider == False,
            User.is_admin == False
        ).count()
        
        # Get listing counts
        active_listings = FoodListing.query.filter_by(status='AVAILABLE').count()
        total_listings = FoodListing.query.count()
        
        print(f"Debug - Counts: providers={provider_count}, recipients={recipient_count}, active_listings={active_listings}, total_listings={total_listings}")
        
        return jsonify({
            'provider_stats': {
                'total_providers': provider_count
            },
            'user_stats': {
                'total_recipients': recipient_count
            },
            'listing_stats': {
                'active_listings': active_listings,
                'total_listings': total_listings
            }
        })
    except Exception as e:
        print(f"Error in get_admin_statistics: {str(e)}")
        return {'errors': [str(e)]}, 500

@admin_routes.route('/reports')
@admin_required
def generate_reports():
    """Generate system reports"""
    report_type = request.args.get('type', 'usage')  # usage, impact, performance
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if start_date:
        start_date = datetime.fromisoformat(start_date)
    if end_date:
        end_date = datetime.fromisoformat(end_date)
    
    return {
        'report': {
            'type': report_type,
            'start_date': start_date,
            'end_date': end_date,
            'data': generate_system_report(report_type, start_date, end_date)
        }
    }

@admin_routes.route('/verify/<string:entity_type>/<int:id>', methods=['PUT'])
@admin_required
def verify_entity(entity_type, id):
    """Verify a provider or user"""
    if entity_type not in ['provider', 'user']:
        return {'errors': ['Invalid entity type']}, 400
    
    try:
        if entity_type == 'provider':
            entity = Provider.query.get_or_404(id)
        else:
            entity = User.query.get_or_404(id)
            
        entity.verify()
        db.session.commit()
        return entity.to_dict()
    except Exception as e:
        return {'errors': [str(e)]}, 400

def generate_system_report(report_type, start_date, end_date):
    """Generate system report based on type and date range"""
    if report_type == 'usage':
        return {
            'active_users': User.get_active_users_count(start_date, end_date),
            'new_providers': Provider.get_new_providers_count(start_date, end_date),
            'successful_reservations': Reservation.get_successful_count(start_date, end_date),
            'food_saved': FoodListing.get_food_saved_metrics(start_date, end_date)
        }
    elif report_type == 'impact':
        return {
            'environmental_impact': calculate_environmental_impact(start_date, end_date),
            'social_impact': calculate_social_impact(start_date, end_date),
            'community_engagement': get_community_engagement_metrics(start_date, end_date)
        }
    elif report_type == 'performance':
        return {
            'system_performance': get_system_performance_metrics(start_date, end_date),
            'response_times': get_response_time_metrics(start_date, end_date),
            'error_rates': get_error_rate_metrics(start_date, end_date)
        }
    return {'error': 'Invalid report type'} 