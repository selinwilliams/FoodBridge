from flask import Blueprint, request, jsonify
from flask_login import login_required
from app.models import DistributionCenter, db
from app.api.admin_routes import admin_required

dc_routes = Blueprint('distribution_centers', __name__)

@dc_routes.route('', methods=['GET'])
def get_distribution_centers():
    """Get all distribution centers"""
    try:
        centers = DistributionCenter.query.all()
        return {'distribution_centers': [center.to_dict() for center in centers]}
    except Exception as e:
        return {'errors': ['An error occurred while fetching centers']}, 500

@dc_routes.route('/<int:id>', methods=['GET'])
def get_distribution_center(id):
    """Get a specific distribution center"""
    try:
        center = DistributionCenter.query.get_or_404(id)
        return center.to_dict()
    except Exception as e:
        return {'errors': ['Center not found']}, 404

@dc_routes.route('', methods=['POST'])
@admin_required
def create_distribution_center():
    """Create a new distribution center"""
    try:
        data = request.json
        required_fields = ['name', 'address', 'latitude', 'longitude']
        
        # Validate required fields
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return {'errors': [f'Missing required fields: {", ".join(missing_fields)}']}, 400
            
        center = DistributionCenter(
            name=data['name'],
            address=data['address'],
            latitude=float(data['latitude']),
            longitude=float(data['longitude']),
            contact_person=data.get('contact_person'),
            phone=data.get('phone'),
            operating_hours=data.get('operating_hours'),
            email=data.get('email'),
            capacity_limit=data.get('capacity_limit', 100)
        )
        
        db.session.add(center)
        db.session.commit()
        return center.to_dict(), 201
        
    except ValueError as e:
        return {'errors': [str(e)]}, 400
    except Exception as e:
        db.session.rollback()
        return {'errors': ['An error occurred while creating the center']}, 500

@dc_routes.route('/<int:id>', methods=['PUT'])
@admin_required
def update_distribution_center(id):
    """Update a distribution center"""
    try:
        center = DistributionCenter.query.get_or_404(id)
        data = request.json
        
        # Update fields
        for key, value in data.items():
            if hasattr(center, key):
                setattr(center, key, value)
                
        db.session.commit()
        return center.to_dict()
        
    except Exception as e:
        db.session.rollback()
        return {'errors': ['An error occurred while updating the center']}, 500

@dc_routes.route('/<int:id>', methods=['DELETE'])
@admin_required
def delete_distribution_center(id):
    """Delete a distribution center"""
    try:
        center = DistributionCenter.query.get_or_404(id)
        db.session.delete(center)
        db.session.commit()
        return {'message': 'Successfully deleted'}, 200
        
    except Exception as e:
        db.session.rollback()
        return {'errors': ['An error occurred while deleting the center']}, 500

@dc_routes.route('/nearby', methods=['GET'])
def get_nearby_centers():
    """Get nearby distribution centers"""
    try:
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        radius = request.args.get('radius', 10, type=float)
        
        if not (lat and lng):
            return {'errors': ['Latitude and longitude required']}, 400
            
        if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
            return {'errors': ['Invalid coordinates']}, 400
            
        centers = DistributionCenter.get_nearby_centers(lat, lng, radius)
        return {
            'centers': centers,
            'total': len(centers)
        }
        
    except ValueError as e:
        return {'errors': [str(e)]}, 400
    except Exception as e:
        return {'errors': ['An unexpected error occurred']}, 500

@dc_routes.route('/<int:id>/schedule')
def get_center_schedule(id):
    """Get center's schedule"""
    center = DistributionCenter.query.get_or_404(id)
    date = request.args.get('date')
    if date:
        return center.get_daily_schedule(datetime.fromisoformat(date))
    return center.get_weekly_schedule()

@dc_routes.route('/<int:id>/schedule', methods=['PUT'])
@login_required
def update_center_schedule(id):
    """Update center's schedule"""
    if not current_user.is_admin():
        return {'errors': ['Unauthorized']}, 403
        
    center = DistributionCenter.query.get_or_404(id)
    data = request.json
    if center.update_schedule(data):
        return center.get_weekly_schedule()
    return {'errors': ['Unable to update schedule']}, 400

@dc_routes.route('/<int:id>/capacity')
def get_center_capacity(id):
    """Get center's current capacity status"""
    center = DistributionCenter.query.get_or_404(id)
    return center.get_capacity_metrics()

@dc_routes.route('/<int:id>/capacity', methods=['PUT'])
@login_required
def update_center_capacity(id):
    """Update center's capacity limits"""
    if not current_user.is_admin():
        return {'errors': ['Unauthorized']}, 403
        
    center = DistributionCenter.query.get_or_404(id)
    data = request.json
    if center.update_capacity_limits(data):
        return center.get_capacity_metrics()
    return {'errors': ['Unable to update capacity']}, 400

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

@dc_routes.route('/<int:id>/stats')
def get_center_stats(id):
    """Get center's operational statistics"""
    center = DistributionCenter.query.get_or_404(id)
    timeframe = request.args.get('timeframe', 'week')  # week, month, year
    return center.get_operational_stats(timeframe) 