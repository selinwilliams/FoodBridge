import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { thunkGetCenters, thunkDeleteCenter } from '../../redux/distributionCenter';
import { useModal } from '../../context/Modal';
import CreateDistributionCenterModal from '../DistributionCenters/CreateDistributionCenterModal';
import EditDistributionCenterModal from '../DistributionCenters/EditDistributionCenterModal';
import DeleteDistributionCenterModal from '../DistributionCenters/DeleteDistributionCenterModal';
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
    const { setModalContent, closeModal } = useModal();
    const sessionUser = useSelector(state => state.session.user);
    const centers = useSelector(state => Object.values(state.distributionCenters?.allCenters || {}));
    
    const defaultAvatar = '/admin.jpg';
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editError, setEditError] = useState(null);
    const [stats, setStats] = useState({
        providers: 0,
        recipients: 0,
        activeListings: 0,
        totalListings: 0
    });
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                fill: true,
                label: 'User Activity',
                data: [],
                borderColor: '#AA8B56',
                backgroundColor: 'rgba(170, 139, 86, 0.2)',
                tension: 0.4,
                borderWidth: 2,
            },
        ],
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState(null);

    // Clear errors when component unmounts or when starting new operations
    useEffect(() => {
        return () => {
            setError(null);
            setEditError(null);
        };
    }, []);

    // Load centers and statistics
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null); // Clear any previous errors
                const [centersResponse, statsResponse, activityResponse] = await Promise.all([
                    dispatch(thunkGetCenters()),
                    fetch('/api/admin/statistics'),
                    fetch('/api/admin/user-activity')
                ]);
                
                if (centersResponse?.errors) {
                    setError(centersResponse.errors);
                    return;
                }

                const statsData = await statsResponse.json();
                if (statsData.errors) {
                    setError(statsData.errors);
                    return;
                }

                const activityData = await activityResponse.json();
                if (activityData.errors) {
                    setError(activityData.errors);
                    return;
                }

                setStats({
                    providers: statsData.provider_stats?.total_providers || 0,
                    recipients: statsData.user_stats?.total_recipients || 0,
                    activeListings: statsData.listing_stats?.active_listings || 0,
                    totalListings: statsData.listing_stats?.total_listings || 0
                });

                setChartData(prevData => ({
                    ...prevData,
                    labels: activityData.labels,
                    datasets: [{
                        ...prevData.datasets[0],
                        data: activityData.data
                    }]
                }));
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [dispatch]);

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
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
                    color: 'rgba(240, 235, 206, 0.1)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#F0EBCE',
                    font: {
                        family: '"Times New Roman", serif',
                    }
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: '#F0EBCE',
                    font: {
                        family: '"Times New Roman", serif',
                    }
                }
            },
        },
    };

    // Handle edit center
    const handleEditCenter = (center) => {
        setEditError(null); // Clear any previous edit errors
        setModalContent(
            <EditDistributionCenterModal 
                center={center}
                onError={(error) => {
                    setEditError(error);
                    closeModal();
                }}
                onSuccess={() => {
                    closeModal();
                    // Refresh centers after successful edit
                    dispatch(thunkGetCenters());
                }}
            />
        );
    };

    // Handle delete center
    const handleDeleteCenter = (center) => {
        setSelectedCenter(center);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setIsLoading(true);
            setError(null); // Clear any previous errors
            const response = await dispatch(thunkDeleteCenter(selectedCenter.id));
            if (response?.errors) {
                setError(response.errors);
            } else {
                await dispatch(thunkGetCenters()); // Refresh the list
                setShowDeleteModal(false);
                setSelectedCenter(null);
            }
        } catch (err) {
            console.error('Error deleting center:', err);
            setError('Failed to delete center. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setSelectedCenter(null);
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
                {/* Combined User Stats and Analytics Column */}
                <div className="stats-analytics-column">
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

                    <div className="card analytics">
                        <h3>User Analytics</h3>
                        <div className="chart-container">
                            <Line data={chartData} options={chartOptions} />
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
                    <div className="card-header">
                        <h3>Distribution Centers ({centers.length})</h3>
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
                    
                    {isLoading ? (
                        <div className="loading">
                            <div className="loading-spinner"></div>
                            <p>Loading centers...</p>
                        </div>
                    ) : error || editError ? (
                        <div className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            <p>{error || editError}</p>
                        </div>
                    ) : (
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
                                            onClick={() => handleEditCenter(center)}
                                            disabled={isLoading}
                                        >
                                            <i className="fas fa-edit"></i>
                                            Edit
                                        </button>
                                        <button 
                                            className="action-btn delete"
                                            onClick={() => handleDeleteCenter(center)}
                                            disabled={isLoading}
                                        >
                                            <i className="fas fa-trash"></i>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showDeleteModal && selectedCenter && (
                <DeleteDistributionCenterModal
                    center={selectedCenter}
                    isOpen={showDeleteModal}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
};

export default Admin;
