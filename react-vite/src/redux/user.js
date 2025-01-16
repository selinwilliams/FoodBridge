import { csrfFetch } from "../../utils/csrf";

// User Types Enum
export const USER_TYPES = {
    ADMIN: 'ADMIN',
    RECIPIENT: 'RECIPIENT',
    PROVIDER: 'PROVIDER'
};

// Action Types
const LOAD_USERS = 'users/LOAD_USERS';
const UPDATE_USER = 'users/UPDATE_USER';
const SET_USER_TYPE = 'users/SET_USER_TYPE';
const SET_USER_PROFILE = 'users/SET_USER_PROFILE';
const SET_ERRORS = 'users/SET_ERRORS';

// Action Creators
const loadUsers = (users) => ({
    type: LOAD_USERS,
    payload: users
});

export const updateUser = (user) => ({
    type: UPDATE_USER,
    payload: user
});

const setUserType = (userId, userType) => ({
    type: SET_USER_TYPE,
    payload: { userId, userType }
});

const setUserProfile = (profile) => ({
    type: SET_USER_PROFILE,
    payload: profile
});

const setErrors = (errors) => ({
    type: SET_ERRORS,
    payload: errors
});

// Thunks
export const thunkGetUsers = () => async (dispatch) => {
    try {
        const response = await csrfFetch('/api/users');
        if (response.ok) {
            const users = await response.json();
            dispatch(loadUsers(users));
            return users;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkUpdateUserProfile = (userId, profileData) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/users/${userId}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });

        if (response.ok) {
            const updatedProfile = await response.json();
            dispatch(setUserProfile(updatedProfile));
            return updatedProfile;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkUpdateUserType = (userId, userType) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/users/${userId}/type`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userType })
        });

        if (response.ok) {
            const updatedUser = await response.json();
            dispatch(setUserType(userId, userType));
            return updatedUser;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

export const thunkGetUserProfile = (userId) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/users/${userId}/profile`);
        if (response.ok) {
            const profile = await response.json();
            dispatch(setUserProfile(profile));
            return profile;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    }
};

// Selectors
export const selectUserType = (state, userId) => 
    state.users.allUsers[userId]?.userType;

export const selectIsAdmin = (state, userId) => 
    state.users.allUsers[userId]?.userType === USER_TYPES.ADMIN;

export const selectIsProvider = (state, userId) => 
    state.users.allUsers[userId]?.userType === USER_TYPES.PROVIDER;

export const selectIsRecipient = (state, userId) => 
    state.users.allUsers[userId]?.userType === USER_TYPES.RECIPIENT;

// Initial State
const initialState = {
    allUsers: {},
    currentUserProfile: null,
    errors: null
};

// Reducer
const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_USERS: {
            const normalizedUsers = {};
            action.payload.forEach(user => {
                normalizedUsers[user.id] = user;
            });
            return {
                ...state,
                allUsers: normalizedUsers,
                errors: null
            };
        }
        case UPDATE_USER:
            return {
                ...state,
                allUsers: {
                    ...state.allUsers,
                    [action.payload.id]: {
                        ...state.allUsers[action.payload.id],
                        ...action.payload
                    }
                },
                errors: null
            };
        case SET_USER_TYPE:
            return {
                ...state,
                allUsers: {
                    ...state.allUsers,
                    [action.payload.userId]: {
                        ...state.allUsers[action.payload.userId],
                        userType: action.payload.userType
                    }
                },
                errors: null
            };
        case SET_USER_PROFILE:
            return {
                ...state,
                currentUserProfile: action.payload,
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

export default userReducer;
