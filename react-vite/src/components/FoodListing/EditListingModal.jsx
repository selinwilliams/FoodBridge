import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkUpdateListing, thunkGetProviderListings } from '../../redux/foodListing';
import { useModal } from '../../context/Modal';
import './EditListingModal.css';

function EditListingModal({ listing }) {  // Accept listing as prop
    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const [errors, setErrors] = useState({});
    const isLoading = useSelector(state => state.foodListings.isLoading);
    
    // Initialize form with existing listing data
    const [formData, setFormData] = useState({
        title: listing.title || '',
        description: listing.description || '',
        quantity: listing.quantity || '',
        status: listing.status || 'PENDING'
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submit clicked - Edit mode');

        // Validate only the fields we're updating
        const validationErrors = {};
        if (!formData.title.trim()) validationErrors.title = 'Title is required';
        if (!formData.description.trim()) validationErrors.description = 'Description is required';
        if (!formData.quantity) validationErrors.quantity = 'Quantity is required';

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});

        try {
            // Only send the fields that the backend route accepts
            const updatedListingData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                quantity: parseFloat(formData.quantity),
                status: formData.status || 'PENDING'
            };

            console.log('Submitting updated data:', updatedListingData);

            const response = await dispatch(thunkUpdateListing(listing.id, updatedListingData));
            console.log('API Response:', response);

            if (response?.errors) {
                setErrors(typeof response.errors === 'string' 
                    ? { server: response.errors }
                    : response.errors
                );
            } else {
                closeModal();
                // Refresh the listings
                await dispatch(thunkGetProviderListings(listing.provider_id));
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            setErrors({ server: 'An error occurred while updating the listing' });
        }
    };

    return (
        <div className="food-listing-modal">
            <h2>Edit Food Listing</h2>
            {errors.server && (
                <div className="error-message">{errors.server}</div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                    {errors.title && <div className="error-message">{errors.title}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                    {errors.description && <div className="error-message">{errors.description}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="quantity">Quantity</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                    />
                    {errors.quantity && <div className="error-message">{errors.quantity}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="PENDING">Pending</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="CLAIMED">Claimed</option>
                    </select>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className={isLoading ? 'loading' : ''}
                >
                    {isLoading ? 'Updating...' : 'Update Listing'}
                </button>
            </form>
        </div>
    );
}

export default EditListingModal; 