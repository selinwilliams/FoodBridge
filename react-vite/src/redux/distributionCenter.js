import { csrfFetch } from "../../utils/csrf";

// Action Types
const LOAD_CENTERS = 'distributionCenters/LOAD_CENTERS';
const ADD_CENTER = 'distributionCenters/ADD_CENTER';
const UPDATE_CENTER = 'distributionCenters/UPDATE_CENTER';
const SET_CURRENT_CENTER = 'distributionCenters/SET_CURRENT_CENTER';
const SET_ERRORS = 'distributionCenters/SET_ERRORS';
const DELETE_CENTER = 'distributionCenters/DELETE_CENTER';

// Action Creators
const loadCenters = (centers) => ({
    type: LOAD_CENTERS,
    payload: centers
});

const addCenter = (center) => ({
    type: ADD_CENTER,
    payload: center
});

const updateCenter = (center) => ({
    type: UPDATE_CENTER,
    payload: center
});

const setCurrentCenter = (center) => ({
    type: SET_CURRENT_CENTER,
    payload: center
});

const setErrors = (errors) => ({
    type: SET_ERRORS,
    payload: errors
});

export const deleteCenter = (centerId) => ({
    type: DELETE_CENTER,
    payload: centerId
});

// Thunks
export const thunkGetCenters = () => async (dispatch) => {
    try {
        const response = await csrfFetch('/api/distribution-centers');
        if (!response.ok) {
            const error = await response.json();
            dispatch(setErrors(error.errors || ['Failed to load centers']));
            return null;
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug log

        // Ensure we're handling both array and object responses
        const centersArray = Array.isArray(data) ? data : 
                           data.distribution_centers ? data.distribution_centers : 
                           Object.values(data);

        // Normalize the data into an object with IDs as keys
        const normalizedCenters = centersArray.reduce((acc, center) => {
            if (center && center.id) {
                acc[center.id] = {
                    ...center,
                    // Ensure required fields have default values
                    status: center.status || 'available',
                    food_types: center.food_types || '',
                    capacity: center.capacity || '0',
                    hours: center.hours || 'Not specified'
                };
            }
            return acc;
        }, {});

        console.log('Normalized Centers:', normalizedCenters); // Debug log
        dispatch(loadCenters(normalizedCenters));
        return normalizedCenters;
    } catch (error) {
        console.error('Error in thunkGetCenters:', error);
        dispatch(setErrors([error.message || 'Failed to load centers']));
        return null;
    }
};

export const thunkGetCenterById = (centerId) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/distribution-centers/${centerId}`);
        if (response.ok) {
            const center = await response.json();
            dispatch(setCurrentCenter(center));
            return center;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkCreateCenter = (centerData) => async (dispatch) => {
    try {
        const formattedData = {
            name: centerData.name?.trim(),
            address: centerData.address?.trim(),
            latitude: parseFloat(centerData.latitude),
            longitude: parseFloat(centerData.longitude),
            contact_person: centerData.contact_person?.trim() || null,
            phone: centerData.phone?.trim() || null,
            email: centerData.email?.trim() || null,
            status: centerData.status || 'OPEN',
            capacity_limit: parseInt(centerData.capacity_limit) || 100,
            image_url: centerData.image_url || null
        };

        console.log('Sending data to server:', formattedData);

        const response = await csrfFetch('/api/distribution-centers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formattedData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error response:', errorData);
            return { 
                errors: errorData.errors || { server: 'Failed to create center' }
            };
        }

        const newCenter = await response.json();
        dispatch(addCenter(newCenter));
        return newCenter;

    } catch (error) {
        console.error("Error in thunkCreateCenter:", error);
        return { 
            errors: { 
                server: error.message || 'An error occurred while creating the center' 
            } 
        };
    }
};

export const thunkUpdateCenter = (centerId, updates) => async (dispatch) => {
    try {
        const formattedData = {
            name: updates.name?.trim(),
            address: updates.address?.trim(),
            phone: updates.phone?.trim() || null,
            status: updates.status || 'OPEN',
            capacity: parseInt(updates.capacity) || 100,
            image_url: updates.image || null
        };

        console.log('Sending formatted data to server:', formattedData);

        const response = await csrfFetch(`/api/distribution-centers/${centerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formattedData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error response:', errorData);
            return { errors: errorData.errors || { server: 'Failed to update center' } };
        }

        const updatedCenter = await response.json();
        dispatch(updateCenter(updatedCenter));
        return updatedCenter;
    } catch (error) {
        console.error("Error in thunkUpdateCenter:", error);
        return { 
            errors: { 
                server: error.message || 'An error occurred while updating the center' 
            } 
        };
    }
};

// In your thunkDeleteCenter.js
export const thunkDeleteCenter = (centerId) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/distribution-centers/${centerId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                errors: errorData.errors || ['Failed to delete center'],
                status: response.status
            };
        }

        // Handle successful deletion
        dispatch(deleteCenter(centerId));
        return { success: true };

    } catch (error) {
        console.error('Thunk error:', error); // Debug log
        return {
            errors: ['Network error while deleting the center'],
            status: 500
        };
    }
};


// Initial State
const initialState = {
    allCenters: {},
    currentCenter: null,
    errors: null
};

// Reducer
const distributionCenterReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_CENTERS:
            console.log('LOAD_CENTERS action:', action); // Debug log
            return {
                ...state,
                allCenters: action.payload || {},
                errors: null
            };
            
        case ADD_CENTER:
            return {
                ...state,
                allCenters: {
                    ...state.allCenters,
                    [action.payload.id]: action.payload
                },
                errors: null
            };
            
        case UPDATE_CENTER:
            return {
                ...state,
                allCenters: {
                    ...state.allCenters,
                    [action.payload.id]: action.payload
                },
                errors: null
            };
            
        case DELETE_CENTER: {
            const newCenters = { ...state.allCenters };
            delete newCenters[action.payload];
            return {
                ...state,
                allCenters: newCenters,
                errors: null
            };
        }
        
        case SET_CURRENT_CENTER:
            return {
                ...state,
                currentCenter: action.payload,
                errors: null
            };
            
        case SET_ERRORS:
            return {
                ...state,
                errors: action.payload
            };
            
        default:
            return state;
    }
};

export default distributionCenterReducer;
