import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { thunkDeleteCenter, thunkGetCenters } from '../../redux/distributionCenter';
import { useModal } from '../../context/Modal';
import './DistributionCenterModals.css';

function DeleteDistributionCenterModal({ center }) {
    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await dispatch(thunkDeleteCenter(center.id));
            if (response?.errors) {
                setError(response.errors);
            } else {
                await dispatch(thunkGetCenters()); // Refresh centers list
                closeModal();
            }
        } catch (err) {
            setError('Failed to delete the distribution center');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="distribution-center-modal delete-modal">
            <h2>Delete Distribution Center</h2>
            <p className="delete-message">
                Are you sure you want to delete <strong>{center.name}</strong>?
            </p>
            <p className="delete-warning">
                This action cannot be undone. All data associated with this center will be permanently removed.
            </p>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="modal-buttons">
                <button 
                    onClick={handleDelete}
                    className="delete-btn"
                    disabled={isLoading}
                >
                    {isLoading ? 'Deleting...' : 'Delete Center'}
                </button>
                <button 
                    onClick={closeModal}
                    className="cancel-btn"
                    disabled={isLoading}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default DeleteDistributionCenterModal; 