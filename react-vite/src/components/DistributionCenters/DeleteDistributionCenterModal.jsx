import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { thunkDeleteCenter } from '../../redux/distributionCenter';
import './DeleteDistributionCenterModal.css';

const DeleteDistributionCenterModal = ({ center, onCancel, onClose, isOpen }) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !isLoading) {
                onCancel();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onCancel, isLoading]);

    const handleDelete = async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        setError('');
    
        try {
            const response = await dispatch(thunkDeleteCenter(center.id));
            console.log('Delete response:', response); // Debug log
    
            if (response?.errors) {
                setError(Array.isArray(response.errors) 
                    ? response.errors.join(', ') 
                    : response.errors);
            } else if (response?.success) {
                onCancel(); // Make sure you're using onCancel instead of onClose
            } else {
                setError('Failed to delete the center');
            }
        } catch (err) {
            console.error('Delete error:', err); // Debug log
            setError('Network error while deleting the center');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && !isLoading) {
            onCancel();
        }
    };

    return (
        <div 
            className="delete-modal-overlay" 
            onClick={handleOverlayClick}
        >
            <div className="delete-modal" onClick={e => e.stopPropagation()}>
                <div className="delete-modal-content">
                    <h2>Confirm Deletion</h2>
                    <p>Are you sure you want to delete this distribution center?</p>
                    <div className="center-details">
                        <span className="center-name">{center.name}</span>
                        <span className="center-address">{center.address}</span>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="delete-modal-buttons">
                        <button 
                            className="cancel-btn" 
                            onClick={() => !isLoading && onCancel()}
                            disabled={isLoading}
                            type="button"
                        >
                            Cancel
                        </button>
                        <button 
                            className="confirm-btn" 
                            onClick={handleDelete}
                            disabled={isLoading}
                            type="button"
                        >
                            {isLoading ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteDistributionCenterModal; 