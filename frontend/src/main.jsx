
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";

const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <BrowserRouter>
        <AppProviders>
          <App />
          <Toaster position="top-center"/>
        </AppProviders>
      </BrowserRouter>
    </MsalProvider>
  // </React.StrictMode>
);
