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

    // Load centers
    useEffect(() => {
        const loadCenters = async () => {
            try {
                setIsLoading(true);
                const response = await dispatch(thunkGetCenters());
                if (response?.errors) {
                    setError(response.errors);
                }
            } catch (err) {
                console.error('Error loading centers:', err);
                setError('Failed to load distribution centers');
            } finally {
                setIsLoading(false);
            }
        };

        loadCenters();
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
                {/* Food Listings Card */}
                <div className="card food-listings">
                    <h3>Available Food Listings</h3>
                    <div className="metrics">
                        <div className="metric">
                            <span className="value">2</span>
                            <span className="label">Active</span>
                        </div>
                        <div className="metric">
                            <span className="value">39</span>
                            <span className="label">Total</span>
                        </div>
                    </div>
                    <div className="actions">
                        <button className="action-btn add">Add</button>
                        <button className="action-btn refresh">Refresh</button>
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
                    <div className="analytics-actions">
                        <button className="action-btn">
                            <i className="fas fa-history"></i>
                            Posting History
                        </button>
                        <button className="action-btn">
                            <i className="fas fa-users"></i>
                            Top Members
                        </button>
                        <button className="action-btn">
                            <i className="fas fa-hands-helping"></i>
                            Top Volunteers
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
