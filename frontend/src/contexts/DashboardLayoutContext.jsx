// src/contexts/DashboardLayoutContext.jsx
import React, { createContext, useContext, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

const DashboardLayoutContext = createContext();

export function DashboardLayoutProvider({ children }) {
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(false);

  // fetch and set layouts
  const fetchLayouts = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/dashboard-layouts`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    });
    if (res.ok) {
      setLayouts(await res.json());
    }
    setLoading(false);
  };

  return (
    <DashboardLayoutContext.Provider value={{ layouts, setLayouts, fetchLayouts, loading }}>
      {children}
    </DashboardLayoutContext.Provider>
  );
}

export function useDashboardLayouts() {
  return useContext(DashboardLayoutContext);
}
