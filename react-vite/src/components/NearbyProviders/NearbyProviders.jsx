import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { thunkGetNearbyProviders } from '../../redux/provider';
import './NearbyProviders.css';

const NearbyProviders = () => {
    const dispatch = useDispatch();
    const nearbyProviders = useSelector(state => state.provider.nearbyProviders);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setLoading(false);
                },
                (error) => {
                    setError('Unable to get your location. Please enable location services.');
                    setLoading(false);
                }
            );
        } else {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (location) {
            dispatch(thunkGetNearbyProviders(
                location.latitude,
                location.longitude,
                10 // 10 mile radius
            ));
        }
    }, [dispatch, location]);

    if (loading) {
        return <div className="loading">Loading nearby providers...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="nearby-providers">
            <h2>Nearby Food Providers</h2>
            
            <div className="providers-grid">
                {nearbyProviders.map(provider => (
                    <Link 
                        to={`/providers/${provider.id}`} 
                        key={provider.id} 
                        className="provider-card"
                    >
                        <div className="provider-image">
                            <img 
                                src={provider.profile_image || '/default-business.png'} 
                                alt={provider.name}
                            />
                        </div>
                        <div className="provider-info">
                            <h3>{provider.name}</h3>
                            <p className="provider-description">
                                {provider.description}
                            </p>
                            <div className="provider-details">
                                <span className="distance">
                                    {provider.distance.toFixed(1)} miles away
                                </span>
                                <span className="available-items">
                                    {provider.active_listings_count || 0} items available
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {nearbyProviders.length === 0 && (
                <div className="no-providers">
                    <p>No providers found in your area.</p>
                    <p>Try expanding your search radius or check back later.</p>
                </div>
            )}
        </div>
    );
};

export default NearbyProviders; 