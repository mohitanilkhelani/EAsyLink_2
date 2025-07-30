import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./components/pages/auth";
import LayoutListPage from "./components/pages/LayoutView";
import SettingsPage from "./components/pages/settingpage";
import CreateLayout from "./components/pages/CreateLayout";
import ProtectedRoute from "./components/standardUI/ProtectedRoute";
import LayoutViewPage from "./components/pages/singleLayoutView";
import EditLayout from "./components/pages/editLayout";
import NotFound from "./components/pages/NotFound";

export default function AppRouter() {
  return (
    <Routes>
      {/* Redirect root to /home */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Auth page (login/register) */}
      <Route path="/auth" element={<Auth />} />

      {/* Protected pages */}
      <Route path="/home" element={
        <ProtectedRoute>
          <LayoutListPage />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/createLayout" element={
        <ProtectedRoute>
          <CreateLayout />
        </ProtectedRoute>
      } />
      <Route path="/layout/:layoutId" element={<LayoutViewPage />} />
      <Route path="/layouts/:layoutId/edit" element={<EditLayout />} />

      {/* 404 fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
