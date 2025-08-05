import React from "react";
import Container from "./container";
import { Settings, User, LogOut, Home, Plus } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function capitalizeName(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export default function SubHeader() {
  const { account, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Use Azure AD account info for display name
  const fullName = account?.name || account?.username || "User";

  function handleLogout() {
    logout();
    // Optionally, you can redirect to home or login
    navigate("/login");
  }

  const isCreateLayout = location.pathname === "/createLayout";

  return (
    <div className="border-b bg-white">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Left: Welcome message + Buttons */}
          <div className="flex items-center gap-4">
            <span className="text-xl">
              Welcome back <span className="font-bold">{fullName}.</span>
            </span>
            <Link to="/home">
              <button
                className="p-2 rounded-full hover:bg-gray-100 text-gray-900 transition"
                aria-label="Home"
              >
                <Home className="w-5 h-5" />
              </button>
            </Link>
            {!isCreateLayout && (
              <Link to="/createLayout">
                <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 font-medium">
                  <Plus className="w-5 h-5" />
                  Create Layout
                </button>
              </Link>
            )}
          </div>
          {/* Right: Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                aria-label="Settings"
              >
                <Settings className="w-6 h-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[180px]">
              <div className="px-3 py-2 text-xs text-gray-500">
                Signed in as
              </div>
              <div className="px-3 pb-2 font-medium">
                {fullName}
                <div className="text-xs text-gray-500">{account?.username}</div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Container>
    </div>
  );
}
