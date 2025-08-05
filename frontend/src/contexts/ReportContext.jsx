// src/contexts/ReportContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const ReportContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;

export function ReportProvider({ children }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Only fetch ONCE (when component mounts, or when token changes)
  const { sessionToken } = useAuth();
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const res = await fetch(`${API_URL}/reports`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (res.ok) setReports(await res.json());
      setLoading(false);
    };
    fetchReports();
  }, [sessionToken]); // refetch if token changes

  return (
    <ReportContext.Provider value={{ reports, setReports, loading }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReports() {
  return useContext(ReportContext);
}
