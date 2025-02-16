import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { thunkGetCenters } from '../../redux/distributionCenter';
import CreateDistributionCenterModal from './CreateDistributionCenterModal';
import EditDistributionCenterModal from './EditDistributionCenterModal';
import DeleteDistributionCenterModal from './DeleteDistributionCenterModal';
import './DistributionCenters.css';

const DistributionCenters = () => {
    const dispatch = useDispatch();
    const centers = useSelector(state => state.distributionCenters?.allCenters || {});
    const centersArray = Object.values(centers);
    const user = useSelector(state => state.session.user);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const centersPerPage = 6;

    useEffect(() => {
        const loadCenters = async () => {
            setLoading(true);
            try {
                const response = await dispatch(thunkGetCenters());
                console.log("Thunk Response:", response);
                if (!response) {
                    console.error("No centers data received");
                }
            } catch (error) {
                console.error("Error loading centers:", error);
            } finally {
                setTimeout(() => setLoading(false), 100);
            }
        };
        loadCenters();
    }, [dispatch]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilter = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const filteredCenters = centersArray.filter(center => {
        if (!center) return false;
        const matchesSearch = center.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            center.address?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === 'all') return matchesSearch;
        return matchesSearch && center.status?.toLowerCase() === filter;
    });

    console.log("Filtered Centers:", filteredCenters);

    const indexOfLastCenter = currentPage * centersPerPage;
    const indexOfFirstCenter = indexOfLastCenter - centersPerPage;
    console.log("Pagination Indices:", { first: indexOfFirstCenter, last: indexOfLastCenter });
    
    const currentCenters = filteredCenters.slice(indexOfFirstCenter, indexOfLastCenter);
    console.log("Current Centers:", currentCenters);
    
    const totalPages = Math.ceil(filteredCenters.length / centersPerPage);
    console.log("Pagination Info:", { currentPage, totalPages, totalCenters: filteredCenters.length });

    const handleEditClick = (center) => {
        setSelectedCenter(center);
        setShowEditModal(true);
    };

    const handleDeleteClick = (center) => {
        setSelectedCenter(center);
        setShowDeleteModal(true);
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return 'open';
            case 'high demand': return 'high-demand';
            case 'available': return 'available';
            case 'limited': return 'limited';
            default: return 'closed';
        }
    };

    const errors = useSelector(state => state.distributionCenters?.errors);

    if (loading) {
        return (
            <div className="distribution-centers-container">
                <div className="loading-spinner">Loading distribution centers...</div>
            </div>
        );
    }

    if (errors) {
        return (
            <div className="distribution-centers-container">
                <div className="error-message">
                    Error loading distribution centers: {Array.isArray(errors) ? errors.join(', ') : errors}
                </div>
            </div>
        );
    }

    if (!centersArray.length) {
        return (
            <div className="distribution-centers-container">
                <div className="distribution-centers-header">
                    <h1>Distribution Centers</h1>
                    <p>Find food distribution centers near you</p>
                    {user?.is_admin && (
                        <button 
                            className="add-center-button"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <i className="fas fa-plus"></i>
                            Create New Center
                        </button>
                    )}
                </div>
                <div className="no-centers">
                    <h2>No Centers Available</h2>
                    <p>
                        {user?.is_admin 
                            ? "Click 'Create New Center' to add one."
                            : "Please check back later for available distribution centers."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="distribution-centers-container">
            <div className="distribution-centers-header">
                <h1>Distribution Centers</h1>
                <p>Find food distribution centers near you</p>
            </div>

            <div className="centers-controls">
                <div className="search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search centers by name or address..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                {user?.is_admin && (
                    <button 
                        className="add-center-button"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <i className="fas fa-plus"></i>
                        Create New Center
                    </button>
                )}
            </div>

            <div className="centers-grid">
                {currentCenters.length === 0 ? (
                    <div className="no-centers">
                        <h2>No Results Found</h2>
                        <p>No distribution centers match your search criteria.</p>
                    </div>
                ) : (
                    currentCenters.map(center => (
                        <div key={center.id} className="center-card">
                            <img 
                                src={center.image_url || '/center.webp'} 
                                alt={center.name}
                                className="center-image"
                                onError={(e) => {
                                    e.target.src = '/center.webp';
                                }}
                            />
                            <div className="center-content">
                                <h3 className="center-name">{center.name}</h3>
                                <div className="center-details">
                                    <p>
                                        <i className="fas fa-map-marker-alt"></i>
                                        {center.address}
                                    </p>
                                    <p>
                                        <i className="fas fa-clock"></i>
                                        {center.hours || 'Hours not specified'}
                                    </p>
                                    <p>
                                        <i className="fas fa-users"></i>
                                        Capacity: {center.capacity || 'Not specified'}
                                    </p>
                                    <p>
                                        <i className="fas fa-phone"></i>
                                        {center.phone || 'Phone not available'}
                                    </p>
                                </div>

                                {user?.is_admin && (
                                    <div className="center-actions">
                                        <button
                                            className="edit-button"
                                            onClick={() => handleEditClick(center)}
                                        >
                                            <i className="fas fa-edit"></i>
                                            Edit
                                        </button>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteClick(center)}
                                        >
                                            <i className="fas fa-trash"></i>
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {filteredCenters.length > centersPerPage && (
                <div className="centers-footer">
                    <div className="pagination">
                        <button
                            className="page-btn"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                                onClick={() => setCurrentPage(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            className="page-btn"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <CreateDistributionCenterModal
                    onClose={() => setShowCreateModal(false)}
                />
            )}
            {showEditModal && selectedCenter && (
                <EditDistributionCenterModal
                    center={selectedCenter}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedCenter(null);
                    }}
                />
            )}
            {showDeleteModal && selectedCenter && (
                <DeleteDistributionCenterModal
                    center={selectedCenter}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedCenter(null);
                    }}
                />
            )}
        </div>
    );
};

export default DistributionCenters; 