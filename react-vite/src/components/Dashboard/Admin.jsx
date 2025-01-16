import React, { useState, useEffect } from 'react';
import './Admin.css';
import { useSelector } from 'react-redux';

const Admin = () => {
    const [version] = useState('0.2.16');
    const [foodListings, setFoodListings] = useState([]);
    const [analytics, setAnalytics] = useState({
        totalDonations: 0,
        activeProviders: 0,
        activeRecipients: 0
    });
    
    const sessionUser = useSelector(state => state.session.user);

    useEffect(() => {
        // Fetch food listings and analytics data
        // This will be implemented with actual API calls
    }, []);

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <div className="admin-profile">
                    <img src={sessionUser?.profile_image || '/default-avatar.png'} alt="Admin" />
                    <div className="admin-info">
                        <h2>Admin</h2>
                        <span className="version">v{version}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-cards">
                <div className="card food-listings">
                    <h3>Available Food Listings</h3>
                    <div className="metrics">
                        <div className="metric">
                            <span className="value">{analytics.totalDonations}</span>
                            <span className="label">Total Donations</span>
                        </div>
                        <div className="chart">
                            {/* Placeholder for chart component */}
                        </div>
                    </div>
                    <div className="actions">
                        <button className="add-btn">Add</button>
                        <button className="refresh-btn">Refresh</button>
                    </div>
                </div>

                <div className="card analytics">
                    <h3>User Analytics</h3>
                    <div className="stats">
                        <div className="stat">
                            <span className="value">{analytics.activeProviders}</span>
                            <span className="label">Active Providers</span>
                        </div>
                        <div className="stat">
                            <span className="value">{analytics.activeRecipients}</span>
                            <span className="label">Active Recipients</span>
                        </div>
                    </div>
                </div>

                <div className="card notifications">
                    <h3>System Notifications</h3>
                    <div className="notification-list">
                        {/* Notification items will be mapped here */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
