import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { thunkGetProviderByUserId } from '../../redux/provider';
import { thunkGetProviderListings } from '../../redux/foodListing';
import { useModal } from '../../context/Modal';
import CreateFoodListingModal from '../FoodListing/CreateFoodListingModal'
import './Provider.css';
import EditListingModal from '../FoodListing/EditListingModal';
import DeleteListingModal from '../FoodListing/DeleteListingModal';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Provider = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [dataLoaded, setDataLoaded] = useState(false);
    const { setModalContent, closeModal } = useModal();
    const sessionUser = useSelector(state => state.session.user);
    const currentProvider = useSelector(state => state.providers.currentProvider);
    const providerListings = useSelector(state => state.foodListings.listings);
    const [isLoading, setIsLoading] = useState(true);

    // Chart configuration
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    color: '#F0EBCE',
                    font: {
                        family: '"Times New Roman", serif',
                        size: 12
                    },
                    usePointStyle: true,
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(78, 108, 80, 0.9)',
                titleColor: '#F0EBCE',
                bodyColor: '#F0EBCE',
                borderColor: '#AA8B56',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                titleFont: {
                    family: '"Times New Roman", serif',
                    size: 14
                },
                bodyFont: {
                    family: '"Times New Roman", serif',
                    size: 13
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(240, 235, 206, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: '#F0EBCE',
                    font: {
                        family: '"Times New Roman", serif',
                        size: 12
                    },
                    padding: 10
                },
                border: {
                    display: false
                }
            },
            x: {
                grid: {
                    color: 'rgba(240, 235, 206, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    color: '#F0EBCE',
                    font: {
                        family: '"Times New Roman", serif',
                        size: 12
                    },
                    padding: 10
                },
                border: {
                    display: false
                }
            }
        },
        elements: {
            line: {
                tension: 0.4,
                borderWidth: 2,
                fill: false
            },
            point: {
                radius: 4,
                borderWidth: 2,
                hoverRadius: 6
            }
        }
    };

    const chartData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'Donations',
                data: [12, 19, 3, 5, 2, 3, 7],
                borderColor: '#AA8B56',
                backgroundColor: '#AA8B56',
                pointBackgroundColor: '#F0EBCE',
                pointBorderColor: '#AA8B56'
            },
            {
                label: 'Claims',
                data: [8, 15, 2, 3, 1, 2, 5],
                borderColor: '#F0EBCE',
                backgroundColor: '#F0EBCE',
                pointBackgroundColor: '#F0EBCE',
                pointBorderColor: '#F0EBCE'
            }
        ]
    };

    // First useEffect - Always runs
    useEffect(() => {
        const loadData = async () => {
            if (sessionUser?.id) {
                try {
                    console.log('Session User:', sessionUser);
                    const provider = await dispatch(thunkGetProviderByUserId(sessionUser.id));
                    console.log('Provider Response:', provider);
                    
                    if (provider?.id) {
                        const listings = await dispatch(thunkGetProviderListings(provider.id));
                        console.log('Listings Response:', listings);
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
        navigate('/provider/profile');
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
                <div className="profile-section">
                    <img 
                        src={currentProvider.image_url || "/prvd.png"} 
                        alt="Profile" 
                        className="profile-image" 
                    />
                    <div className="profile-info">
                        <h2>Provider</h2>
                        <div className="profile-status">
                            <span className="status-dot"></span>
                            <span className="status-text">Online</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="card food-donations">
                    <div className="header-actions">
                        <h3>Food Donations</h3>
                        <button className="add-btn" onClick={handleAddListing}>
                            Add Listing
                        </button>
                    </div>
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
                        <div className="metric">
                            <span className="value">${(metrics.completed * 25).toFixed(2)}</span>
                            <span className="label">Deductions</span>
                        </div>
                    </div>
                </div>

                <div className="card food-listings">
                    <h3>Your Listings</h3>
                    <div className="listings-scroll">
                        {Array.isArray(providerListings) && providerListings.length > 0 ? (
                            providerListings.map(listing => (
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
                            ))
                        ) : (
                            <div className="no-listings">
                                <p>No listings found. Create your first listing!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card analytics">
                    <h3>Monthly Analytics</h3>
                    <div className="chart-container">
                        <Line options={chartOptions} data={chartData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Provider;
