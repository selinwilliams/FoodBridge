import React from "react";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import configureStore from "./redux/store";
import { router } from "./router/index";
import * as sessionActions from "./redux/session";
import { restoreCSRF, getCSRFToken } from "./utils/csrf";
import "./index.css";

const store = configureStore();

if (import.meta.env.MODE !== "production") {
  restoreCSRF().then(() => {
    window.csrfToken = getCSRFToken();
  });
  
  window.store = store;
  window.sessionActions = sessionActions;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <RouterProvider router={router} future={{v7_startTransition: true, v7_relativeSplatPath: true}}/>
    </ReduxProvider>
  </React.StrictMode>
);
