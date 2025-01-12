import { csrfFetch } from "../../utils/csrf";

// Action Types
const LOAD_CENTERS = 'distributionCenters/LOAD_CENTERS';
const ADD_CENTER = 'distributionCenters/ADD_CENTER';
const UPDATE_CENTER = 'distributionCenters/UPDATE_CENTER';
const REMOVE_CENTER = 'distributionCenters/REMOVE_CENTER';
const SET_CURRENT_CENTER = 'distributionCenters/SET_CURRENT_CENTER';
const SET_ERRORS = 'distributionCenters/SET_ERRORS';

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

const removeCenter = (centerId) => ({
    type: REMOVE_CENTER,
    payload: centerId
});

const setCurrentCenter = (center) => ({
    type: SET_CURRENT_CENTER,
    payload: center
});

const setErrors = (errors) => ({
    type: SET_ERRORS,
    payload: errors
});

// Thunks
export const thunkGetCenters = () => async (dispatch) => {
    try {
        const response = await csrfFetch('/api/distribution-centers');
        if (response.ok) {
            const centers = await response.json();
            dispatch(loadCenters(centers));
            return centers;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
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
        const response = await csrfFetch('/api/distribution-centers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(centerData)
        });

        if (response.ok) {
            const newCenter = await response.json();
            dispatch(addCenter(newCenter));
            return newCenter;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkUpdateCenter = (centerId, updates) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/distribution-centers/${centerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (response.ok) {
            const updatedCenter = await response.json();
            dispatch(updateCenter(updatedCenter));
            return updatedCenter;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
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
        case LOAD_CENTERS: {
            const normalizedCenters = {};
            action.payload.forEach(center => {
                normalizedCenters[center.id] = center;
            });
            return {
                ...state,
                allCenters: normalizedCenters,
                errors: null
            };
        }
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
                    [action.payload.id]: {
                        ...state.allCenters[action.payload.id],
                        ...action.payload
                    }
                },
                currentCenter: state.currentCenter?.id === action.payload.id 
                    ? { ...state.currentCenter, ...action.payload }
                    : state.currentCenter,
                errors: null
            };
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
