import {
  legacy_createStore as createStore,
  applyMiddleware,
  compose,
  combineReducers,
} from "redux";
import thunk from "redux-thunk";
import sessionReducer from "./session";
import reservationReducer from "./reservation";
import foodListingReducer from "./foodListing";
import distributionCenterReducer from "./distributionCenter";
import providerReducer from "./provider";
import donationTaxRecordReducer from "./donationTaxRecord";
import allergenAlertReducer from "./allergenAlert";
import userReducer from "./user";


const rootReducer = combineReducers({
  session: sessionReducer,
  users: userReducer,
  reservations: reservationReducer,
  foodListings: foodListingReducer,
  distributionCenters: distributionCenterReducer,
  providers: providerReducer,
  donationTaxRecords: donationTaxRecordReducer,
  allergenAlerts: allergenAlertReducer
});

let enhancer;
if (import.meta.env.MODE === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = (await import("redux-logger")).default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
