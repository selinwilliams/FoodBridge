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
                labels: {
                    color: '#F0EBCE'
                }
            },
            title: {
                display: false
            }
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(240, 235, 206, 0.1)'
                },
                ticks: {
                    color: '#F0EBCE'
                }
            },
            x: {
                grid: {
                    color: 'rgba(240, 235, 206, 0.1)'
                },
                ticks: {
                    color: '#F0EBCE'
                }
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
                tension: 0.4
            },
            {
                label: 'Claims',
                data: [8, 15, 2, 3, 1, 2, 5],
                borderColor: '#F0EBCE',
                backgroundColor: '#F0EBCE',
                tension: 0.4
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
            <div className="provider-container">
                <header className="provider-header">
                    <div className="provider-profile">
                        <img 
                            src={currentProvider.image_url || "/prvd.png"} 
                            alt="Profile" 
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/prvd.png";
                            }}
                        />
                        <h2>Provider Dashboard</h2>
                    </div>
                </header>

                <main className="dashboard-content">
                    <div className="top-cards">
                        <div className="dashboard-card">
                            <h3>Metrics</h3>
                            <div className="metrics-grid">
                                <div className="metric-item">
                                    <span className="metric-value">{metrics.total || 0}</span>
                                    <span className="metric-label">Total Listings</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-value">{metrics.pending || 0}</span>
                                    <span className="metric-label">Pending</span>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <h3>Activity</h3>
                            <div className="metrics-grid">
                                <div className="metric-item">
                                    <span className="metric-value">{metrics.completed || 0}</span>
                                    <span className="metric-label">Completed</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-value">${(metrics.completed * 25).toFixed(2)}</span>
                                    <span className="metric-label">Deductions</span>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <div className="listings-header">
                                <h3>Food Listings</h3>
                                <button className="add-btn" onClick={handleAddListing}>
                                    Add Listing
                                </button>
                            </div>
                            <div className="listings-scroll">
                                {Array.isArray(providerListings) && providerListings.length > 0 ? (
                                    providerListings.map(listing => (
                                        <div key={listing.id} className="food-card">
                                            <h4>{listing.title}</h4>
                                            <p>{listing.description}</p>
                                            <div className="food-actions">
                                                <button onClick={() => handleEdit(listing)}>Edit</button>
                                                <button onClick={() => handleDelete(listing)}>Delete</button>
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
                    </div>

                    <div className="analytics-card">
                        <h3>Monthly Analytics</h3>
                        <div className="chart-container">
                            <Line options={chartOptions} data={chartData} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Provider;
