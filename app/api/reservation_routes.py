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
    if current_user.user_type != UserType.RECIPIENT:
        return {'errors': ['Only recipients can create reservations']}, 403
        
    data = request.json
    try:
        reservation = Reservation.create_reservation(
            recipient_id=current_user.id,
            listing_id=data.get('listing_id'),
            quantity=data.get('quantity'),
            pickup_time=data.get('pickup_time')
        )
        return reservation.to_dict()
    except Exception as e:
        return {'errors': [str(e)]}, 400

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

@reservation_routes.route('/<int:id>')
@login_required
def get_reservation(id):
    """Get specific reservation details"""
    reservation = Reservation.query.get_or_404(id)
    
    # Check authorization
    if not (reservation.recipient_id == current_user.id or 
            (current_user.is_provider() and reservation.food_listing.provider_id == current_user.provider.id)):
        return {'errors': ['Unauthorized']}, 403
        
    return reservation.to_dict()

@reservation_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_reservation(id):
    """Update reservation details"""
    reservation = Reservation.query.get_or_404(id)
    
    # Check authorization
    if not (reservation.recipient_id == current_user.id or 
            (current_user.is_provider() and reservation.food_listing.provider_id == current_user.provider.id)):
        return {'errors': ['Unauthorized']}, 403
        
    data = request.json
    try:
        for key, value in data.items():
            if hasattr(reservation, key):
                setattr(reservation, key, value)
        db.session.commit()
        return reservation.to_dict()
    except Exception as e:
        return {'errors': [str(e)]}, 400

@reservation_routes.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_reservation(id):
    """Cancel/delete a reservation"""
    reservation = Reservation.query.get_or_404(id)
    
    # Check authorization
    if not (reservation.recipient_id == current_user.id or 
            (current_user.is_provider() and reservation.food_listing.provider_id == current_user.provider.id)):
        return {'errors': ['Unauthorized']}, 403
        
    try:
        db.session.delete(reservation)
        db.session.commit()
        return {'message': 'Successfully cancelled reservation'}
    except Exception as e:
        return {'errors': [str(e)]}, 400

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