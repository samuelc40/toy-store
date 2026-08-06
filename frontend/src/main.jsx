import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer, Slide } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "react-toastify/dist/ReactToastify.css";
import "./index.css";

import App from "./App";
import { store } from "./app/store";

console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);


ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                    <App />
                </GoogleOAuthProvider>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    // position="top-center"
                    // autoClose={3000}
                    // hideProgressBar
                    // newestOnTop
                    // closeButton={false}
                    // pauseOnHover
                    // draggable
                    // transition={Slide}
                    // theme="light"
                    // toastClassName="glass-toast"
                    // bodyClassName="glass-toast-body"
                />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);