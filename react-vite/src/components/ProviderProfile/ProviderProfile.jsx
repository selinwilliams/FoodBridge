import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { thunkCreateProvider, thunkUpdateProvider, thunkGetProviderByUserId, setCurrentProvider } from '../../redux/provider';
import './ProviderProfile.css';

const ProviderProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const sessionUser = useSelector(state => state.session.user);
    const providerState = useSelector(state => state.providers || {});
    const { currentProvider, errors } = providerState;

    const [formData, setFormData] = useState({
        name: '',
        business_type: 'RESTAURANT',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        phone: '',
        email: sessionUser?.email || '',
        website: ''
    });

    useEffect(() => {
        const loadProvider = async () => {
            if (!sessionUser?.id) {
                setIsLoading(false);
                return;
            }

            try {
                const data = await dispatch(thunkGetProviderByUserId(sessionUser.id));
                if (data) {
                    console.log('Loaded provider data:', data);
                    dispatch(setCurrentProvider(data));
                    setFormData({
                        name: data.business_name || '',
                        business_type: data.business_type || 'RESTAURANT',
                        address: data.address || '',
                        city: data.city || '',
                        state: data.state || '',
                        zip_code: data.zip_code || '',
                        phone: data.phone || '',
                        email: data.email || sessionUser?.email || '',
                        website: data.website || ''
                    });
                }
            } catch (error) {
                console.error('Error loading provider:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadProvider();
    }, [dispatch, sessionUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            console.log('Current Provider:', currentProvider);
            if (currentProvider?.id) {
                const result = await dispatch(thunkUpdateProvider(currentProvider.id, formData));
                if (result?.errors) {
                    console.error('Validation errors:', result.errors);
                    return;
                }
                if (result?.id) {
                    navigate('/dashboard/provider');
                }
            }
        } catch (error) {
            console.error('Error updating provider:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="provider-profile-form">
            <h2>Edit Provider Profile</h2>
            {errors && <div className="error-message">{errors}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Business Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="business_type">Business Type</label>
                    <select
                        id="business_type"
                        name="business_type"
                        value={formData.business_type}
                        onChange={handleChange}
                        required
                    >
                        <option value="RESTAURANT">Restaurant</option>
                        <option value="GROCERY">Grocery Store</option>
                        <option value="BAKERY">Bakery</option>
                        <option value="CAFE">Cafe</option>
                        <option value="FARM">Farm</option>
                        <option value="OTHER">Other</option>
                    </select>
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
                </div>

                <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="zip_code">Zip Code</label>
                    <input
                        type="text"
                        id="zip_code"
                        name="zip_code"
                        value={formData.zip_code}
                        onChange={handleChange}
                        required
                    />
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
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="website">Website (Optional)</label>
                    <input
                        type="text"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="e.g., www.yourwebsite.com"
                    />
                </div>

                <button type="submit" className="submit-btn" disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Update Profile'}
                </button>
            </form>
        </div>
    );
};

export default ProviderProfile; 