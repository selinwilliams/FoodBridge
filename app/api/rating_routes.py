from flask import Blueprint, request
from flask_login import login_required, current_user
from app.models import ProviderRating, db, UserType

rating_routes = Blueprint('ratings', __name__)

@rating_routes.route('', methods=['POST'])
@login_required
def create_rating():
    """Create a new provider rating"""
    if current_user.user_type != UserType.RECIPIENT:
        return {'errors': ['Only recipients can create ratings']}, 403
        
    data = request.json
    try:
        rating = ProviderRating(
            provider_id=data.get('provider_id'),
            recipient_id=current_user.id,
            rating=data.get('rating'),
            comment=data.get('comment')
        )
        db.session.add(rating)
        db.session.commit()
        return rating.to_dict()
    except Exception as e:
        return {'errors': [str(e)]}, 400

@rating_routes.route('/provider/<int:provider_id>')
def get_provider_ratings(provider_id):
    """Get all ratings for a provider"""
    ratings = ProviderRating.query.filter_by(provider_id=provider_id).all()
    return {'ratings': [rating.to_dict() for rating in ratings]} 