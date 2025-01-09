from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from ..models import User, db

user_routes = Blueprint('users', __name__)


@user_routes.route('/')
@login_required
def users():
    """
    Query for all users and returns them in a list of user dictionaries
    """
    users = User.query.all()
    return {'users': [user.to_dict() for user in users]}


@user_routes.route('/<int:id>')
@login_required
def user(id):
    """
    Query for a user by id and returns that user in a dictionary
    """
    user = User.query.get(id)
    return user.to_dict()


@user_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_user(id):
    """
    Update a user's information
    """
    if current_user.id != id:
        return {'errors': ['Unauthorized']}, 401
    
    user = User.query.get(id)
    if not user:
        return {'errors': ['User not found']}, 404

    data = request.json
    try:
        for key, value in data.items():
            if hasattr(user, key):
                setattr(user, key, value)
        db.session.commit()
        return user.to_dict()
    except Exception as e:
        return {'errors': [str(e)]}, 400


@user_routes.route('/profile')
@login_required
def get_profile():
    """
    Get current user's profile
    """
    return current_user.to_dict()


@user_routes.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    """
    Update current user's profile
    """
    data = request.json
    try:
        for key, value in data.items():
            if hasattr(current_user, key):
                setattr(current_user, key, value)
        db.session.commit()
        return current_user.to_dict()
    except Exception as e:
        return {'errors': [str(e)]}, 400


@user_routes.route('/preferences')
@login_required
def get_preferences():
    """
    Get user preferences
    """
    return {'preferences': current_user.get_preferences()}


@user_routes.route('/preferences', methods=['PUT'])
@login_required
def update_preferences():
    """
    Update user preferences
    """
    data = request.json
    try:
        current_user.update_preferences(data)
        db.session.commit()
        return {'preferences': current_user.get_preferences()}
    except Exception as e:
        return {'errors': [str(e)]}, 400
