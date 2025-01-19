import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { thunkCreateCenter, thunkGetCenters } from '../../redux/distributionCenter';
import { useModal } from '../../context/Modal';
import './DistributionCenterModals.css';

function CreateDistributionCenterModal() {
    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
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

        const formattedData = {
            ...formData,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            capacity_limit: parseInt(formData.capacity_limit),
            contact_person: formData.contact_person || null,
            phone: formData.phone || null,
            operating_hours: formData.operating_hours || null,
            email: formData.email || null,
            image_url: formData.image_url || null
        };

        console.log('Submitting formatted data:', formattedData);

        try {
            const response = await dispatch(thunkCreateCenter(formattedData));
            
            if (response?.errors) {
                setErrors(response.errors);
            } else {
                await dispatch(thunkGetCenters());
                closeModal();
            }
        } catch (error) {
            setErrors({ server: 'An error occurred while creating the center' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="distribution-center-modal">
            <h2>Create Distribution Center</h2>
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
                    <label htmlFor="latitude">Latitude</label>
                    <input
                        type="number"
                        step="any"
                        id="latitude"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        placeholder="e.g., 37.7749"
                        required
                    />
                    {errors.latitude && <span className="error">{errors.latitude}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="longitude">Longitude</label>
                    <input
                        type="number"
                        step="any"
                        id="longitude"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        placeholder="e.g., -122.4194"
                        required
                    />
                    {errors.longitude && <span className="error">{errors.longitude}</span>}
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

                <div className="modal-buttons">
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating...' : 'Create Center'}
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

export default CreateDistributionCenterModal; 