import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { thunkGetCenters, thunkDeleteCenter } from '../../redux/distributionCenter';
import { useModal } from '../../context/Modal';
import CreateDistributionCenterModal from '../DistributionCenters/CreateDistributionCenterModal';
import EditDistributionCenterModal from '../DistributionCenters/EditDistributionCenterModal';
import './Admin.css';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const Admin = () => {
    const dispatch = useDispatch();
    const { setModalContent } = useModal();
    const sessionUser = useSelector(state => state.session.user);
    const centers = useSelector(state => Object.values(state.distributionCenters?.allCenters || {}));
    
    const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png';
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        providers: 0,
        recipients: 0,
        activeListings: 0,
        totalListings: 0
    });

    // Load centers and statistics
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [centersResponse, statsResponse] = await Promise.all([
                    dispatch(thunkGetCenters()),
                    fetch('/api/admin/statistics')
                ]);
                
                if (centersResponse?.errors) {
                    setError(centersResponse.errors);
                }

                const statsData = await statsResponse.json();
                setStats({
                    providers: statsData.provider_stats?.total_providers || 0,
                    recipients: statsData.user_stats?.total_recipients || 0,
                    activeListings: statsData.listing_stats?.active_listings || 0,
                    totalListings: statsData.listing_stats?.total_listings || 0
                });
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [dispatch]);

    // Chart data
    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                fill: true,
                label: 'User Activity',
                data: [65, 85, 70, 95, 82, 90],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    // Handle delete center
    const handleDeleteCenter = async (centerId) => {
        try {
            if (window.confirm('Are you sure you want to delete this center?')) {
                setIsLoading(true);
                const response = await dispatch(thunkDeleteCenter(centerId));
                if (response?.errors) {
                    setError(response.errors);
                }
            }
        } catch (err) {
            console.error('Error deleting center:', err);
            setError('Failed to delete center');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <div className="admin-profile">
                    <img 
                        src={sessionUser?.profile_image || defaultAvatar} 
                        alt="Admin Profile"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultAvatar;
                        }}
                    />
                    <div className="admin-info">
                        <h2>Admin</h2>
                        <span className="version">v 0.2.18</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-cards">
                {/* User Statistics Card */}
                <div className="card user-stats">
                    <h3>User Statistics</h3>
                    <div className="metrics">
                        <div className="metric">
                            <span className="value">{stats.providers}</span>
                            <span className="label">Providers</span>
                        </div>
                        <div className="metric">
                            <span className="value">{stats.recipients}</span>
                            <span className="label">Recipients</span>
                        </div>
                    </div>
                </div>

                {/* Food Listings Card */}
                <div className="card food-listings">
                    <h3>Food Listings</h3>
                    <div className="metrics">
                        <div className="metric">
                            <span className="value">{stats.activeListings}</span>
                            <span className="label">Active</span>
                        </div>
                        <div className="metric">
                            <span className="value">{stats.totalListings}</span>
                            <span className="label">Total</span>
                        </div>
                    </div>
                </div>

                {/* Distribution Centers Card */}
                <div className="card distribution-centers">
                    <h3>Distribution Centers ({centers.length})</h3>
                    
                    {isLoading ? (
                        <div className="loading">
                            <div className="loading-spinner"></div>
                            <p>Loading centers...</p>
                        </div>
                    ) : error ? (
                        <div className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            <p>{error}</p>
                        </div>
                    ) : (
                        <>
                            <div className="centers-list">
                                {centers.map(center => (
                                    <div key={center.id} className="center-item">
                                        <div className="center-info">
                                            <h4>{center.name}</h4>
                                            <div className="center-details">
                                                <p>{center.address}</p>
                                                <span className={`status ${center.status?.toLowerCase()}`}>
                                                    {center.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="center-actions">
                                            <button 
                                                className="action-btn edit"
                                                onClick={() => setModalContent(
                                                    <EditDistributionCenterModal center={center} />
                                                )}
                                                disabled={isLoading}
                                            >
                                                <i className="fas fa-edit"></i>
                                                Edit
                                            </button>
                                            <button 
                                                className="action-btn delete"
                                                onClick={() => handleDeleteCenter(center.id)}
                                                disabled={isLoading}
                                            >
                                                <i className="fas fa-trash"></i>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="centers-actions">
                                <button 
                                    className="action-btn add"
                                    onClick={() => setModalContent(
                                        <CreateDistributionCenterModal />
                                    )}
                                    disabled={isLoading}
                                >
                                    <i className="fas fa-plus"></i>
                                    Add New Center
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* User Analytics Card */}
                <div className="card analytics">
                    <h3>User Analytics</h3>
                    <div className="chart-container">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
