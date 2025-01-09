from flask import Blueprint, request
from flask_login import login_required, current_user
from app.models import AllergenAlert, db

allergen_routes = Blueprint('allergens', __name__)

@allergen_routes.route('/alerts', methods=['GET'])
@login_required
def get_user_alerts():
    """Get all allergen alerts for current user"""
    alerts = AllergenAlert.get_user_allergens(current_user.id)
    return {'alerts': [alert.to_dict() for alert in alerts]}

@allergen_routes.route('/alerts', methods=['POST'])
@login_required
def create_alert():
    """Create a new allergen alert"""
    data = request.json
    data['user_id'] = current_user.id
    
    try:
        alert = AllergenAlert.create_alert(data)
        return alert.to_dict(), 201
    except ValueError as e:
        return {'errors': [str(e)]}, 400

@allergen_routes.route('/alerts/bulk', methods=['POST'])
@login_required
def create_bulk_alerts():
    """Create multiple allergen alerts"""
    allergens = request.json.get('allergens', [])
    alerts = AllergenAlert.bulk_create_alerts(current_user.id, allergens)
    return {'alerts': [alert.to_dict() for alert in alerts]}, 201

@allergen_routes.route('/alerts/<int:id>', methods=['PUT'])
@login_required
def update_alert(id):
    """Update an allergen alert"""
    alert = AllergenAlert.query.get_or_404(id)
    if alert.user_id != current_user.id:
        return {'errors': ['Unauthorized']}, 403
        
    data = request.json
    alert.update_alert(data)
    return alert.to_dict()

@allergen_routes.route('/alerts/<int:id>', methods=['DELETE'])
@login_required
def delete_alert(id):
    """Delete an allergen alert"""
    alert = AllergenAlert.query.get_or_404(id)
    if alert.user_id != current_user.id:
        return {'errors': ['Unauthorized']}, 403
        
    alert.delete_alert()
    return {'message': 'Alert deleted successfully'}

@allergen_routes.route('/common')
def get_common_allergens():
    """Get list of common allergens"""
    return {'allergens': AllergenAlert.get_common_allergens()}

@allergen_routes.route('/check-food')
@login_required
def check_food_allergens():
    """Check if food contains user's allergens"""
    food_allergens = request.args.getlist('allergens')
    result = AllergenAlert.check_food_safety(current_user.id, food_allergens)
    return result 