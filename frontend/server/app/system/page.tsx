"use client";
import React, { useState, useEffect } from "react";

interface Device {
  id: number;
  name: string;
  type: string;
  status: string;
}

interface Session {
  id: number;
  counterName: string;
  sessionKey: string;
  startedAt: string;
  status: string;
  endedAt: string;
  sessionId: string;
}
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_BASE = `${BASE_URL}/api/`;
export default function SystemPage() {
  const [activeTab, setActiveTab] = useState("devices");
  const [devices, setDevices] = useState<Device[]>([]);
  const [counters, setCounters] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [result, setResult] = useState("");

  const handleDisconnect = async (deviceId: string) => {
    if (!confirm("Are you sure you want to disconnect this device?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}session/${deviceId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        // Refresh devices list
        const devicesResponse = await fetch(`${API_BASE}server/devices`, {
          credentials: "include",
        });
        if (devicesResponse.ok) {
          const data = await devicesResponse.json();
          setDevices(data);
        }
      } else {
        alert("Failed to disconnect device");
      }
    } catch (error) {
      console.error("Error disconnecting device:", error);
      alert("Error disconnecting device");
    }
  };

  const handleAddCounter = async () => {
    try {
      const response = await fetch(`${API_BASE}server/generate-counter`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
      } else {
        alert("Failed to generate counter key");
      }
    } catch (error) {
      console.error("Error generating counter key:", error);
      alert("Error generating counter key");
    }
  };

  const handleEndSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to end this counter session?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}counter/close`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        // Refresh sessions list
        const sessionsResponse = await fetch(`${API_BASE}server/counters`, {
          credentials: "include",
        });
        if (sessionsResponse.ok) {
          const data = await sessionsResponse.json();
          setCounters(data);
        }
      } else {
        const error = await response.json();
        alert(`Failed to end session: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error ending session:", error);
      alert("Error ending counter session");
    }
  };

  // Fetch devices data from API
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch(`${API_BASE}server/devices`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setDevices(data);
        } else {
          console.log("Failed to fetch devices from /api/server/devices");
          setDevices([]);
        }
      } catch (error) {
        console.log("Failed to fetch devices:", error);
        setDevices([]);
      }
    };

    const fetchSessions = async () => {
      try {
        const response = await fetch(`${API_BASE}server/counters`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setCounters(data);
        } else {
          console.log("Failed to fetch sessions from /api/server/counters");
          setCounters([]);
        }
      } catch (error) {
        console.log("Failed to fetch sessions:", error);
        setCounters([]);
      }
    };

    fetchDevices();
    fetchSessions();
  }, []);

  return (
    <main className="system-page-container">
      <h1 className="page-title">System Management</h1>
      <p className="page-subtitle">
        Manage connected devices and counter sessions
      </p>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          onClick={() => setActiveTab("devices")}
          className={`tab-button ${activeTab === "devices" ? "active" : ""}`}
        >
          Connected Devices
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`tab-button ${activeTab === "sessions" ? "active" : ""}`}
        >
          Counter Session Management
        </button>
      </div>

      {activeTab === "devices" ? (
        // --- CONNECTED DEVICES ---//
        <div className="system-content-card">
          <div className="system-card-header">
            <h2 className="system-card-title">Connected Devices</h2>
            <p className="system-card-subtitle">
              View and manage all connected devices
            </p>
          </div>
          <div className="table-wrapper">
            <table className="devices-table">
              <thead>
                <tr>
                  <th>Device Name</th>
                  <th className="text-center">Type</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id}>
                    <td>
                      <div className="device-name-wrapper">
                        <img
                          src={
                            device.type === "Counter"
                              ? "/icons/counter.svg"
                              : "/icons/applicant device.svg"
                          }
                          alt={
                            device.type === "Counter"
                              ? "Counter Icon"
                              : "Applicant Icon"
                          }
                          className="device-icon"
                        />
                        <span>{device.name}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span
                        className={`type-badge type-${device.type.toLowerCase()}`}
                      >
                        {device.type}
                      </span>
                    </td>
                    <td className="text-center">
                      <div
                        className={`status-indicator status-${device.status.toLowerCase()}`}
                      >
                        <span className="status-dot"></span>
                        {device.status}
                      </div>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleDisconnect(device.id.toString())}
                        className="action-disconnect"
                      >
                        Reset
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // --- COUNTER SESSION ---//
        <div className="system-content-card">
          <div className="system-card-header">
            <div>
              <h2 className="system-card-title">Counter Session Management</h2>
              <p className="system-card-subtitle">
                Monitor and manage counter sessions
              </p>
            </div>
            <button onClick={handleAddCounter} className="add-counter-button">
              Add
            </button>
          </div>
          <div className="table-wrapper">
            <table className="devices-table">
              <thead>
                <tr>
                  <th>Counter Name</th>
                  <th>Counter Key</th>
                  <th>Started At</th>
                  <th>Status</th>
                  <th>Ended At</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {counters.map((session) => (
                  <tr key={session.id}>
                    <td>{session.counterName}</td>
                    <td>
                      <div className="session-key-wrapper">
                        <img
                          src="/icons/session key.svg"
                          alt="Counter Key"
                          className="session-key-icon"
                        />
                        <span>{session.sessionKey}</span>
                      </div>
                    </td>
                    <td>{session.startedAt}</td>
                    <td>
                      <div
                        className={`status-indicator status-${session.status.toLowerCase()}`}
                      >
                        <span className="status-dot"></span>
                        {session.status}
                      </div>
                    </td>
                    <td>{session.endedAt}</td>
                    <td className="text-center">
                      {session.status === "Active" ? (
                        <button
                          onClick={() => handleEndSession(session.sessionId)}
                          className="action-end-session"
                        >
                          End Session
                        </button>
                      ) : session.status === "Online" ? (
                        <span className="text-muted">-</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
