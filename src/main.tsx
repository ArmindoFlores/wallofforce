import "./index.css";

import App from "./App.tsx";
import { PluginGate } from "./PluginGate.tsx";
import { PluginThemeProvider } from "./PluginThemeProvider.tsx";
import React from "react";
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <PluginGate>
            <PluginThemeProvider>
                <App />
            </PluginThemeProvider>
        </PluginGate>
    </React.StrictMode>,
)
