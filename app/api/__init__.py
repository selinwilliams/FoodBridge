from flask import Blueprint
from .auth_routes import auth_routes
from .user_routes import user_routes 
from .food_listing_routes import food_listing_routes
from .reservation_routes import reservation_routes
from .admin_routes import admin_routes
from .provider_routes import provider_routes



api_routes = Blueprint('api', __name__)

api_routes.register_blueprint(auth_routes, url_prefix='/auth')
api_routes.register_blueprint(user_routes, url_prefix='/users')
api_routes.register_blueprint(food_listing_routes, url_prefix='/food-listings')
api_routes.register_blueprint(reservation_routes, url_prefix='/reservations')
api_routes.register_blueprint(admin_routes, url_prefix='/admin')
api_routes.register_blueprint(provider_routes, url_prefix='/providers')

