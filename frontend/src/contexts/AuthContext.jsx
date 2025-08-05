
import React, { createContext, useContext } from "react";
import { useMsal, useAccount } from "@azure/msal-react";
import { loginRequest } from "../authConfig";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  // Login with redirect
  const login = () => {
    instance.loginRedirect(loginRequest);
  };

  // Logout
  const logout = () => {
    instance.logoutRedirect();
  };

  // Acquire token silently
  const getToken = async () => {
    if (!account) return null;
    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      return response.accessToken;
    } catch (e) {
      // fallback to interactive if needed
      await instance.acquireTokenRedirect(loginRequest);
    }
  };

  return (
    <AuthContext.Provider value={{ account, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
