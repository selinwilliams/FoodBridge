import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { thunkGetCenters } from '../../redux/distributionCenter';
import CreateDistributionCenterModal from './CreateDistributionCenterModal';
import EditDistributionCenterModal from './EditDistributionCenterModal';
import DeleteDistributionCenterModal from './DeleteDistributionCenterModal';
import './DistributionCenters.css';

const DistributionCenters = () => {
    const dispatch = useDispatch();
    const centers = useSelector(state => {
        console.log("Full Redux State:", state);
        return state.distributionCenters?.allCenters || {};
    });
    
    console.log("Centers from Redux:", centers);
    
    const centersArray = Object.values(centers);
    console.log("Centers Array:", centersArray);
    
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
            <div className="distribution-centers">
                <div className="loading">Loading distribution centers...</div>
            </div>
        );
    }

    if (errors) {
        return (
            <div className="distribution-centers">
                <div className="error">
                    Error loading distribution centers: {Array.isArray(errors) ? errors.join(', ') : errors}
                </div>
            </div>
        );
    }

    if (!centersArray.length) {
        return (
            <div className="distribution-centers">
                <div className="centers-header">
                    <h1>Distribution Centers</h1>
                    {user?.is_admin && (
                        <button 
                            className="admin-create-btn"
                            onClick={() => setShowCreateModal(true)}
                        >
                            Create New Center
                        </button>
                    )}
                </div>
                <div className="no-centers">
                    No distribution centers available.
                    {user?.is_admin && " Click 'Create New Center' to add one."}
                </div>
            </div>
        );
    }

    return (
        <div className="distribution-centers">
            <div className="centers-header">
                <h1>Distribution Centers</h1>
                {user?.is_admin && (
                    <button 
                        className="admin-create-btn"
                        onClick={() => setShowCreateModal(true)}
                    >
                        Create New Center
                    </button>
                )}
                <div className="search-filters">
                    <input
                        type="text"
                        placeholder="Search centers by name or address..."
                        className="search-input"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => handleFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filter === 'open' ? 'active' : ''}`}
                            onClick={() => handleFilter('open')}
                        >
                            Open
                        </button>
                        <button
                            className={`filter-btn ${filter === 'high demand' ? 'active' : ''}`}
                            onClick={() => handleFilter('high demand')}
                        >
                            High Demand
                        </button>
                        <button
                            className={`filter-btn ${filter === 'limited' ? 'active' : ''}`}
                            onClick={() => handleFilter('limited')}
                        >
                            Limited
                        </button>
                    </div>
                </div>
            </div>

            <div className="centers-grid">
                {currentCenters.length === 0 ? (
                    <div className="no-centers">
                        No distribution centers found matching your criteria.
                    </div>
                ) : (
                    currentCenters.map(center => (
                        <div key={center.id} className="center-card">
                            <div className="center-image">
                                <img 
                                    src={center.image_url || '/center.webp'} 
                                    alt={center.name}
                                    onError={(e) => {
                                        e.target.src = '/center.webp';
                                    }}
                                />
                                <div className={`status-badge ${getStatusBadgeClass(center.status)}`}>
                                    {center.status}
                                </div>
                            </div>
                            <div className="center-info">
                                <h3>{center.name}</h3>
                                <div className="address">
                                    {center.address}
                                </div>
                                <div className="hours-capacity">
                                    <span>Hours: {center.hours}</span>
                                    <span>Capacity: {center.capacity}</span>
                                </div>
                                <div className="food-types">
                                    {center.food_types?.split(',').map((type, index) => (
                                        <span key={index} className="food-type-tag">
                                            {type.trim()}
                                        </span>
                                    ))}
                                </div>
                                <div className="contact-info">
                                    <span>📞 {center.phone}</span>
                                </div>
                                {user?.is_admin && (
                                    <div className="admin-actions">
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEditClick(center)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteClick(center)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                                <button className="view-details-btn">
                                    View Details
                                </button>
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