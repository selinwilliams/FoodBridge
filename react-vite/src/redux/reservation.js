import { csrfFetch } from "../utils/csrf";

// Action Types
const LOAD_RESERVATIONS = 'reservations/LOAD_RESERVATIONS';
const ADD_RESERVATION = 'reservations/ADD_RESERVATION';
const UPDATE_RESERVATION = 'reservations/UPDATE_RESERVATION';
const REMOVE_RESERVATION = 'reservations/REMOVE_RESERVATION';
const SET_ERRORS = 'reservations/SET_ERRORS';

// Action Creators
const loadReservations = (reservations) => ({
    type: LOAD_RESERVATIONS,
    payload: reservations
});

const addReservation = (reservation) => ({
    type: ADD_RESERVATION,
    payload: reservation
});

const updateReservation = (reservation) => ({
    type: UPDATE_RESERVATION,
    payload: reservation
});

const removeReservation = (reservationId) => ({
    type: REMOVE_RESERVATION,
    payload: reservationId
});

const setErrors = (errors) => ({
    type: SET_ERRORS,
    payload: errors
});

// Thunks
export const thunkGetReservations = () => async (dispatch) => {
    try {
        const response = await csrfFetch('/api/reservations');
        if (response.ok) {
            const reservations = await response.json();
            dispatch(loadReservations(reservations));
            return reservations;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkCreateReservation = (reservationData) => async (dispatch) => {
    try {
        const response = await csrfFetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservationData)
        });

        if (response.ok) {
            const newReservation = await response.json();
            dispatch(addReservation(newReservation));
            return newReservation;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkUpdateReservation = (reservationId, updates) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/reservations/${reservationId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (response.ok) {
            const updatedReservation = await response.json();
            dispatch(updateReservation(updatedReservation));
            return updatedReservation;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkDeleteReservation = (reservationId) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/reservations/${reservationId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            dispatch(removeReservation(reservationId));
            return true;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

// Initial State
const initialState = {
    allReservations: {},
    errors: null
};

// Reducer
const reservationReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_RESERVATIONS: {
            const normalizedReservations = {};
            action.payload.forEach(reservation => {
                normalizedReservations[reservation.id] = reservation;
            });
            return {
                ...state,
                allReservations: normalizedReservations,
                errors: null
            };
        }
        case ADD_RESERVATION:
            return {
                ...state,
                allReservations: {
                    ...state.allReservations,
                    [action.payload.id]: action.payload
                },
                errors: null
            };
        case UPDATE_RESERVATION:
            return {
                ...state,
                allReservations: {
                    ...state.allReservations,
                    [action.payload.id]: {
                        ...state.allReservations[action.payload.id],
                        ...action.payload
                    }
                },
                errors: null
            };
        case REMOVE_RESERVATION: {
            const newState = { ...state };
            delete newState.allReservations[action.payload];
            return newState;
        }
        case SET_ERRORS:
            return {
                ...state,
                errors: action.payload
            };
        default:
            return state;
    }
};

export default reservationReducer;
