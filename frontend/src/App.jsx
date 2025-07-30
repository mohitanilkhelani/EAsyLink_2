import { useLocation } from "react-router-dom";
import Header from "./components/standardUI/header";
import SubHeader from "./components/standardUI/subheader";
import AppRouter from "./router";
import { useAuth } from "./contexts/AuthContext"; // Update import if needed

function App() {
  const { token } = useAuth();
  const location = useLocation();

  // Adjust to your actual login route(s)
  const isAuthPage = location.pathname === "/login" || location.pathname === "/auth";

  return (
    <div>
      <Header />
        {/* Only show subheader if logged in and not on login/auth page */}
        {token && !isAuthPage && <SubHeader />}
      <AppRouter />
    </div>
  );
}

export default App;
