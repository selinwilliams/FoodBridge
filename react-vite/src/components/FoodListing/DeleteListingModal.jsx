import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkDeleteListing, thunkGetProviderListings } from '../../redux/foodListing';
import { useModal } from '../../context/Modal';
import './DeleteListingModal.css';

function DeleteListingModal({ listing }) {
    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const [errors, setErrors] = useState({});
    const isLoading = useSelector(state => state.foodListings.isLoading);

    const handleDelete = async () => {
        try {
            await dispatch(thunkDeleteListing(listing.id));
            closeModal();
            // Refresh listings after deletion
            await dispatch(thunkGetProviderListings(listing.provider_id));
        } catch (error) {
            console.error('Error deleting listing:', error);
            setErrors({ server: 'Failed to delete listing' });
        }
    };

    return (
        <div className="delete-listing-modal">
            <h2>Confirm Delete</h2>
            {errors.server && (
                <div className="error-message">{errors.server}</div>
            )}
            <p>Are you sure you want to delete "{listing.title}"?</p>
            <p>This action cannot be undone.</p>
            
            <div className="button-group">
                <button 
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="delete-btn"
                >
                    {isLoading ? 'Deleting...' : 'Delete'}
                </button>
                <button 
                    onClick={closeModal}
                    disabled={isLoading}
                    className="cancel-btn"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default DeleteListingModal; 