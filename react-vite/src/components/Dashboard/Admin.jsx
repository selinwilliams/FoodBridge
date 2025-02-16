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
        labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
        datasets: [{
            label: 'User Activity',
            data: [0, 0, 0, 0, 0, 0, 25],
            fill: true,
            borderColor: '#6ee7b7',
            backgroundColor: 'rgba(110, 231, 183, 0.1)',
            tension: 0.4,
            borderWidth: 2,
        }]
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
                    color: 'rgba(148, 163, 184, 0.1)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8',
                    font: {
                        family: '"SF Mono", "Fira Code", monospace',
                    }
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: '#94a3b8',
                    font: {
                        family: '"SF Mono", "Fira Code", monospace',
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
            <div className="admin-container">
                <header className="admin-header">
                    <div className="admin-profile">
                        <img 
                            src={sessionUser?.profile_image || defaultAvatar} 
                            alt="Admin Profile"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = defaultAvatar;
                            }}
                        />
                        <h2>Admin Dashboard</h2>
                    </div>
                </header>

                <main className="dashboard-content">
                    <div className="top-cards">
                        <div className="dashboard-card">
                            <h3>User Statistics</h3>
                            <div className="metrics-grid">
                                <div className="metric-item">
                                    <span className="metric-value">{stats.providers || 0}</span>
                                    <span className="metric-label">Providers</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-value">{stats.recipients || 0}</span>
                                    <span className="metric-label">Recipients</span>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <h3>Food Listings</h3>
                            <div className="metrics-grid">
                                <div className="metric-item">
                                    <span className="metric-value">{stats.activeListings || 0}</span>
                                    <span className="metric-label">Active Listings</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-value">{stats.totalListings || 0}</span>
                                    <span className="metric-label">Total Listings</span>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <h3>Distribution Centers ({centers.length})</h3>
                            <button 
                                className="admin-btn secondary"
                                onClick={() => setModalContent(
                                    <CreateDistributionCenterModal />
                                )}
                                disabled={isLoading}
                            >
                                Add New Center
                            </button>
                            {isLoading ? (
                                <div className="loading">Loading centers...</div>
                            ) : error || editError ? (
                                <div className="error-message">{error || editError}</div>
                            ) : (
                                <div className="centers-list">
                                    {centers.map(center => (
                                        <div key={center.id} className="center-item">
                                            <h4>{center.name}</h4>
                                            <p>{center.address}</p>
                                            <div className="center-actions">
                                                <button onClick={() => handleEditCenter(center)}>Edit</button>
                                                <button onClick={() => handleDeleteCenter(center)}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="analytics-card">
                        <h3>User Analytics</h3>
                        <div className="chart-container">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </main>
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

