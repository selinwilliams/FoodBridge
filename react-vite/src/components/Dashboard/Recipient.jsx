import React, { useState, useEffect } from 'react';
import './Recipient.css';
import { useSelector, useDispatch } from 'react-redux';
import { thunkGetProviderById } from '../../redux/provider';
import { Link } from 'react-router-dom';

const Recipient = () => {
    const [version] = useState('0.2.16');
    const [foodListings, setFoodListings] = useState([]);
    const [allergyFilters, setAllergyFilters] = useState([
        { name: 'Peanuts', count: 3 },
        { name: 'Gluten', count: 5 },
        { name: 'Dairy', count: 4 }
    ]);
    const [isCheckingProvider, setIsCheckingProvider] = useState(true);
    const [isProvider, setIsProvider] = useState(false);
    
    const sessionUser = useSelector(state => state.session.user);
    const providerState = useSelector(state => state.provider || {});
    const { currentProvider } = providerState;
    const dispatch = useDispatch();

    useEffect(() => {
        // Fetch food listings and allergy filters
        // This will be implemented with actual API calls
    }, []);

    useEffect(() => {
        const checkProviderStatus = async () => {
            if (sessionUser?.id) {
                try {
                    const provider = await dispatch(thunkGetProviderById(sessionUser.id));
                    setIsProvider(!!provider);
                } catch (error) {
                    console.error('Error checking provider status:', error);
                } finally {
                    setIsCheckingProvider(false);
                }
            }
        };

        checkProviderStatus();
    }, [dispatch, sessionUser]);

    return (
        <div className="recipient-dashboard">
            <div className="recipient-header">
                <div className="recipient-profile">
                    <img src={sessionUser?.profile_image || '/recipient.jpg'} alt="Recipient" />
                    <div className="recipient-info">
                        <h2>Welcome, {sessionUser?.username || 'Recipient'}</h2>
                        <span className="version">v{version}</span>
                    </div>
                </div>
                {!isCheckingProvider && !isProvider && (
                    <>
                        <div className="provider-benefits">
                            <div className="benefits-content">
                                <h4>Would you like to become a provider?</h4>
                                <ul>
                                    <li>Receive tax deductions for your donations</li>
                                    <li>Make a meaningful impact in your community</li>
                                    <li>Reduce food waste and help the environment</li>
                                    <li>Increase your business visibility</li>
                                </ul>
                            </div>
                            <Link to="/provider/profile" className="become-provider-btn">
                                Become a Provider
                            </Link>
                        </div>
                    </>
                )}
            </div>

            <div className="dashboard-cards">
                <div className="card available-food">
                    <h3>Available Food Listings</h3>
                    <div className="food-stats">
                        <div className="stat-circle">
                            <div className="stat-content">
                                <span className="value">12</span>
                                <span className="label">Available</span>
                            </div>
                        </div>
                        <div className="listing-metrics">
                            <div className="metric">
                                <span className="value">8</span>
                                <span className="label">New Today</span>
                            </div>
                            <div className="metric">
                                <span className="value">4</span>
                                <span className="label">Expiring Soon</span>
                            </div>
                        </div>
                    </div>
                    <div className="actions">
                        <button className="view-btn">View All Listings</button>
                    </div>
                </div>

                <div className="card allergy-filters">
                    <h3>Food Listings for Allergies</h3>
                    <div className="filter-list">
                        {allergyFilters.map((filter, index) => (
                            <div key={index} className="filter-item">
                                <span className="filter-name">{filter.name}</span>
                                <span className="filter-count">{filter.count}</span>
                            </div>
                        ))}
                    </div>
                    <div className="actions">
                        <button className="add-btn">Add Filter</button>
                    </div>
                </div>

                <div className="card food-history">
                    <h3>Recent Food History</h3>
                    <div className="history-list">
                        <div className="filter-item">
                            <span className="filter-name">Fresh Vegetables</span>
                            <span className="filter-count">Today</span>
                        </div>
                        <div className="filter-item">
                            <span className="filter-name">Bread and Pastries</span>
                            <span className="filter-count">Yesterday</span>
                        </div>
                        <div className="filter-item">
                            <span className="filter-name">Canned Goods</span>
                            <span className="filter-count">3 days ago</span>
                        </div>
                    </div>
                    <div className="actions">
                        <button className="view-btn">View Full History</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Recipient;