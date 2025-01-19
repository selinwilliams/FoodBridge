import React, { useState } from 'react';
import './FoodListing.css';

const FoodListing = () => {
    const [foodItems] = useState([
        {
            id: 1,
            category: 'Fruits',
            title: 'Fresh Fruits Bundle',
            price: 1.20,
            originalPrice: 2.00,
            image: '/fruits-bundle.png',
            backgroundColor: '#e8f5e9'
        },
        {
            id: 2,
            category: 'Fruits',
            title: 'Citrus Mix',
            price: 1.90,
            originalPrice: 3.50,
            image: '/citrus-mix.png',
            backgroundColor: '#b2dfdb'
        },
        {
            id: 3,
            category: 'Vegetables',
            title: 'Fresh Vegetables',
            price: 1.90,
            originalPrice: 3.50,
            image: '/vegetables.png',
            backgroundColor: '#ffcdd2'
        },
        {
            id: 4,
            category: 'Vegetables',
            title: 'Garden Mix',
            price: 1.20,
            originalPrice: 2.50,
            image: '/garden-mix.png',
            backgroundColor: '#c8e6c9'
        },
        {
            id: 5,
            category: 'Snacks',
            title: 'Healthy Snacks',
            price: 2.90,
            originalPrice: 5.00,
            image: '/snacks.png',
            backgroundColor: '#ffcdd2'
        },
        {
            id: 6,
            category: 'Snacks',
            title: 'Mixed Snacks',
            price: 2.90,
            originalPrice: 5.00,
            image: '/mixed-snacks.png',
            backgroundColor: '#ffe0b2'
        }
    ]);

    return (
        <div className="food-listing-page">
            <div className="food-listing-header">
                <h1>Food Listings</h1>
                <div className="filters">
                    <button className="filter-btn active">All</button>
                    <button className="filter-btn">Fruits</button>
                    <button className="filter-btn">Vegetables</button>
                    <button className="filter-btn">Snacks</button>
                    <button className="filter-btn">Beverages</button>
                </div>
            </div>

            <div className="food-grid">
                {foodItems.map(item => (
                    <div 
                        key={item.id} 
                        className="food-card"
                        style={{ backgroundColor: item.backgroundColor }}
                    >
                        <div className="food-card-content">
                            <div className="food-info">
                                <h3>{item.category}</h3>
                                <div className="price-info">
                                    <span className="current-price">${item.price.toFixed(2)}</span>
                                    <span className="original-price">${item.originalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="food-image">
                                <img src={item.image} alt={item.title} />
                            </div>
                        </div>
                        <button className="add-to-cart-btn">Add to Cart</button>
                    </div>
                ))}
            </div>

            <div className="food-listing-footer">
                <div className="pagination">
                    <button className="page-btn">Previous</button>
                    <span className="page-number">1</span>
                    <span className="page-number active">2</span>
                    <span className="page-number">3</span>
                    <button className="page-btn">Next</button>
                </div>
            </div>
        </div>
    );
};

export default FoodListing;
