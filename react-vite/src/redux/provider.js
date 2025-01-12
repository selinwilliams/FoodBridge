import { csrfFetch } from "../utils/csrf";

// Action Types
const LOAD_PROVIDERS = 'providers/LOAD_PROVIDERS';
const ADD_PROVIDER = 'providers/ADD_PROVIDER';
const UPDATE_PROVIDER = 'providers/UPDATE_PROVIDER';
const REMOVE_PROVIDER = 'providers/REMOVE_PROVIDER';
const SET_CURRENT_PROVIDER = 'providers/SET_CURRENT_PROVIDER';
const SET_ERRORS = 'providers/SET_ERRORS';

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

const setCurrentProvider = (provider) => ({
    type: SET_CURRENT_PROVIDER,
    payload: provider
});

const setErrors = (errors) => ({
    type: SET_ERRORS,
    payload: errors
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
    try {
        const response = await csrfFetch(`/api/providers/${providerId}`);
        if (response.ok) {
            const provider = await response.json();
            dispatch(setCurrentProvider(provider));
            return provider;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkCreateProvider = (providerData) => async (dispatch) => {
    try {
        const response = await csrfFetch('/api/providers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(providerData)
        });

        if (response.ok) {
            const newProvider = await response.json();
            dispatch(addProvider(newProvider));
            return newProvider;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkUpdateProvider = (providerId, updates) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/providers/${providerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (response.ok) {
            const updatedProvider = await response.json();
            dispatch(updateProvider(updatedProvider));
            return updatedProvider;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

// Initial State
const initialState = {
    allProviders: {},
    currentProvider: null,
    errors: null
};

// Reducer
const providerReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_PROVIDERS: {
            const normalizedProviders = {};
            action.payload.forEach(provider => {
                normalizedProviders[provider.id] = provider;
            });
            return {
                ...state,
                allProviders: normalizedProviders,
                errors: null
            };
        }
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
        case SET_CURRENT_PROVIDER:
            return {
                ...state,
                currentProvider: action.payload,
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

export default providerReducer;
