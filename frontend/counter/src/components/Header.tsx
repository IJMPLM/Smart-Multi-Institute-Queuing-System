"use client";

import React from "react";
import { LayoutDashboard, User, LogOut } from "lucide-react";

type View = "dashboard" | "applicant";

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
}
<<<<<<< HEAD

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_BASE = `${BASE_URL}/api/`;
=======
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || `http://localhost:4000/api/`
>>>>>>> upstream/main

const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onLogout,
}) => {
  const activeClass =
    "flex items-center gap-2 bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors";
  const inactiveClass =
    "flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-md hover:bg-yellow-300 hover:text-black transition-colors";

  const handleLogout = async () => {
    if (
      !confirm(
        "Are you sure you want to log out? This will end your counter session."
      )
    ) {
      return;
    }

    try {
      // Try to close the counter session first
      const closeRes = await fetch(`${BASE_URL}counter/close`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId: "self" }), // sessionId will be resolved by backend from cookie/session
      });
      const closeData = await closeRes.json();
      if (closeRes.ok) {
        if (closeData.canClose) {
          // No applicants, proceed with logout
          const response = await fetch(`${BASE_URL}counter/logout`, {
            method: "POST",
            credentials: "include",
          });
          if (response.ok) {
            onLogout();
          } else {
            const error = await response.json();
            alert(`Logout failed: ${error.message || "Unknown error"}`);
          }
        } else {
          alert(
            "Counter is closing, but there are still applicants in queue. Please serve all applicants before logging out."
          );
        }
      } else {
        alert(closeData.message || "Failed to close counter.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      onLogout();
    }
  };

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      {/* Logo/Title */}
      <div className="text-xl font-bold">Counter Admin</div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-4">
        <button
          className={currentView === "dashboard" ? activeClass : inactiveClass}
          onClick={() => onViewChange("dashboard")}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>
        <button
          className={currentView === "applicant" ? activeClass : inactiveClass}
          onClick={() => onViewChange("applicant")}
        >
          <User size={18} />
          Applicant
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-500 transition-colors"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </nav>
  );
};

export default Header;
