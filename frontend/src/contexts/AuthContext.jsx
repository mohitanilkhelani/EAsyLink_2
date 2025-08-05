import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth-api';
import { storageService } from '../services/storage-service';

// Create the context
export const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [powerBiToken, setPowerBiToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Get stored auth data
        const storedUser = storageService.getUser();
        const storedSessionToken = storageService.getSessionToken();
        const storedPowerBiToken = storageService.getPowerBiToken();
        const storedRefreshToken = storageService.getRefreshToken();
        const storedTokenExpiry = storageService.getTokenExpiry();

        // Set initial state from storage
        setUser(storedUser);
        setSessionToken(storedSessionToken);
        setPowerBiToken(storedPowerBiToken);
        setRefreshToken(storedRefreshToken);
        setTokenExpiry(storedTokenExpiry);

        // If we have a session token, verify it by getting current user
        if (storedSessionToken) {
          try {
            const userData = await authApi.getCurrentUser(storedSessionToken);
            setUser(userData);
            storageService.setUser(userData);
          } catch (error) {
            // If session token is invalid, clear auth state
            console.error("Session token validation failed:", error);
            logout();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setError("Failed to initialize authentication");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle refresh token logic when token is close to expiry
  useEffect(() => {
    let refreshTimerId;

    if (refreshToken && tokenExpiry) {
      const expiryTime = new Date(tokenExpiry).getTime();
      const currentTime = new Date().getTime();
      // Refresh token 5 minutes before expiry
      const timeToRefresh = expiryTime - currentTime - (5 * 60 * 1000);
      if (timeToRefresh > 0) {
        refreshTimerId = setTimeout(() => {
          refreshAccessToken();
        }, timeToRefresh);
      } else {
        // Token is already expired or close to expiry, refresh immediately
        refreshAccessToken();
      }
    }

    return () => {
      if (refreshTimerId) {
        clearTimeout(refreshTimerId);
      }
    };
  }, [refreshToken, tokenExpiry]);

  // Function to handle the Azure AD login
  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { authUrl } = await authApi.getLoginUrl();
      // Redirect to Azure AD login page
      window.location.href = authUrl;
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to initiate login process");
      setIsLoading(false);
    }
  };

  // Function to handle the callback from Azure AD
  const handleCallback = async (code) => {
    try {
      setIsLoading(true);
      setError(null);
      const authResponse = await authApi.handleCallback(code);
      // Extract data from response
      const {
        sessionToken: newSessionToken,
        accessToken: newPowerBiToken,
        refreshToken: newRefreshToken,
        expiresIn,
        user: userData
      } = authResponse;
      // Calculate token expiry time
      const expiryTime = new Date();
      expiryTime.setSeconds(expiryTime.getSeconds() + expiresIn);
      // Update state
      setSessionToken(newSessionToken);
      setPowerBiToken(newPowerBiToken);
      setRefreshToken(newRefreshToken);
      setTokenExpiry(expiryTime.toISOString());
      setUser(userData);
      // Store in local storage
      storageService.setSessionToken(newSessionToken);
      storageService.setPowerBiToken(newPowerBiToken);
      storageService.setRefreshToken(newRefreshToken);
      storageService.setTokenExpiry(expiryTime.toISOString());
      storageService.setUser(userData);
      return userData;
    } catch (error) {
      console.error("Callback handling error:", error);
      setError("Authentication failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh the access token
  const refreshAccessToken = async () => {
    if (!refreshToken) return;
    try {
      setIsLoading(true);
      const response = await authApi.refreshToken(refreshToken);
      // Extract data from response
      const {
        accessToken: newPowerBiToken,
        refreshToken: newRefreshToken,
        expiresIn
      } = response;
      // Calculate new token expiry time
      const expiryTime = new Date();
      expiryTime.setSeconds(expiryTime.getSeconds() + expiresIn);
      // Update state
      setPowerBiToken(newPowerBiToken);
      setRefreshToken(newRefreshToken);
      setTokenExpiry(expiryTime.toISOString());
      // Update storage
      storageService.setPowerBiToken(newPowerBiToken);
      storageService.setRefreshToken(newRefreshToken);
      storageService.setTokenExpiry(expiryTime.toISOString());
      return newPowerBiToken;
    } catch (error) {
      console.error("Token refresh error:", error);
      setError("Failed to refresh token");
      // If refresh fails, force re-login
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle logout
  const logout = async () => {
    try {
      setIsLoading(true);
      // Only call the logout endpoint if we have a session token
      if (sessionToken) {
        const { logoutUrl } = await authApi.getLogoutUrl(sessionToken);
        // Clear auth state
        setUser(null);
        setSessionToken(null);
        setPowerBiToken(null);
        setRefreshToken(null);
        setTokenExpiry(null);
        // Clear storage
        storageService.clearAuthData();
        // Redirect to Azure AD logout
        window.location.href = logoutUrl;
      } else {
        // Just clear local state if no session token
        setUser(null);
        setSessionToken(null);
        setPowerBiToken(null);
        setRefreshToken(null);
        setTokenExpiry(null);
        // Clear storage
        storageService.clearAuthData();
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Even if the server logout fails, clear local state
      setUser(null);
      setSessionToken(null);
      setPowerBiToken(null);
      setRefreshToken(null);
      setTokenExpiry(null);
      // Clear storage
      storageService.clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the user is authenticated
  const isAuthenticated = !!user && !!sessionToken;

  // Check if the PowerBI token is valid
  const isPowerBiTokenValid = !!powerBiToken && tokenExpiry && new Date(tokenExpiry) > new Date();

  // Context value
  const value = {
    user,
    sessionToken,
    powerBiToken,
    refreshToken,
    tokenExpiry,
    isLoading,
    error,
    isAuthenticated,
    isPowerBiTokenValid,
    login,
    handleCallback,
    refreshAccessToken,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

