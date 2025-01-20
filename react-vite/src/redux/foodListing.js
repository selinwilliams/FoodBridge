import { csrfFetch } from "../../utils/csrf";

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

export const setLoading = (isLoading) => ({
    type: SET_LOADING,
    payload: isLoading
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

export const thunkAddListing = (listingData) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        console.log('Sending listing data:', listingData); // Debug log
        
        const response = await csrfFetch('/api/food-listings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(listingData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData); // Debug log
            return { errors: errorData.errors || 'Failed to create listing' };
        }
        
        const newListing = await response.json();
        console.log('Created listing:', newListing); // Debug log
        
        dispatch(addListing(newListing));
        return newListing;
        
    } catch (error) {
        console.error('Error in thunkAddListing:', error); // Debug log
        return { errors: { server: 'An error occurred while creating the listing' } };
    } finally {
        dispatch(setLoading(false));
    }
};

export const thunkUpdateListing = (listingId, listing) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        console.log('Updating listing:', listingId, listing);
        const response = await csrfFetch(`/api/food-listings/${listingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(listing)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Update failed:', error);
            return { errors: error.errors || 'Failed to update listing' };
        }

        const updatedListing = await response.json();
        console.log('Update successful:', updatedListing);
        
        dispatch(updateListing(updatedListing));
        return updatedListing;

    } catch (error) {
        console.error('Error in thunkUpdateListing:', error);
        return { errors: { server: error.message || 'An error occurred while updating the listing' } };
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

export const thunkGetProviderListings = (providerId) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(`/api/providers/${providerId}/listings`);
        
        if (response.ok) {
            const listings = await response.json();
            dispatch(loadListings(listings));
            return listings;
        } else {
            const errors = await response.json();
            dispatch(setError(errors));
            return { errors };
        }
    } catch (error) {
        console.error('Error fetching provider listings:', error);
        dispatch(setError({ server: 'Failed to load listings' }));
        return { errors: { server: 'Failed to load listings' } };
    } finally {
        dispatch(setLoading(false));
    }
};

//Reducer
const initialState = {
    listings: [],
    isLoading: false,
    error: null
};

const foodListingReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_LISTINGS:
            return {
                ...state,
                listings: action.payload.listings || action.payload // Handle both {listings: []} and [] formats
            };
        case ADD_LISTING:
            return {
                ...state,
                listings: [...state.listings, action.payload]
            };
        case UPDATE_LISTING:
            return {
                ...state,
                listings: state.listings.map(listing =>
                    listing.id === action.payload.id ? action.payload : listing
                )
            };
        case DELETE_LISTING:
            return {
                ...state,
                listings: state.listings.filter(listing => listing.id !== action.payload)
            };
        case SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };
        case SET_ERROR:
            return {
                ...state,
                error: action.payload
            };
        default:
            return state;
    }
};

export default foodListingReducer;