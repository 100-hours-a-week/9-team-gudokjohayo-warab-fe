import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import * as Sentry from "@sentry/react";

Sentry.init({
    dsn: "https://f3147520594016c834d0853f49a0aecf@o4509127330627584.ingest.us.sentry.io/4509127342489600",
});

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
