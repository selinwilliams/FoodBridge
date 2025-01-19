from flask import Blueprint, request
from flask_login import login_required, current_user
from app.models import User, Provider, FoodListing, Reservation, DistributionCenter
from datetime import datetime

analytics_routes = Blueprint('analytics', __name__)

@analytics_routes.route('/impact')
def get_impact():
    """Get environmental impact metrics"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if start_date:
        start_date = datetime.fromisoformat(start_date)
    if end_date:
        end_date = datetime.fromisoformat(end_date)
    
    return {
        'food_waste_reduction': FoodListing.get_waste_reduction_metrics(start_date, end_date),
        'carbon_footprint': calculate_carbon_footprint(start_date, end_date),
        'water_savings': calculate_water_savings(start_date, end_date),
        'landfill_diversion': calculate_landfill_diversion(start_date, end_date),
        'social_impact': calculate_social_impact(start_date, end_date)
    }

@analytics_routes.route('/usage')
def get_usage_stats():
    """Get platform usage statistics"""
    timeframe = request.args.get('timeframe', 'week')  # day, week, month, year
    return {
        'active_users': User.get_active_users_stats(timeframe),
        'new_registrations': User.get_registration_stats(timeframe),
        'listings_created': FoodListing.get_creation_stats(timeframe),
        'successful_pickups': Reservation.get_completion_stats(timeframe),
        'provider_engagement': Provider.get_engagement_stats(timeframe)
    }

@analytics_routes.route('/trends')
def get_trends():
    """Get trend analysis"""
    timeframe = request.args.get('timeframe', 'month')  # week, month, year
    return {
        'user_growth': User.get_growth_trends(timeframe),
        'provider_growth': Provider.get_growth_trends(timeframe),
        'listing_trends': FoodListing.get_listing_trends(timeframe),
        'pickup_trends': Reservation.get_pickup_trends(timeframe),
        'impact_trends': get_impact_trends(timeframe)
    }

@analytics_routes.route('/provider/<int:id>')
@login_required
def get_provider_analytics(id):
    """Get provider-specific analytics"""
    if not (current_user.is_admin() or 
            (current_user.is_provider() and current_user.provider.id == id)):
        return {'errors': ['Unauthorized']}, 403
    
    provider = Provider.query.get_or_404(id)
    timeframe = request.args.get('timeframe', 'month')  # week, month, year
    
    return {
        'listing_stats': provider.get_listing_stats(timeframe),
        'pickup_stats': provider.get_pickup_stats(timeframe),
        'impact_metrics': provider.get_impact_metrics(timeframe),
        'engagement_metrics': provider.get_engagement_metrics(timeframe),
        'comparison_metrics': provider.get_comparison_metrics(timeframe)
    }

@analytics_routes.route('/center/<int:id>')
def get_center_analytics(id):
    """Get distribution center analytics"""
    center = DistributionCenter.query.get_or_404(id)
    timeframe = request.args.get('timeframe', 'month')  # week, month, year
    
    return {
        'capacity_utilization': center.get_capacity_utilization(timeframe),
        'throughput_metrics': center.get_throughput_metrics(timeframe),
        'efficiency_metrics': center.get_efficiency_metrics(timeframe),
        'impact_metrics': center.get_impact_metrics(timeframe),
        'service_metrics': center.get_service_metrics(timeframe)
    }

def calculate_carbon_footprint(start_date, end_date):
    """Calculate carbon footprint savings"""
    food_saved = FoodListing.get_food_saved_weight(start_date, end_date)
    transport_savings = calculate_transport_savings(start_date, end_date)
    landfill_savings = calculate_landfill_emissions_saved(start_date, end_date)
    
    return {
        'total_co2_saved': food_saved * 2.5 + transport_savings + landfill_savings,  # kg CO2
        'equivalent_trees': (food_saved * 2.5 + transport_savings + landfill_savings) / 20,  # 1 tree absorbs ~20kg CO2/year
        'breakdown': {
            'food_production': food_saved * 2.5,
            'transportation': transport_savings,
            'landfill': landfill_savings
        }
    }

def calculate_water_savings(start_date, end_date):
    """Calculate water savings from food waste reduction"""
    food_saved = FoodListing.get_food_saved_weight(start_date, end_date)
    return {
        'total_water_saved': food_saved * 1000,  # liters
        'equivalent_showers': (food_saved * 1000) / 100,  # 1 shower ~100L
        'by_food_type': FoodListing.get_water_savings_by_type(start_date, end_date)
    }

def calculate_landfill_diversion(start_date, end_date):
    """Calculate waste diverted from landfills"""
    food_saved = FoodListing.get_food_saved_weight(start_date, end_date)
    return {
        'total_diverted': food_saved,  # kg
        'landfill_space_saved': food_saved * 0.001,  # m³
        'breakdown_by_type': FoodListing.get_landfill_diversion_by_type(start_date, end_date)
    }

def calculate_social_impact(start_date, end_date):
    """Calculate social impact metrics"""
    return {
        'meals_provided': FoodListing.get_meals_equivalent(start_date, end_date),
        'people_served': Reservation.get_unique_recipients(start_date, end_date),
        'community_engagement': get_community_engagement_metrics(start_date, end_date),
        'provider_participation': Provider.get_participation_metrics(start_date, end_date)
    }

def get_impact_trends(timeframe):
    """Get impact trends over time"""
    return {
        'waste_reduction': FoodListing.get_waste_reduction_trend(timeframe),
        'carbon_savings': FoodListing.get_carbon_savings_trend(timeframe),
        'water_savings': FoodListing.get_water_savings_trend(timeframe),
        'social_impact': Reservation.get_social_impact_trend(timeframe)
    } 