import { csrfFetch } from "../../utils/csrf";

// Action Types
const LOAD_PROVIDERS = 'providers/LOAD_PROVIDERS';
const ADD_PROVIDER = 'providers/ADD_PROVIDER';
const UPDATE_PROVIDER = 'providers/UPDATE_PROVIDER';
const REMOVE_PROVIDER = 'providers/REMOVE_PROVIDER';
const SET_CURRENT_PROVIDER = 'providers/SET_CURRENT_PROVIDER';
const SET_ERRORS = 'providers/SET_ERRORS';
const LOAD_NEARBY_PROVIDERS = 'providers/LOAD_NEARBY_PROVIDERS';
const LOAD_PROVIDER_LISTINGS = 'providers/LOAD_PROVIDER_LISTINGS';
const CLEAR_CURRENT_PROVIDER = 'providers/CLEAR_CURRENT_PROVIDER';
const SET_LOADING = 'providers/SET_LOADING';

// Action Creators
const loadProviders = (providers) => ({
    type: LOAD_PROVIDERS,
    payload: providers
});

const addProvider = (provider) => ({
    type: ADD_PROVIDER,
    payload: provider
});

const updateProvider = (provider) => ({
    type: UPDATE_PROVIDER,
    payload: provider
});

const removeProvider = (providerId) => ({
    type: REMOVE_PROVIDER,
    payload: providerId
});

export  const setCurrentProvider = (provider) => ({
    type: SET_CURRENT_PROVIDER,
    payload: provider
});

const setErrors = (errors) => ({
    type: SET_ERRORS,
    payload: errors
});

const setLoading = (isLoading) => ({
    type: SET_LOADING,
    payload: isLoading
});

export const clearCurrentProvider = () => ({
    type: CLEAR_CURRENT_PROVIDER
});

// Thunks
export const thunkGetProviders = () => async (dispatch) => {
    try {
        const response = await csrfFetch('/api/providers');
        if (response.ok) {
            const providers = await response.json();
            dispatch(loadProviders(providers));
            return providers;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkGetProviderById = (providerId) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        // First try to get the current provider if no ID is provided
        const endpoint = providerId ? `/api/providers/${providerId}` : '/api/providers/current';
        const response = await csrfFetch(endpoint);
        
        if (response.ok) {
            const provider = await response.json();
            dispatch(setCurrentProvider(provider));
            dispatch(setErrors(null));
            return provider;
        } else if (response.status === 404) {
            // This is not an error, just means the user hasn't created a provider profile yet
            dispatch(clearCurrentProvider());
            dispatch(setErrors(null));
            return null;
        } else {
            const errorData = await response.json();
            dispatch(setErrors(errorData.errors || 'Failed to load provider'));
            return null;
        }
    } catch (error) {
        dispatch(setErrors(error.message || 'Failed to load provider'));
        return null;
    } finally {
        dispatch(setLoading(false));
    }
};

export const thunkCreateProvider = (providerData) => async (dispatch) => {
    try {
        const mappedData = {
            business_name: providerData.name,
            business_type: providerData.business_type,
            address: providerData.address,
            city: providerData.city,
            state: providerData.state,
            zip_code: providerData.zip_code,
            phone: providerData.phone,
            email: providerData.email,
            website: providerData.website
        };

        const response = await csrfFetch('/api/providers', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mappedData)
        });

        if (response.ok) {
            const data = await response.json();
            
            // Update provider state
            dispatch(addProvider(data.provider));
            dispatch(setCurrentProvider(data.provider));
            
            // Update session user with new user type
            dispatch({ 
                type: 'session/SET_USER', 
                payload: { 
                    ...data.user, 
                    user_type: 'PROVIDER' 
                } 
            });
            
            return data.provider;
        } else {
            const error = await response.json();
            dispatch(setErrors(error.errors || error.message || 'Failed to create provider'));
            return { errors: error.errors || error.message || 'Failed to create provider' };
        }
    } catch (error) {
        const errorMessage = error.json ? await error.json() : error.message;
        dispatch(setErrors(errorMessage || 'Failed to create provider'));
        return { errors: errorMessage || 'Failed to create provider' };
    }
};

