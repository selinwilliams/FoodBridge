from flask import Blueprint, request
from flask_login import login_required, current_user
from app.models import DistributionCenter, db
from datetime import datetime

dc_routes = Blueprint('distribution_centers', __name__)

@dc_routes.route('', methods=['GET'])
def get_centers():
    """Get all distribution centers with optional location filtering"""
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radius = request.args.get('radius', 10, type=int)
    
    if lat and lng:
        centers = DistributionCenter.get_nearby_centers(lat, lng, radius)
    else:
        centers = DistributionCenter.query.all()
        
    return {'centers': [center.to_dict() for center in centers]}

@dc_routes.route('', methods=['POST'])
@login_required
def create_center():
    """Create a new distribution center"""
    if not current_user.is_admin():
        return {'errors': ['Unauthorized']}, 403
        
    data = request.json
    center = DistributionCenter.create_center(data)
    return center.to_dict(), 201

@dc_routes.route('/<int:id>', methods=['GET'])
def get_center(id):
    """Get a specific distribution center"""
    center = DistributionCenter.query.get_or_404(id)
    return center.to_dict()

@dc_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_center(id):
    """Update a distribution center"""
    if not current_user.is_admin():
        return {'errors': ['Unauthorized']}, 403
        
    center = DistributionCenter.query.get_or_404(id)
    data = request.json
    center.update_center(data)
    return center.to_dict()

@dc_routes.route('/<int:id>/schedule')
def get_center_schedule(id):
    """Get center's schedule"""
    center = DistributionCenter.query.get_or_404(id)
    date = request.args.get('date')
    if date:
        return center.get_daily_schedule(datetime.fromisoformat(date))
    return center.get_weekly_schedule()

@dc_routes.route('/<int:id>/capacity')
def get_center_capacity(id):
    """Get center's current capacity status"""
    center = DistributionCenter.query.get_or_404(id)
    return center.get_capacity_metrics()

@dc_routes.route('/<int:id>/impact')
def get_center_impact(id):
    """Get center's impact metrics"""
    center = DistributionCenter.query.get_or_404(id)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if start_date:
        start_date = datetime.fromisoformat(start_date)
    if end_date:
        end_date = datetime.fromisoformat(end_date)
        
    return center.get_impact_metrics(start_date, end_date) 