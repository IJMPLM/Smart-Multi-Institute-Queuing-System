"use client";

import React, { useState } from "react";
import { KeyRound } from "lucide-react";

interface LoginPageProps {
  onLogin: (key: string) => void;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_BASE = `${BASE_URL}/api/`;

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [sessionKey, setSessionKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionKey.trim()) {
      setError("Please enter a session key");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}counter/activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ key: sessionKey.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLogin(sessionKey);
      } else {
        setError(data.message || "Invalid session key");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-amber-50 p-4">
      {/* Login Card */}
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg md:p-12">
        <div className="mb-6 inline-flex rounded-full bg-blue-600 p-4 text-white">
          <KeyRound size={40} />
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">
          Counter Admin Access
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Enter your session key to access the
          <br />
          counter management system
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter session key"
            value={sessionKey}
            onChange={(e) => setSessionKey(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-gray-200 bg-gray-100 p-3 text-center text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-gray-900"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-yellow-500 p-3 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Log-In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
