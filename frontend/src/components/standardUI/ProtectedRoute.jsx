// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const loggedIn = useAuth();

  if (!loggedIn) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}
