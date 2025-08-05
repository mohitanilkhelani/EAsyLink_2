import { useLocation } from "react-router-dom";
import Header from "./components/standardUI/header";
import SubHeader from "./components/standardUI/subheader";
import AppRouter from "./router";

function App() {
  const { account } = useAuth();
  const location = useLocation();

  // Adjust to your actual login route(s)
  const isAuthPage = location.pathname === "/login" || location.pathname === "/auth";

  return (
    <div>
      <Header />
      {/* Only show subheader if logged in and not on login/auth page */}
      {account && !isAuthPage && <SubHeader />}
      <AppRouter />
    </div>
  );
}

export default App;
