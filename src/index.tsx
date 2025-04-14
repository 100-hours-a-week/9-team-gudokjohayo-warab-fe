import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { initSentry } from "./sentry/sentry";

initSentry();

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
