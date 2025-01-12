import { csrfFetch } from "../utils/csrf";

//Action Types
const LOAD_LISTINGS = 'foodListing/LOAD_LISTINGS';
const ADD_LISTING = 'foodListing/ADD_LISTING';
const UPDATE_LISTING = 'foodListing/UPDATE_LISTING';
const DELETE_LISTING = 'foodListing/DELETE_LISTING';
const SET_LOADING = 'foodListing/SET_LOADING';
const SET_ERROR = 'foodListing/SET_ERROR';

//Action Creators
const loadListings = (listings) => ({
    type: LOAD_LISTINGS,
    payload: listings
});

const addListing = (listing) => ({
    type: ADD_LISTING,
    payload: listing
});

const updateListing = (listing) => ({
    type: UPDATE_LISTING,
    payload: listing
});

const deleteListing = (listingId) => ({
    type: DELETE_LISTING,
    payload: listingId
});

const setLoading = (loading) => ({
    type: SET_LOADING,
    payload: loading
});

const setError = (error) => ({
    type: SET_ERROR,
    payload: error
});

//Thunk Actions
export const thunkLoadListings = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch('/api/food-listings');
        const data = await response.json();
        dispatch(loadListings(data));
    } catch (error) {
        dispatch(setError(error));
    } finally {
        dispatch(setLoading(false));
    }
};

export const thunkAddListing = (listing) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch('/api/food-listings', {
            method: 'POST',
            body: JSON.stringify(listing)
        });
        const data = await response.json();
        dispatch(addListing(data));
    } catch (error) {
        dispatch(setError(error));
    } finally {
        dispatch(setLoading(false));
    }
};

export const thunkUpdateListing = (listingId, listing) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(`/api/food-listings/${listingId}`, {
            method: 'PUT',
            body: JSON.stringify(listing)
        });
        const data = await response.json();
        dispatch(updateListing(data));
    } catch (error) {
        dispatch(setError(error));
    } finally {
        dispatch(setLoading(false));
    }
};

export const thunkDeleteListing = (listingId) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        await csrfFetch(`/api/food-listings/${listingId}`, { method: 'DELETE' });
        dispatch(deleteListing(listingId));
    } catch (error) {
        dispatch(setError(error));
    } finally {
        dispatch(setLoading(false));
    }
};

//Reducer
const initialState = {
    listings: [],
    loading: false,
    error: null
};

const foodListingReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_LISTINGS:
            return { ...state, listings: action.payload };
        case ADD_LISTING:
            return { ...state, listings: [...state.listings, action.payload] };
        case UPDATE_LISTING:
            return { ...state, listings: state.listings.map(listing => listing.id === action.payload.id ? action.payload : listing) };
        case DELETE_LISTING:
            return { ...state, listings: state.listings.filter(listing => listing.id !== action.payload) };
        case SET_LOADING:
            return { ...state, loading: action.payload };
        case SET_ERROR:
            return { ...state, error: action.payload };
        default:
            return state;
    }
};

export default foodListingReducer;