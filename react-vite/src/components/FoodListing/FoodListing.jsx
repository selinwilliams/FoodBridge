import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { thunkLoadListings } from '../../redux/foodListing';
import './FoodListing.css';

const FILTERS = {
    ALL: 'All Listings',
    AVAILABLE: 'Available',
    EXPIRING_SOON: 'Expiring Soon',
    HIGH_CAPACITY: 'High Capacity',
    NEARBY: 'Nearby'
};

const DEFAULT_IMAGES = {
    PRODUCE: '/veggie.jpg',
    DAIRY: '/milk.avif',
    BAKERY: '/past.jpg',
    MEAT: '/chicken.jpg',
    PANTRY: '/canned.jpg',
    PREPARED: '/meal-box.jpg',
    OTHER: '/snck.jpg'
};

const FoodListing = () => {
    const dispatch = useDispatch();
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [showComingSoon, setShowComingSoon] = useState(false);
    const foodListings = useSelector(state => state.foodListings.listings);
    const isLoading = useSelector(state => state.foodListings.isLoading);
    const error = useSelector(state => state.foodListings.error);
    const [filteredItems, setFilteredItems] = useState([]);

    useEffect(() => {
        dispatch(thunkLoadListings());
    }, [dispatch]);

    useEffect(() => {
        if (!foodListings) return;

        switch (activeFilter) {
            case 'AVAILABLE':
                setFilteredItems(foodListings.filter(item => item.status === 'AVAILABLE'));
                break;
            case 'EXPIRING_SOON':
                const threeDaysFromNow = new Date();
                threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
                setFilteredItems(foodListings.filter(item => 
                    new Date(item.expiration_date) <= threeDaysFromNow && 
                    item.status === 'AVAILABLE'
                ));
                break;
            case 'HIGH_CAPACITY':
                setFilteredItems(foodListings.filter(item => 
                    item.quantity >= 50 && 
                    item.status === 'AVAILABLE'
                ));
                break;
            case 'NEARBY':
                // For now, show all available items
                // TODO: Implement distance-based filtering when location features are added
                setFilteredItems(foodListings.filter(item => item.status === 'AVAILABLE'));
                break;
            default:
                setFilteredItems(foodListings);
        }
    }, [activeFilter, foodListings]);

    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDefaultImage = (foodType) => {
        return DEFAULT_IMAGES[foodType] || '/default-food.jpg';
    };

    const handleRequestClick = () => {
        setShowComingSoon(true);
        setTimeout(() => setShowComingSoon(false), 3000); // Hide after 3 seconds
    };

    if (isLoading) {
        return (
            <div className="food-listing-page">
                <div className="loading">Loading food listings...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="food-listing-page">
                <div className="error">Error loading food listings: {error.message || 'Unknown error'}</div>
            </div>
        );
    }

    return (
        <div className="food-listing-page">
            {showComingSoon && (
                <div className="coming-soon-modal">
                    <div className="coming-soon-content">
                        <h2>Coming Soon!</h2>
                        <p>Request feature will be available in the next update.</p>
                    </div>
                </div>
            )}
            
            <div className="food-listing-header">
                <h1>Available Food Listings</h1>
                <div className="filters">
                    {Object.entries(FILTERS).map(([key, label]) => (
                        <button
                            key={key}
                            className={`filter-btn ${activeFilter === key ? 'active' : ''}`}
                            onClick={() => handleFilterClick(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="food-grid">
                {filteredItems.map(item => (
                    <div 
                        key={item.id} 
                        className="food-card"
                    >
                        <div className="food-card-content">
                            <div className="food-info">
                                <span className="category-tag">{item.food_type}</span>
                                <h3>{item.title}</h3>
                                <p className="description">{item.description}</p>
                                <div className="details">
                                    <span className="quantity">Quantity: {item.quantity} {item.unit}</span>
                                    <span className="expiry">Expires: {formatDate(item.expiration_date)}</span>
                                </div>
                                <div className="pickup-window">
                                    <p>Pickup Window:</p>
                                    <span>{formatDate(item.pickup_window_start)} - {formatDate(item.pickup_window_end)}</span>
                                </div>
                            </div>
                            <div className="food-image">
                                <img 
                                    src={item.image_url || getDefaultImage(item.food_type)} 
                                    alt={item.title} 
                                    onError={(e) => {
                                        e.target.src = getDefaultImage(item.food_type);
                                    }}
                                />
                            </div>
                        </div>
                        <button className="request-btn" onClick={handleRequestClick}>
                            Request Item
                        </button>
                    </div>
                ))}
            </div>

            <div className="food-listing-footer">
                <div className="pagination">
                    <button className="page-btn">Previous</button>
                    <span className="page-number active">1</span>
                    <span className="page-number">2</span>
                    <span className="page-number">3</span>
                    <button className="page-btn">Next</button>
                </div>
            </div>
        </div>
    );
};

export default FoodListing;
