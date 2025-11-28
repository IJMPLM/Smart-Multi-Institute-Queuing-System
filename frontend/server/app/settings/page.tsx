// Settings - @FE - Jana
"use client";
import React from "react";
import { Power } from "lucide-react";

<<<<<<< HEAD
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_BASE = `${BASE_URL}/api/`;
=======
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || `http://localhost:4000/api/`
>>>>>>> upstream/main
export default function SettingsPage() {
  const handleShutdown = async () => {
    if (
      !confirm(
        "Are you sure you want to shut down the server? This will disconnect all users."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}server/shutdown`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Server shutdown initiated successfully");
        alert(
          "Server shutdown initiated. The page will become unavailable shortly."
        );
      } else {
        console.error("Failed to shutdown server");
        alert("Failed to shutdown server");
      }
    } catch (error) {
      console.error("Error shutting down server:", error);
      alert("Error shutting down server");
    }
  };

  return (
    <main className="system-page-container">
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">System configuration and controls</p>

      {}
      <div className="system-content-card" style={{ marginTop: "24px" }}>
        <div className="system-card-header">
          <h2 className="settings-section-title">Server Controls</h2>
          <button className="settings-danger-button" onClick={handleShutdown}>
            <Power size={18} />
            <span>Shut Down Server</span>
          </button>
        </div>
      </div>
    </main>
  );
}
