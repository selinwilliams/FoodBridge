import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { thunkGetProviderById, thunkGetProviderListings } from '../../redux/provider';
import './Provider.css';

const Provider = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [dataLoaded, setDataLoaded] = useState(false);
    
    // Get data from Redux store with safe defaults
    const sessionUser = useSelector(state => state.session.user);
    const providerState = useSelector(state => state.provider || {});
    const { currentProvider, providerListings = [], errors, isLoading } = providerState;

    const [version] = useState('2.8.38');

    // Debug log to check session state
    useEffect(() => {
        console.log('Session User:', sessionUser);
        console.log('User Type:', sessionUser?.user_type);
    }, [sessionUser]);

    // Initial data load
    useEffect(() => {
        const loadInitialData = async () => {
            if (!sessionUser?.id) return;

            try {
                const provider = await dispatch(thunkGetProviderById(sessionUser.id));
                
                // Only fetch listings if we have a provider
                if (provider?.id) {
                    await dispatch(thunkGetProviderListings(provider.id));
                }
            } finally {
                setDataLoaded(true);
            }
        };

        if (sessionUser?.user_type === 'PROVIDER') {
            loadInitialData();
        }
    }, [dispatch, sessionUser]);

    // Loading state while session is being initialized
    if (!sessionUser && !dataLoaded) {
        return (
            <div className="loading-state">
                <div className="loading-spinner">Loading session...</div>
            </div>
        );
    }

    // Early returns for all edge cases
    if (!sessionUser) {
        return (
            <div className="error-state">
                <h2>Access Denied</h2>
                <p>Please log in to access the provider dashboard.</p>
                <Link to="/login" className="retry-btn">Log In</Link>
            </div>
        );
    }

    if (sessionUser.user_type !== 'PROVIDER') {
        return (
            <div className="error-state">
                <h2>Access Denied</h2>
                <p>This dashboard is only accessible to providers. Current type: {sessionUser.user_type}</p>
                <Link to="/dashboard" className="retry-btn">Go to Dashboard</Link>
            </div>
        );
    }

    if (isLoading || !dataLoaded) {
        return (
            <div className="loading-state">
                <div className="loading-spinner">Loading your dashboard...</div>
            </div>
        );
    }

    if (errors) {
        return (
            <div className="error-state">
                <h2>Something went wrong</h2>
                <p>{errors}</p>
                <button onClick={() => window.location.reload()} className="retry-btn">
                    Try Again
                </button>
            </div>
        );
    }

    // Show setup state if user doesn't have a provider profile
    if (!currentProvider) {
        return (
            <div className="setup-state">
                <h2>Welcome to FoodBridge</h2>
                <p>Complete your provider profile to start managing donations.</p>
                <Link to="/provider/profile" className="setup-btn">
                    Complete Profile Setup
                </Link>
            </div>
        );
    }

    // At this point, we're sure we have a currentProvider
    const {
        profile_image = '/default-avatar.png',
        name = 'Provider'
    } = currentProvider;

    // Calculate metrics
    const metrics = {
        total: providerListings.length,
        pending: providerListings.filter(listing => listing.status === 'pending').length,
        completed: providerListings.filter(listing => listing.status === 'completed').length
    };

    // Calculate deductions
    const deductions = providerListings
        .filter(listing => listing.status === 'completed')
        .reduce((total, listing) => total + (listing.value || 0), 0);

    return (
        <div className="provider-dashboard">
            <div className="provider-header">
                <div className="provider-profile">
                    <img 
                        src={profile_image}
                        alt={name}
                        className="profile-image"
                    />
                    <div className="provider-info">
                        <h2>Welcome, {name}</h2>
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
                            <span className="value">{metrics.total}</span>
                            <span className="label">Total Donations</span>
                        </div>
                        <div className="metric">
                            <span className="value">{metrics.pending}</span>
                            <span className="label">Pending</span>
                        </div>
                        <div className="metric">
                            <span className="value">{metrics.completed}</span>
                            <span className="label">Completed</span>
                        </div>
                    </div>
                    <div className="actions">
                        <Link to="/listings/new" className="add-btn">Add Donation</Link>
                    </div>
                </div>

                <div className="card deductions">
                    <h3>Tax Deductions</h3>
                    <div className="deduction-info">
                        <div className="deduction-amount">
                            <span className="value">${deductions.toLocaleString()}</span>
                            <span className="label">Total Deductions</span>
                        </div>
                        <div className="chart">
                            {/* Placeholder for deductions chart */}
                        </div>
                    </div>
                    <div className="actions">
                        <Link to="/deductions" className="add-btn">View Details</Link>
                    </div>
                </div>

                <div className="card donation-history">
                    <h3>Recent Donations</h3>
                    <div className="history-list">
                        {providerListings.length > 0 ? (
                            providerListings.slice(0, 5).map((listing) => (
                                <div key={listing.id} className="history-item">
                                    <div className="history-info">
                                        <span className="history-title">{listing.title}</span>
                                        <span className="history-date">
                                            {new Date(listing.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className={`history-status ${listing.status}`}>
                                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="no-history">
                                <p>No donations yet. Start by adding your first donation!</p>
                            </div>
                        )}
                    </div>
                    <div className="actions">
                        <Link to="/listings" className="add-btn">View All History</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Provider;
