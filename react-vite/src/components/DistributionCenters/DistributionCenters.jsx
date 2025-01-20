import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkGetCenters } from '../../redux/distributionCenter';
import { useModal } from '../../context/Modal';
import './DistributionCenters.css';

const DistributionCenters = () => {
    console.log('Component rendering');

    const dispatch = useDispatch();
    const { setModalContent } = useModal();
    
    const sessionUser = useSelector(state => {
        console.log('sessionUser selector running');
        return state.session.user;
    });
    
    const centers = useSelector(state => {
        console.log('centers selector running');
        return Object.values(state.distributionCenters.allCenters);
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const centersPerPage = 6;

    useEffect(() => {
        console.log('Loading centers effect running');
        let mounted = true;

        const loadCenters = async () => {
            try {
                await dispatch(thunkGetCenters());
                if (mounted) {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error loading centers:', error);
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        loadCenters();
        
        return () => {
            mounted = false;
        };
    }, [dispatch]);

    const filteredCenters = useMemo(() => {
        console.log('Calculating filtered centers');
        let filtered = centers;
        
        if (searchTerm) {
            filtered = filtered.filter(center => 
                center.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                center.address?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (activeFilter !== 'all') {
            switch (activeFilter) {
                case 'open':
                    filtered = filtered.filter(center => center.status === 'OPEN');
                    break;
                case 'high-capacity':
                    filtered = filtered.filter(center => center.capacity > 75);
                    break;
                case 'fresh-produce':
                    filtered = filtered.filter(center => 
                        center.food_types?.includes('Fresh Produce')
                    );
                    break;
                default:
                    break;
            }
        }
        
        return filtered;
    }, [centers, searchTerm, activeFilter]);

    const { currentCenters, totalPages } = useMemo(() => {
        console.log('Calculating pagination');
        const indexOfLastCenter = currentPage * centersPerPage;
        const indexOfFirstCenter = indexOfLastCenter - centersPerPage;
        return {
            currentCenters: filteredCenters.slice(indexOfFirstCenter, indexOfLastCenter),
            totalPages: Math.ceil(filteredCenters.length / centersPerPage)
        };
    }, [filteredCenters, currentPage, centersPerPage]);

    const handlePageChange = useCallback((pageNumber) => {
        console.log('Page change:', pageNumber);
        setCurrentPage(pageNumber);
    }, []);

    const handleSearchChange = useCallback((e) => {
        console.log('Search change:', e.target.value);
        setSearchTerm(e.target.value);
    }, []);

    const handleFilterChange = useCallback((filter) => {
        console.log('Filter change:', filter);
        setActiveFilter(filter);
        setCurrentPage(1);
    }, []);

    console.log('Before render:', {
        centersLength: centers.length,
        filteredLength: filteredCenters.length,
        currentPage,
        totalPages
    });

    if (isLoading) {
        return <div className="loading">Loading distribution centers...</div>;
    }

    return (
        <div className="distribution-centers">
            <div className="centers-header">
                <h1>Distribution Centers</h1>
                {sessionUser?.is_admin && (
                    <button 
                        className="admin-create-btn"
                        onClick={() => setModalContent(<CreateDistributionCenterModal />)}
                    >
                        Create New Center
                    </button>
                )}
                <div className="search-filters">
                    <input 
                        type="text" 
                        placeholder="Search by location or name..."
                        className="search-input"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <div className="filter-buttons">
                        <button 
                            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => handleFilterChange('all')}
                        >
                            All
                        </button>
                        <button 
                            className={`filter-btn ${activeFilter === 'open' ? 'active' : ''}`}
                            onClick={() => handleFilterChange('open')}
                        >
                            Open Now
                        </button>
                        <button 
                            className={`filter-btn ${activeFilter === 'high-capacity' ? 'active' : ''}`}
                            onClick={() => handleFilterChange('high-capacity')}
                        >
                            High Capacity
                        </button>
                        <button 
                            className={`filter-btn ${activeFilter === 'fresh-produce' ? 'active' : ''}`}
                            onClick={() => handleFilterChange('fresh-produce')}
                        >
                            Fresh Produce
                        </button>
                    </div>
                </div>
            </div>

            <div className="centers-grid">
                {currentCenters.length > 0 ? (
                    currentCenters.map(center => (
                        <div key={center.id} className="center-card">
                            <div className="center-image">
                                <img src={center.image || '/center.webp'} alt={center.name} />
                                <div className={`status-badge ${center.status.toLowerCase()}`}>
                                    {center.status}
                                </div>
                            </div>
                            <div className="center-info">
                                <h3>{center.name}</h3>
                                <p className="address">{center.address}</p>
                                <div className="hours-capacity">
                                    <span className="hours">{center.operating_hours}</span>
                                    <span className="capacity">
                                        Capacity: {center.capacity}%
                                    </span>
                                </div>
                                <div className="food-types">
                                    {center.food_types?.map((type, index) => (
                                        <span key={index} className="food-type-tag">
                                            {type}
                                        </span>
                                    ))}
                                </div>
                                <div className="contact-info">
                                    <i className="phone-icon"></i>
                                    {center.phone}
                                </div>
                                {sessionUser?.is_admin && (
                                    <div className="admin-actions">
                                        <button 
                                            className="edit-btn"
                                            onClick={() => setModalContent(
                                                <EditDistributionCenterModal center={center} />
                                            )}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="delete-btn"
                                            onClick={() => setModalContent(
                                                <DeleteDistributionCenterModal center={center} />
                                            )}
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
                ) : (
                    <div className="no-centers">
                        <p>No distribution centers found.</p>
                    </div>
                )}
            </div>

            {filteredCenters.length > centersPerPage && (
                <div className="centers-footer">
                    <div className="pagination">
                        <button 
                            className="page-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <span 
                                key={i + 1}
                                className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                                onClick={() => handlePageChange(i + 1)}
                            >
                                {i + 1}
                            </span>
                        ))}
                        <button 
                            className="page-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DistributionCenters; 