// src/authConfig.js
// Replace the placeholders with your Azure AD app registration details

export const msalConfig = {
  auth: {
    clientId: "<YOUR_CLIENT_ID>",
    authority: "https://login.microsoftonline.com/<YOUR_TENANT_ID>",
    redirectUri: "http://localhost:3000", // or your deployed URL
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["api://<YOUR_API_CLIENT_ID>/.default"], // or the scopes you need
};
