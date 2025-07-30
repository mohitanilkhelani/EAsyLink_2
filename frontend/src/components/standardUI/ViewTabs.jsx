import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function ViewTabs() {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex gap-6 border-b px-6 py-2 bg-white">
      <Link
        to="/view"
        className={`py-2 px-4 rounded-t 
          ${location.pathname === "/view"
            ? "border-b-2 border-blue-500 font-semibold text-blue-600 bg-blue-50"
            : "text-gray-700 hover:bg-gray-100"
          }`}
      >
        Reports
      </Link>
      <Link
        to="/profile"
        className={`py-2 px-4 rounded-t 
          ${location.pathname === "/profile"
            ? "border-b-2 border-blue-500 font-semibold text-blue-600 bg-blue-50"
            : "text-gray-700 hover:bg-gray-100"
          }`}
      >
        Profile
      </Link>
     <Link
        to="/settings"
        className={`py-2 px-4 rounded-t 
            ${location.pathname === "/settings"
            ? "border-b-2 border-blue-500 font-semibold text-blue-600 bg-blue-50"
            : "text-gray-700 hover:bg-gray-100"
            }`}
        >
        Settings
        </Link>
    </div>
  );
}
