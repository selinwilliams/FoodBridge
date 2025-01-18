import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkAddListing, thunkGetProviderListings, setLoading } from '../../redux/foodListing';
import { thunkGetProviderByUserId } from '../../redux/provider';
import { useModal } from '../../context/Modal';
import './FoodListingModal.css';

function FoodListingModal() {
    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const [errors, setErrors] = useState({});
    const isLoading = useSelector(state => state.foodListings.isLoading);
    
    // Set default dates
    const defaultStartDate = new Date();
    const defaultEndDate = new Date(Date.now() + 86400000); // 24 hours from now
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        food_type: 'PRODUCE',
        quantity: '',
        unit: 'kg',
        expiration_date: '',
        pickup_window_start: defaultStartDate.toISOString().slice(0, 16),
        pickup_window_end: defaultEndDate.toISOString().slice(0, 16),
        allergens: [],
        is_perishable: true,
        storage_instructions: '',
        handling_instructions: '',
        temperature_requirements: '',
        status: 'PENDING'
    });

    // Get session user and provider state
    const sessionUser = useSelector(state => state.session.user);
    const providerState = useSelector(state => state.providers || {});
    const currentProvider = providerState.currentProvider;

    // Add provider data loading effect
    useEffect(() => {
        const loadProvider = async () => {
            if (sessionUser?.id && !currentProvider) {
                await dispatch(thunkGetProviderByUserId(sessionUser.id));
            }
        };
        loadProvider();
    }, [dispatch, sessionUser, currentProvider]);

    // Debug logs
    useEffect(() => {
        console.log('Session User:', sessionUser);
        console.log('Provider State:', providerState);
        console.log('Current Provider:', currentProvider);
        console.log('Form Data:', formData);
    }, [sessionUser, providerState, currentProvider, formData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submit clicked');

        if (!currentProvider?.id) {
            setErrors({ provider: 'Provider profile required to create listings' });
            return;
        }

        // Validate form data
        const validationErrors = {};
        if (!formData.title.trim()) validationErrors.title = 'Title is required';
        if (!formData.description.trim()) validationErrors.description = 'Description is required';
        if (!formData.quantity) validationErrors.quantity = 'Quantity is required';
        if (!formData.expiration_date) validationErrors.expiration_date = 'Expiration date is required';
        if (!formData.pickup_window_start) validationErrors.pickup_window_start = 'Pickup window start is required';
        if (!formData.pickup_window_end) validationErrors.pickup_window_end = 'Pickup window end is required';

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        dispatch(setLoading(true));

        try {
            // Format dates properly for the API
            const listingData = {
                ...formData,
                provider_id: currentProvider.id,
                quantity: parseFloat(formData.quantity),
                expiration_date: new Date(formData.expiration_date).toISOString(),
                pickup_window_start: new Date(formData.pickup_window_start).toISOString(),
                pickup_window_end: new Date(formData.pickup_window_end).toISOString(),
                status: 'PENDING',
                allergens: formData.allergens || []
            };

            console.log('Submitting data:', listingData);

            const response = await dispatch(thunkAddListing(listingData));
            console.log('API Response:', response);

            if (response?.errors) {
                console.error('Submission errors:', response.errors); // Debug log
                setErrors(typeof response.errors === 'string' 
                    ? { server: response.errors }
                    : response.errors
                );
            } else {
                closeModal();
                // Refresh the provider's listings
                if (currentProvider?.id) {
                    await dispatch(thunkGetProviderListings(currentProvider.id));
                }
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error); // Debug log
            setErrors({ server: 'An error occurred while creating the listing' });
        }
    };

    return (
        <div className="food-listing-modal">
            <h2>Create New Food Listing</h2>
            {errors.provider && (
                <div className="error-message">{errors.provider}</div>
            )}
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

                <div className="form-row">
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
                        <label htmlFor="unit">Unit</label>
                        <select
                            id="unit"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            required
                        >
                            <option value="kg">Kilograms (kg)</option>
                            <option value="lbs">Pounds (lbs)</option>
                            <option value="pieces">Pieces</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="expiration_date">Expiration Date</label>
                    <input
                        type="datetime-local"
                        id="expiration_date"
                        name="expiration_date"
                        value={formData.expiration_date}
                        onChange={handleChange}
                        required
                    />
                    {errors.expiration_date && <div className="error-message">{errors.expiration_date}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="pickup_window_start">Pickup Window Start</label>
                    <input
                        type="datetime-local"
                        id="pickup_window_start"
                        name="pickup_window_start"
                        value={formData.pickup_window_start}
                        onChange={handleChange}
                        required
                    />
                    {errors.pickup_window_start && 
                        <div className="error-message">{errors.pickup_window_start}</div>
                    }
                </div>

                <div className="form-group">
                    <label htmlFor="pickup_window_end">Pickup Window End</label>
                    <input
                        type="datetime-local"
                        id="pickup_window_end"
                        name="pickup_window_end"
                        value={formData.pickup_window_end}
                        onChange={handleChange}
                        required
                    />
                    {errors.pickup_window_end && 
                        <div className="error-message">{errors.pickup_window_end}</div>
                    }
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className={isLoading ? 'loading' : ''}
                >
                    {isLoading ? 'Creating...' : 'Create Listing'}
                </button>
            </form>
        </div>
    );
}

export default FoodListingModal; 