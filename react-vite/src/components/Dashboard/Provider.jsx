import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { thunkGetProviderById, thunkGetProviderListings } from '../../redux/provider';
import './Provider.css';

const Provider = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [dataLoaded, setDataLoaded] = useState(false);
    
    const sessionUser = useSelector(state => state.session.user);
    const providerState = useSelector(state => state.provider || {});
    const { currentProvider, providerListings = [], errors, isLoading } = providerState;

    const [version] = useState('2.8.38');

    // Initial data load
    useEffect(() => {
        const loadInitialData = async () => {
            if (!sessionUser?.id) return;

            try {
                const providerData = await dispatch(thunkGetProviderById(sessionUser.id));
                if (providerData?.id) {
                    await dispatch(thunkGetProviderListings(providerData.id));
                }
            } catch (error) {
                console.error('Error loading provider data:', error);
            } finally {
                setDataLoaded(true);
            }
        };

        loadInitialData();
    }, [dispatch, sessionUser]);

    // Calculate metrics
    const metrics = {
        total: providerListings.length,
        pending: providerListings.filter(listing => listing.status === 'pending').length,
        completed: providerListings.filter(listing => listing.status === 'completed').length
    };

    return (
        <div className="provider-dashboard">
            <div className="provider-header">
                <div className="provider-profile">
                    <img 
                        src={currentProvider?.profile_image || '/prvrd.png'}
                        alt={currentProvider?.business_name || 'Provider'}
                        className="profile-image"
                    />
                    <div className="provider-info">
                        <h2>Welcome, {currentProvider?.business_name || 'Provider'}</h2>
                        <span className="version">v{version}</span>
                    </div>
                </div>
                <Link to="/provider/profile" className="edit-profile-btn">
                    Edit Profile
                </Link>
            </div>

            <div className="dashboard-cards">
                <div className="card food-donations">
                    <h3>Food Donations</h3>
                    <div className="metrics">
                        <div className="metric">
                            <span className="value">{metrics.total || 0}</span>
                            <span className="label">Total Listings</span>
                        </div>
                        <div className="metric">
                            <span className="value">{metrics.pending || 0}</span>
                            <span className="label">Pending</span>
                        </div>
                        <div className="metric">
                            <span className="value">{metrics.completed || 0}</span>
                            <span className="label">Completed</span>
                        </div>
                    </div>
                    <div className="actions">
                        <button className="add-btn">Add</button>
                        <button className="purge-btn">Purge</button>
                    </div>
                </div>

                <div className="card deductions">
                    <h3>Tax Deductions</h3>
                    <div className="metrics">
                        <div className="metric">
                            <span className="value">${(metrics.completed * 25).toFixed(2)}</span>
                            <span className="label">Total Deductions</span>
                        </div>
                    </div>
                </div>

                <div className="card donation-history">
                    <h3>Donation History</h3>
                    <div className="history-list">
                        {providerListings.length > 0 ? (
                            providerListings.map((listing, index) => (
                                <div key={index} className="history-item">
                                    <div className="history-info">
                                        <span className="history-title">{listing.title || 'Food Donation'}</span>
                                        <span className="history-date">{new Date(listing.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`history-status ${listing.status}`}>
                                        {listing.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="no-history">
                                <p>No donation history yet</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card analytics">
                    <h3>Monthly Analytics</h3>
                    <div className="chart-container">
                        <div className="bar-chart">
                            {[...Array(7)].map((_, i) => (
                                <div key={i} className="bar-wrapper">
                                    <div 
                                        className="bar" 
                                        style={{ height: `${Math.random() * 100}%` }}
                                    />
                                    <span className="bar-label">Month {i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card deduction-details">
                    <h3>Deduction Breakdown</h3>
                    <div className="deduction-info">
                        <div className="deduction-amount">
                            <span className="value">${(metrics.completed * 25).toFixed(2)}</span>
                            <span className="label">Total Deductions</span>
                        </div>
                        <div className="chart">
                            <span className="percentage">
                                {metrics.completed ? ((metrics.completed / metrics.total) * 100).toFixed(0) : 0}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="card user-analytics">
                    <h3>User Analytics</h3>
                    <div className="metrics">
                        <div className="metric">
                            <span className="value">
                                {providerListings.filter(l => l.status === 'claimed').length}
                            </span>
                            <span className="label">Claimed Items</span>
                        </div>
                        <div className="metric">
                            <span className="value">
                                {providerListings.filter(l => l.status === 'expired').length}
                            </span>
                            <span className="label">Expired Items</span>
                        </div>
                    </div>
                </div>

                <div className="card notifications">
                    <h3>System Notifications</h3>
                    <div className="notification-list">
                        <div className="notification">
                            <span className="icon">🔔</span>
                            <span className="message">Welcome to your provider dashboard!</span>
                        </div>
                        <div className="notification">
                            <span className="icon">📊</span>
                            <span className="message">Your monthly analytics are ready.</span>
                        </div>
                        <div className="notification">
                            <span className="icon">📦</span>
                            <span className="message">New donation features available!</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Provider;
