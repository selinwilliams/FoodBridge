from flask import Blueprint, request
from flask_login import login_required, current_user
from app.models import Reservation, db
from datetime import datetime

reservation_routes = Blueprint('reservations', __name__)

@reservation_routes.route('', methods=['GET'])
@login_required
def get_all_reservations():
    """Get all reservations (admin only)"""
    if not current_user.is_admin():
        return {'errors': ['Unauthorized']}, 403
    
    status = request.args.get('status')
    reservations = Reservation.get_all_reservations(status)
    return {'reservations': [r.to_dict() for r in reservations]}

@reservation_routes.route('', methods=['POST'])
@login_required
def create_reservation():
    """Create a new reservation"""
    if not current_user.can_make_reservation():
        return {'errors': ['Unauthorized']}, 403
        
    data = request.json
    data['recipient_id'] = current_user.id
    reservation = Reservation.create_reservation(data)
    
    if not reservation:
        return {'errors': ['Invalid reservation request']}, 400
        
    return reservation.to_dict(), 201

@reservation_routes.route('/user')
@login_required
def get_user_reservations():
    """Get current user's reservations"""
    status = request.args.get('status')
    reservations = Reservation.get_user_reservations(current_user.id, status)
    return {'reservations': [r.to_dict() for r in reservations]}

@reservation_routes.route('/provider')
@login_required
def get_provider_reservations():
    """Get provider's reservations"""
    if not current_user.is_provider():
        return {'errors': ['Unauthorized']}, 403
    
    status = request.args.get('status')
    reservations = Reservation.get_provider_reservations(current_user.provider.id, status)
    return {'reservations': [r.to_dict() for r in reservations]}

@reservation_routes.route('/<int:id>', methods=['GET'])
@login_required
def get_reservation(id):
    """Get specific reservation details"""
    reservation = Reservation.query.get_or_404(id)
    
    # Check authorization
    is_recipient = reservation.recipient_id == current_user.id
    is_provider = current_user.is_provider() and reservation.food_listing.provider_id == current_user.provider.id
    is_admin = current_user.is_admin()
    
    if not (is_recipient or is_provider or is_admin):
        return {'errors': ['Unauthorized']}, 403
    
    return reservation.to_dict()

@reservation_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_reservation(id):
    """Update reservation status"""
    reservation = Reservation.query.get_or_404(id)
    
    # Check authorization
    is_recipient = reservation.recipient_id == current_user.id
    is_provider = current_user.is_provider() and reservation.food_listing.provider_id == current_user.provider.id
    
    if not (is_recipient or is_provider):
        return {'errors': ['Unauthorized']}, 403
    
    action = request.json.get('action')
    if action == 'confirm' and is_provider:
        success = reservation.confirm()
    elif action == 'complete' and is_provider:
        success = reservation.complete()
    elif action == 'cancel' and (is_recipient or is_provider):
        success = reservation.cancel()
    else:
        return {'errors': ['Invalid action']}, 400
        
    if success:
        return reservation.to_dict()
    return {'errors': ['Unable to update reservation']}, 400

@reservation_routes.route('/<int:id>/pickup-time', methods=['PUT'])
@login_required
def update_pickup_time(id):
    """Update reservation pickup time"""
    reservation = Reservation.query.get_or_404(id)
    if reservation.recipient_id != current_user.id:
        return {'errors': ['Unauthorized']}, 403
        
    new_time = request.json.get('pickup_time')
    if reservation.update_pickup_time(new_time):
        return reservation.to_dict()
    return {'errors': ['Unable to update pickup time']}, 400

@reservation_routes.route('/history')
@login_required
def get_reservation_history():
    """Get user's reservation history"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    if current_user.is_provider():
        history = Reservation.get_provider_history(current_user.provider.id, page, per_page)
    else:
        history = Reservation.get_user_history(current_user.id, page, per_page)
    
    return {
        'reservations': [r.to_dict() for r in history.items],
        'total': history.total,
        'pages': history.pages,
        'current_page': history.page
    }

@reservation_routes.route('/upcoming')
@login_required
def get_upcoming_reservations():
    """Get upcoming reservations"""
    days = request.args.get('days', 7, type=int)
    
    if current_user.is_provider():
        reservations = Reservation.get_provider_upcoming(current_user.provider.id, days)
    else:
        reservations = Reservation.get_user_upcoming(current_user.id, days)
    
    return {'reservations': [r.to_dict() for r in reservations]} 