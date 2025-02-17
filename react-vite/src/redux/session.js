import { csrfFetch } from "../../utils/csrf";

const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';

const setUser = (user) => ({
  type: SET_USER,
  payload: user
});

const removeUser = () => ({
  type: REMOVE_USER
});

export const thunkAuthenticate = () => async (dispatch) => {
  try {
    const response = await csrfFetch("/api/auth/", {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      dispatch(setUser(data));
      return data;
    } else {
      const error = await response.json();
      return error;
    }
  } catch (error) {
    if (error.status !== 401) {
      console.error('Authentication error:', error);
    }
    return null;
  }
};

export const thunkLogin = (credentials) => async dispatch => {
  const response = await csrfFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });

  if(response.ok) {
    const data = await response.json();
    dispatch(setUser(data));
  } else if (response.status < 500) {
    const errorMessages = await response.json();
    return errorMessages
  } else {
    return { server: "Something went wrong. Please try again" }
  }
};

export const thunkSignup = (user) => async (dispatch) => {
  try {
    console.log('Signup request payload:', user);

    const response = await csrfFetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
      credentials: 'include'
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      
      if (response.ok) {
        dispatch(setUser(data));
        // Return null for success, but include the user type for proper redirection
        return { success: true, user_type: data.user_type };
      }
      return data;
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      return {
        server: "Server error occurred. Please check server logs.",
        details: response.statusText
      };
    }
  } catch (error) {
    console.error('Signup error:', error);
    return {
      server: "Failed to complete signup. Please try again.",
      details: error.message
    };
  }
};

export const thunkLogout = () => async (dispatch) => {
  await csrfFetch("/api/auth/logout");
  dispatch(removeUser());
};

const initialState = { user: null };

function sessionReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    default:
      return state;
  }
}

export default sessionReducer;
