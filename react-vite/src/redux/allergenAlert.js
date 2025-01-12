import { csrfFetch } from "../../utils/csrf";

// Action Types
const LOAD_ALLERGEN_ALERTS = 'allergenAlerts/LOAD_ALLERGEN_ALERTS';
const ADD_ALLERGEN_ALERT = 'allergenAlerts/ADD_ALLERGEN_ALERT';
const UPDATE_ALLERGEN_ALERT = 'allergenAlerts/UPDATE_ALLERGEN_ALERT';
const REMOVE_ALLERGEN_ALERT = 'allergenAlerts/REMOVE_ALLERGEN_ALERT';
const SET_USER_PREFERENCES = 'allergenAlerts/SET_USER_PREFERENCES';
const SET_ERRORS = 'allergenAlerts/SET_ERRORS';

// Action Creators
const loadAllergenAlerts = (alerts) => ({
    type: LOAD_ALLERGEN_ALERTS,
    payload: alerts
});

const addAllergenAlert = (alert) => ({
    type: ADD_ALLERGEN_ALERT,
    payload: alert
});

const updateAllergenAlert = (alert) => ({
    type: UPDATE_ALLERGEN_ALERT,
    payload: alert
});

const removeAllergenAlert = (alertId) => ({
    type: REMOVE_ALLERGEN_ALERT,
    payload: alertId
});

const setUserPreferences = (preferences) => ({
    type: SET_USER_PREFERENCES,
    payload: preferences
});

const setErrors = (errors) => ({
    type: SET_ERRORS,
    payload: errors
});

// Thunks
export const thunkGetAllergenAlerts = () => async (dispatch) => {
    try {
        const response = await csrfFetch('/api/allergen-alerts');
        if (response.ok) {
            const alerts = await response.json();
            dispatch(loadAllergenAlerts(alerts));
            return alerts;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkCreateAllergenAlert = (alertData) => async (dispatch) => {
    try {
        const response = await csrfFetch('/api/allergen-alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertData)
        });

        if (response.ok) {
            const newAlert = await response.json();
            dispatch(addAllergenAlert(newAlert));
            return newAlert;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkUpdateUserPreferences = (preferences) => async (dispatch) => {
    try {
        const response = await csrfFetch('/api/allergen-alerts/preferences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preferences)
        });

        if (response.ok) {
            const updatedPreferences = await response.json();
            dispatch(setUserPreferences(updatedPreferences));
            return updatedPreferences;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkToggleAlertStatus = (alertId, isActive) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/allergen-alerts/${alertId}/toggle`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive })
        });

        if (response.ok) {
            const updatedAlert = await response.json();
            dispatch(updateAllergenAlert(updatedAlert));
            return updatedAlert;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

// Initial State
const initialState = {
    alerts: {},
    userPreferences: null,
    errors: null
};

// Reducer
const allergenAlertReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_ALLERGEN_ALERTS: {
            const normalizedAlerts = {};
            action.payload.forEach(alert => {
                normalizedAlerts[alert.id] = alert;
            });
            return {
                ...state,
                alerts: normalizedAlerts,
                errors: null
            };
        }
        case ADD_ALLERGEN_ALERT:
            return {
                ...state,
                alerts: {
                    ...state.alerts,
                    [action.payload.id]: action.payload
                },
                errors: null
            };
        case UPDATE_ALLERGEN_ALERT:
            return {
                ...state,
                alerts: {
                    ...state.alerts,
                    [action.payload.id]: {
                        ...state.alerts[action.payload.id],
                        ...action.payload
                    }
                },
                errors: null
            };
        case REMOVE_ALLERGEN_ALERT: {
            const newAlerts = { ...state.alerts };
            delete newAlerts[action.payload];
            return {
                ...state,
                alerts: newAlerts,
                errors: null
            };
        }
        case SET_USER_PREFERENCES:
            return {
                ...state,
                userPreferences: action.payload,
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

export default allergenAlertReducer;
