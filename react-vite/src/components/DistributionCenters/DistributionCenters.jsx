import React, { useState } from 'react';
import './DistributionCenters.css';

const DistributionCenters = () => {
    const [centers] = useState([
        {
            id: 1,
            name: "Downtown Food Hub",
            address: "123 Main St, San Francisco, CA 94105",
            hours: "Mon-Fri: 9AM-6PM",
            status: "Open",
            capacity: "75%",
            contact: "(415) 555-0123",
            foodTypes: ["Produce", "Canned Goods", "Dairy"],
            image: "/center1.jpg"
        },
        {
            id: 2,
            name: "Mission District Center",
            address: "456 Valencia St, San Francisco, CA 94110",
            hours: "Mon-Sat: 8AM-8PM",
            status: "High Demand",
            capacity: "90%",
            contact: "(415) 555-0124",
            foodTypes: ["Fresh Produce", "Bread", "Meals"],
            image: "/center2.jpg"
        },
        {
            id: 3,
            name: "Sunset Community Hub",
            address: "789 Irving St, San Francisco, CA 94122",
            hours: "Tue-Sun: 10AM-7PM",
            status: "Available",
            capacity: "40%",
            contact: "(415) 555-0125",
            foodTypes: ["Pantry Items", "Fresh Produce"],
            image: "/center3.jpg"
        },
        {
            id: 4,
            name: "Richmond Food Center",
            address: "321 Clement St, San Francisco, CA 94118",
            hours: "Mon-Sun: 9AM-5PM",
            status: "Limited",
            capacity: "85%",
            contact: "(415) 555-0126",
            foodTypes: ["Meals", "Groceries"],
            image: "/center4.jpg"
        }
    ]);

    return (
        <div className="distribution-centers">
            <div className="centers-header">
                <h1>Distribution Centers</h1>
                <div className="search-filters">
                    <input 
                        type="text" 
                        placeholder="Search by location..."
                        className="search-input"
                    />
                    <div className="filter-buttons">
                        <button className="filter-btn active">All</button>
                        <button className="filter-btn">Open Now</button>
                        <button className="filter-btn">High Capacity</button>
                        <button className="filter-btn">Fresh Produce</button>
                    </div>
                </div>
            </div>

            <div className="centers-grid">
                {centers.map(center => (
                    <div key={center.id} className="center-card">
                        <div className="center-image">
                            <img src={center.image} alt={center.name} />
                            <div className={`status-badge ${center.status.toLowerCase().replace(' ', '-')}`}>
                                {center.status}
                            </div>
                        </div>
                        <div className="center-info">
                            <h3>{center.name}</h3>
                            <p className="address">{center.address}</p>
                            <div className="hours-capacity">
                                <span className="hours">{center.hours}</span>
                                <span className="capacity">
                                    Capacity: {center.capacity}
                                </span>
                            </div>
                            <div className="food-types">
                                {center.foodTypes.map((type, index) => (
                                    <span key={index} className="food-type-tag">
                                        {type}
                                    </span>
                                ))}
                            </div>
                            <div className="contact-info">
                                <i className="phone-icon"></i>
                                {center.contact}
                            </div>
                            <button className="view-details-btn">
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="centers-footer">
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

export default DistributionCenters; 