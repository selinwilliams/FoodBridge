from flask import Blueprint, request
from flask_login import login_required, current_user
from app.models import Reservation, db

reservation_routes = Blueprint('reservations', __name__)

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