import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner"; // or "sonner" if installed directly
import App from "./App";
import AppProviders from "./contexts/AppProviders";
import './index.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <App />
        <Toaster position="top-center"/>
      </AppProviders>
    </BrowserRouter>
  // </React.StrictMode>
);
