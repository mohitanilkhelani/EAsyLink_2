// src/contexts/AppProviders.jsx
import { AuthProvider } from "./AuthContext";
import { DashboardLayoutProvider } from "./DashboardLayoutContext";
import { ReportProvider } from "./ReportContext"; // Add more as needed

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <DashboardLayoutProvider>
        <ReportProvider>
          {children}
        </ReportProvider>
      </DashboardLayoutProvider>
    </AuthProvider>
  );
}
