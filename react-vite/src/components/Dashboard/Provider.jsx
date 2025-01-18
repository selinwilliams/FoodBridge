import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { thunkGetProviderById } from '../../redux/provider';
import { thunkGetProviderListings } from '../../redux/foodListing';
import { useModal } from '../../context/Modal';
import CreateFoodListingModal from '../FoodListing/CreateFoodListingModal'
import './Provider.css';
import EditListingModal from '../FoodListing/EditListingModal';
import DeleteListingModal from '../FoodListing/DeleteListingModal';

const Provider = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [dataLoaded, setDataLoaded] = useState(false);
    const { setModalContent, closeModal } = useModal();
    const sessionUser = useSelector(state => state.session.user);
    const currentProvider = useSelector(state => state.providers.currentProvider);
    const providerListings = useSelector(state => state.foodListings.listings);
    const [isLoading, setIsLoading] = useState(true);

    // First useEffect - Always runs
    useEffect(() => {
        const loadData = async () => {
            if (sessionUser?.id) {
                try {
                    const provider = await dispatch(thunkGetProviderById(sessionUser.id));
                  
                    
                    if (provider?.id) {
                        const listings = await dispatch(thunkGetProviderListings(provider.id));
                    }
                } catch (error) {
                    console.error('Error loading data:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        loadData();
    }, [dispatch, sessionUser]);



    if (isLoading) {
        return (
            <div className="provider-dashboard">
                <div className="loading-state">
                    <p>Loading provider data...</p>
                </div>
            </div>
        );
    }
 // Calculate metrics
 const metrics = {
    total: providerListings.length,
    pending: providerListings.filter(listing => listing.status === 'pending').length,
    completed: providerListings.filter(listing => listing.status === 'completed').length
};

// Add this check
const handleAddListing = () => {
    setModalContent(<CreateFoodListingModal />);
};
    if (!currentProvider) {
        return (
            <div className="provider-dashboard">
                <div className="no-provider-state">
                    <p>No provider profile found. Please create one first.</p>
                </div>
            </div>
        );
    }

    const handleEdit = (listing) => {
        setModalContent(
            <EditListingModal 
            listing={listing}
            onSuccess={() => {
                closeModal();
                if (currentProvider?.id) {
                    dispatch(thunkGetProviderListings(currentProvider.id));
                }
            }}
            />
        );
    };

    const handleDelete = (listing) => {
        setModalContent(
            <DeleteListingModal listing={listing} />
        )
    }
    
    return (
        <div className="provider-dashboard">
            <div className="dashboard-header">
                <h1>Welcome, {currentProvider.business_name}!</h1>
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
                        <button 
                            className="add-btn" 
                            onClick={handleAddListing}
                        >
                            Add Listing
                        </button>
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

            <div className="listings-section">
                <h2>Your Listings</h2>
                {Array.isArray(providerListings) && providerListings.length > 0 ? (
                    <div className="food-grid">
                        {providerListings.map(listing => (
                            <div key={listing.id} className="food-card">
                                <div className="food-card-content">
                                    <div className="food-info">
                                        <h3>{listing.title}</h3>
                                        <p>{listing.description}</p>
                                        <div className="listing-details">
                                            <span>Quantity: {listing.quantity} {listing.unit}</span>
                                            <span>Status: {listing.status}</span>
                                            <span>Type: {listing.food_type}</span>
                                            <span>Expires: {new Date(listing.expiration_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="listing-actions">
                                    <button className="edit-btn" onClick={() => handleEdit(listing)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(listing)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-listings">
                        <p>No listings found. Create your first listing!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Provider;