export const thunkUpdateProvider = (providerId, updates) => async (dispatch) => {
    console.log('Updating provider with ID:', providerId);
    console.log('Updates:', updates);
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(`/api/providers/${providerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        
        console.log('Response:', response);
        const data = await response.json();
        
        if (response.ok) {
            dispatch(updateProvider(data));
            dispatch(setCurrentProvider(data));
            dispatch(setErrors(null));
            return data;
        } else {
            console.error('Update error:', data);
            dispatch(setErrors(data.errors || 'Failed to update provider'));
            return null;
        }
    } catch (error) {
        console.error('Update provider error:', error);
        dispatch(setErrors('Failed to update provider'));
        return null;
    } finally {
        dispatch(setLoading(false));
    }
};

export const thunkDeleteProvider = (providerId) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/providers/${providerId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            dispatch(removeProvider(providerId));
            dispatch(clearCurrentProvider());
            return { success: true };
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkGetNearbyProviders = (latitude, longitude, radius) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/providers/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
        if (response.ok) {
            const providers = await response.json();
            dispatch(loadNearbyProviders(providers));
            return providers;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkGetProviderListings = (providerId) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/providers/${providerId}/listings`);
        if (response.ok) {
            const listings = await response.json();
            dispatch(loadProviderListings(listings));
            return listings;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkGetProviderByUserId = (userId) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(`/api/providers/user/${userId}`);
        if (response.ok) {
            const data = await response.json();
            dispatch(setCurrentProvider(data));
            dispatch(setErrors(null));
            return data;
        } else {
            const errorData = await response.json();
            dispatch(setErrors(errorData.errors || 'Failed to load provider'));
            dispatch(clearCurrentProvider());
            return null;
        }
    } catch (error) {
        console.error('Error in thunkGetProviderByUserId:', error);
        dispatch(setErrors('Failed to load provider profile'));
        dispatch(clearCurrentProvider());
        return null;
    } finally {
        dispatch(setLoading(false));
    }
};

// Initial State
const initialState = {
    allProviders: {},
    currentProvider: null,
    nearbyProviders: [],
    providerListings: [],
    errors: null,
    isLoading: false
};

// Reducer
const providerReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };
        case LOAD_PROVIDERS:
            return {
                ...state,
                allProviders: action.payload.reduce((acc, provider) => {
                    acc[provider.id] = provider;
                    return acc;
                }, {}),
                errors: null
            };
        case SET_CURRENT_PROVIDER:
            return {
                ...state,
                currentProvider: action.payload,
                errors: null
            };
        case CLEAR_CURRENT_PROVIDER:
            return {
                ...state,
                currentProvider: null,
                errors: null
            };
        case SET_ERRORS:
            return {
                ...state,
                errors: action.payload
            };
        case ADD_PROVIDER:
            return {
                ...state,
                allProviders: {
                    ...state.allProviders,
                    [action.payload.id]: action.payload
                },
                errors: null
            };
        case UPDATE_PROVIDER:
            return {
                ...state,
                allProviders: {
                    ...state.allProviders,
                    [action.payload.id]: {
                        ...state.allProviders[action.payload.id],
                        ...action.payload
                    }
                },
                currentProvider: state.currentProvider?.id === action.payload.id 
                    ? { ...state.currentProvider, ...action.payload }
                    : state.currentProvider,
                errors: null
            };
        case REMOVE_PROVIDER: {
            const newProviders = { ...state.allProviders };
            delete newProviders[action.payload];
            return {
                ...state,
                allProviders: newProviders,
                currentProvider: state.currentProvider?.id === action.payload ? null : state.currentProvider,
                errors: null
            };
        }
        case LOAD_NEARBY_PROVIDERS:
            return {
                ...state,
                nearbyProviders: action.payload,
                errors: null
            };
        case LOAD_PROVIDER_LISTINGS:
            return {
                ...state,
                providerListings: action.payload || [],
                errors: null
            };
        default:
            return state;
    }
};

export default providerReducer;
