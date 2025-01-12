import { csrfFetch } from "../../utils/csrf";

// Action Types
const LOAD_TAX_RECORDS = 'taxRecords/LOAD_TAX_RECORDS';
const ADD_TAX_RECORD = 'taxRecords/ADD_TAX_RECORD';
const UPDATE_TAX_RECORD = 'taxRecords/UPDATE_TAX_RECORD';
const SET_CURRENT_RECORD = 'taxRecords/SET_CURRENT_RECORD';
const SET_ERRORS = 'taxRecords/SET_ERRORS';
const SET_LOADING = 'taxRecords/SET_LOADING';

// Action Creators
const loadTaxRecords = (records) => ({
    type: LOAD_TAX_RECORDS,
    payload: records
});

const addTaxRecord = (record) => ({
    type: ADD_TAX_RECORD,
    payload: record
});

const updateTaxRecord = (record) => ({
    type: UPDATE_TAX_RECORD,
    payload: record
});

const setCurrentRecord = (record) => ({
    type: SET_CURRENT_RECORD,
    payload: record
});

const setErrors = (errors) => ({
    type: SET_ERRORS,
    payload: errors
});

const setLoading = (status) => ({
    type: SET_LOADING,
    payload: status
});

// Thunks
export const thunkGetTaxRecords = (year) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(`/api/tax-records${year ? `?year=${year}` : ''}`);
        if (response.ok) {
            const records = await response.json();
            dispatch(loadTaxRecords(records));
            return records;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    } finally {
        dispatch(setLoading(false));
    }
};

export const thunkGenerateTaxRecord = (donationId) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(`/api/tax-records/generate/${donationId}`, {
            method: 'POST'
        });

        if (response.ok) {
            const newRecord = await response.json();
            dispatch(addTaxRecord(newRecord));
            return newRecord;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    } finally {
        dispatch(setLoading(false));
    }
};

export const thunkDownloadTaxRecord = (recordId) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(`/api/tax-records/${recordId}/download`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tax-record-${recordId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            return true;
        }
    } catch (error) {
        dispatch(setErrors(error.message));
        return error;
    } finally {
        dispatch(setLoading(false));
    }
};

// Initial State
const initialState = {
    allRecords: {},
    currentRecord: null,
    isLoading: false,
    errors: null
};

// Reducer
const donationTaxRecordReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_TAX_RECORDS: {
            const normalizedRecords = {};
            action.payload.forEach(record => {
                normalizedRecords[record.id] = record;
            });
            return {
                ...state,
                allRecords: normalizedRecords,
                errors: null
            };
        }
        case ADD_TAX_RECORD:
            return {
                ...state,
                allRecords: {
                    ...state.allRecords,
                    [action.payload.id]: action.payload
                },
                errors: null
            };
        case UPDATE_TAX_RECORD:
            return {
                ...state,
                allRecords: {
                    ...state.allRecords,
                    [action.payload.id]: {
                        ...state.allRecords[action.payload.id],
                        ...action.payload
                    }
                },
                currentRecord: state.currentRecord?.id === action.payload.id 
                    ? { ...state.currentRecord, ...action.payload }
                    : state.currentRecord,
                errors: null
            };
        case SET_CURRENT_RECORD:
            return {
                ...state,
                currentRecord: action.payload,
                errors: null
            };
        case SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
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

export default donationTaxRecordReducer;
