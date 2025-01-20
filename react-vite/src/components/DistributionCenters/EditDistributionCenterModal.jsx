import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { thunkUpdateCenter, thunkGetCenters } from '../../redux/distributionCenter';
import { useModal } from '../../context/Modal';
import './DistributionCenterModals.css';

function EditDistributionCenterModal({ center }) {
    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: center.name || '',
        address: center.address || '',
        phone: center.phone || '',
        operating_hours: center.operating_hours || '',
        capacity: center.capacity || '',
        status: center.status || 'OPEN',
        food_types: center.food_types || [],
        image: center.image || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            const response = await dispatch(thunkUpdateCenter(center.id, formData));
            if (response.errors) {
                setErrors(response.errors);
            } else {
                await dispatch(thunkGetCenters()); // Refresh centers
                closeModal();
            }
        } catch (error) {
            setErrors({ server: 'An error occurred while updating the center' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="distribution-center-modal">
            <h2>Edit Distribution Center</h2>
            {errors.server && <div className="error-message">{errors.server}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Center Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    {errors.name && <span className="error">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />
                    {errors.address && <span className="error">{errors.address}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                    {errors.phone && <span className="error">{errors.phone}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="operating_hours">Operating Hours</label>
                    <input
                        type="text"
                        id="operating_hours"
                        name="operating_hours"
                        value={formData.operating_hours}
                        onChange={handleChange}
                        placeholder="e.g., Mon-Fri 9AM-5PM"
                    />
                    {errors.operating_hours && <span className="error">{errors.operating_hours}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="capacity">Capacity (%)</label>
                    <input
                        type="number"
                        id="capacity"
                        name="capacity"
                        min="0"
                        max="100"
                        value={formData.capacity}
                        onChange={handleChange}
                        required
                    />
                    {errors.capacity && <span className="error">{errors.capacity}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="OPEN">Open</option>
                        <option value="CLOSED">Closed</option>
                        <option value="MAINTENANCE">Maintenance</option>
                    </select>
                    {errors.status && <span className="error">{errors.status}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="image">Image URL</label>
                    <input
                        type="url"
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                    />
                    {errors.image && <span className="error">{errors.image}</span>}
                </div>

                <div className="modal-buttons">
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Updating...' : 'Update Center'}
                    </button>
                    <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={closeModal}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditDistributionCenterModal; 