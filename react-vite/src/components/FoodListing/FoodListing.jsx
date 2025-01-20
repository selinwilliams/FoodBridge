import React, { useState, useEffect } from 'react';
import './FoodListing.css';

const FoodListing = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [foodItems] = useState([
        {
            id: 1,
            category: 'Fruits',
            title: 'Fresh Fruits Bundle',
            price: 1.20,
            originalPrice: 2.00,
            image: '/fruits-bundle.png',
            description: 'A variety of fresh seasonal fruits',
            quantity: '2 kg',
            expiryDate: '2024-04-10'
        },
        {
            id: 2,
            category: 'Fruits',
            title: 'Citrus Mix',
            price: 1.90,
            originalPrice: 3.50,
            image: '/citrus-mix.png',
            description: 'Fresh oranges, lemons, and grapefruits',
            quantity: '1.5 kg',
            expiryDate: '2024-04-08'
        },
        {
            id: 3,
            category: 'Vegetables',
            title: 'Fresh Vegetables',
            price: 1.90,
            originalPrice: 3.50,
            image: '/vegetables.png',
            description: 'Assorted fresh vegetables',
            quantity: '2.5 kg',
            expiryDate: '2024-04-07'
        },
        {
            id: 4,
            category: 'Vegetables',
            title: 'Garden Mix',
            price: 1.20,
            originalPrice: 2.50,
            image: '/garden-mix.png',
            description: 'Fresh garden vegetables mix',
            quantity: '2 kg',
            expiryDate: '2024-04-09'
        },
        {
            id: 5,
            category: 'Snacks',
            title: 'Healthy Snacks',
            price: 2.90,
            originalPrice: 5.00,
            image: '/snacks.png',
            description: 'Nutritious snack selection',
            quantity: '500g',
            expiryDate: '2024-04-15'
        },
        {
            id: 6,
            category: 'Snacks',
            title: 'Mixed Snacks',
            price: 2.90,
            originalPrice: 5.00,
            image: '/mixed-snacks.png',
            description: 'Variety of healthy snacks',
            quantity: '750g',
            expiryDate: '2024-04-12'
        }
    ]);

    const [filteredItems, setFilteredItems] = useState(foodItems);

    useEffect(() => {
        if (activeFilter === 'All') {
            setFilteredItems(foodItems);
        } else {
            setFilteredItems(foodItems.filter(item => item.category === activeFilter));
        }
    }, [activeFilter, foodItems]);

    const handleFilterClick = (category) => {
        setActiveFilter(category);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="food-listing-page">
            <div className="food-listing-header">
                <h1>Available Food</h1>
                <div className="filters">
                    <button 
                        className={`filter-btn ${activeFilter === 'All' ? 'active' : ''}`}
                        onClick={() => handleFilterClick('All')}
                    >
                        All
                    </button>
                    <button 
                        className={`filter-btn ${activeFilter === 'Fruits' ? 'active' : ''}`}
                        onClick={() => handleFilterClick('Fruits')}
                    >
                        Fruits
                    </button>
                    <button 
                        className={`filter-btn ${activeFilter === 'Vegetables' ? 'active' : ''}`}
                        onClick={() => handleFilterClick('Vegetables')}
                    >
                        Vegetables
                    </button>
                    <button 
                        className={`filter-btn ${activeFilter === 'Snacks' ? 'active' : ''}`}
                        onClick={() => handleFilterClick('Snacks')}
                    >
                        Snacks
                    </button>
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
                                <span className="category-tag">{item.category}</span>
                                <h3>{item.title}</h3>
                                <p className="description">{item.description}</p>
                                <div className="details">
                                    <span className="quantity">Quantity: {item.quantity}</span>
                                    <span className="expiry">Expires: {formatDate(item.expiryDate)}</span>
                                </div>
                                <div className="price-info">
                                    <span className="current-price">${item.price.toFixed(2)}</span>
                                    <span className="original-price">${item.originalPrice.toFixed(2)}</span>
                                    <span className="discount">
                                        {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                                    </span>
                                </div>
                            </div>
                            <div className="food-image">
                                <img src={item.image} alt={item.title} />
                            </div>
                        </div>
                        <button className="add-to-cart-btn">
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
