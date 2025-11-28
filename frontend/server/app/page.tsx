// frontend/server/app/page.tsx

"use client";
import React, { useState, useEffect } from "react";
import DashboardCard from "@/components/DashboardCard";
import "../styles/globals.css";
import { QrCode } from "lucide-react";

interface SessionData {
  usersInQueue: number;
  lastSession?: string;
}

interface SummaryData {
  requestsToday: number;
  avgWaitTime: number;
  totalUptime: number;
}

export default function DashboardPage() {
  const [queueData, setQueueData] = useState<SessionData>({
    usersInQueue: 0,
    lastSession: "None",
  });
  const [activeUsers, setActiveUsers] = useState(0);
  const [connectedDevices, setConnectedDevices] = useState(0);
  const [activeCounters, setActiveCounters] = useState(0);
  const [summary, setSummary] = useState<SummaryData>({
    requestsToday: 0,
    avgWaitTime: 0,
    totalUptime: 0,
  });
  const [qrData, setQrData] = useState<{ [key: string]: string }>({});
<<<<<<< HEAD

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const API_BASE = `${BASE_URL}/api`;
=======
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || `http://localhost:4000/api/`
>>>>>>> upstream/main

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {// Current Queue Status
        const sessionRes = await fetch(`${BASE_URL}/server/dashboard/queue`, {
          credentials: 'include'
        });
        const sessionText = await sessionRes.text();
        const sessionData = sessionText ? JSON.parse(sessionText) : {};
        setQueueData({
          usersInQueue: sessionData.usersInQueue ?? 0,
          lastSession: sessionData.lastSession ?? "None",
        });

        // Active users
        const devicesRes = await fetch(`${BASE_URL}server/dashboard/users`, {
          credentials: 'include'
        });
        const devicesText = await devicesRes.text();
        const devicesData = devicesText ? JSON.parse(devicesText) : 0;
        setActiveUsers(devicesData);

        // Connected devices
        const connectedRes = await fetch(`${BASE_URL}session/all`, {
          credentials: 'include'
        });
        const connectedText = await connectedRes.text();
        const connectedData = connectedText ? JSON.parse(connectedText) : {};
        setConnectedDevices(Object.keys(connectedData).length);

        // Active counters
        const countersRes = await fetch(`${BASE_URL}server/counters`, {
          credentials: 'include'
        });
        const countersText = await countersRes.text();
        const countersData = countersText ? JSON.parse(countersText) : [];
        setActiveCounters(
          Array.isArray(countersData)
            ? countersData.filter((c: { status: string }) => c.status?.toLowerCase() === "active").length
            : 0
        );

        // Summary Table
<<<<<<< HEAD
        const summaryRes = await fetch(`${API_BASE}/server/dashboard/summary`, {
          credentials: "include",
=======
        const summaryRes = await fetch(`${BASE_URL}server/dashboard/summary`, {
          credentials: 'include'
>>>>>>> upstream/main
        });
        const summaryText = await summaryRes.text();
        const summaryData = summaryText ? JSON.parse(summaryText) : {};
        setSummary({
          requestsToday: summaryData.requestsToday ?? 0,
          avgWaitTime: summaryData.avgWaitTime ?? 0,
          totalUptime: summaryData.totalUptime ?? 0,
        });

        // Fetch QR codes
<<<<<<< HEAD
        const qrRes = await fetch(`${API_BASE}/server/qr`, {
          credentials: "include",
=======
        const qrRes = await fetch(`${BASE_URL}server/qr`, {
          credentials: 'include'
>>>>>>> upstream/main
        });
        const qrText = await qrRes.text();
        const qrObj = qrText ? JSON.parse(qrText) : {};
        setQrData(qrObj && typeof qrObj === "object" ? qrObj : {});
      } catch (err) {
        // ...existing error handling...
        setQrData({});
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card-row">
        <DashboardCard
          title="Current Queue Status"
          subtitle="Users in Queue"
          value={`${queueData.usersInQueue} Users`}
          subtitle2="Last applicant entered"
          value2={`${queueData.lastSession ?? "None"}`}
          icon={
            <img
              src="/icons/currentQueueStatus.svg"
              alt="Users"
              className="dashboard-icon"
            />
          }
        />
        <DashboardCard
          title="Active Applicants"
          subtitle="Submitted Forms"
          value={`${activeUsers} Applicants`}
          icon={
            <img
              src="/icons/activeUsers.svg"
              alt="Users"
              className="dashboard-icon"
            />
          }
        />
        <DashboardCard
          title="Total Sessions"
          subtitle="All Active Sessions"
          value={`${connectedDevices} Sessions`}
          icon={
            <img
              src="/icons/activeUsers.svg"
              alt="Devices"
              className="dashboard-icon"
            />
          }
        />
        <DashboardCard
          title="Active Counters"
          subtitle="Currently Active"
          value={`${activeCounters} Counters`}
          icon={
            <img
              src="/icons/activeUsers.svg"
              alt="Counters"
              className="dashboard-icon"
            />
          }
        />
      </div>

      <div className="summary-bar">
        <div className="summary-item">
          <p className="summary-label">
            <img
              src="/icons/requestToday.svg"
              alt="Requests"
              className="inline w-4 h-4 mr-1 align-middle"
            />
            Requests Today
          </p>
          <p className="summary-value">{`${summary.requestsToday} Requests`}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">
            <img
              src="/icons/avgWaitTime.svg"
              alt="Requests"
              className="inline w-4 h-4 mr-1 align-middle"
            />
            Average Wait Time
          </p>
          <p className="summary-value">{`${summary.avgWaitTime} minutes`}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">
            <img
              src="/icons/totalUptime.svg"
              alt="Requests"
              className="inline w-4 h-4 mr-1 align-middle"
            />
            Total Uptime
          </p>
          <p className="summary-value">{`${summary.totalUptime} hours`}</p>
        </div>
      </div>

      {/*QR Code Placeholders */}
      <div
        className="dashboard-card-row"
        style={{
          marginTop: "60px",
          marginBottom: "60px",
          alignItems: "flex-start",
          gap: "150px",
        }}
      >
        {qrData.qr3001 || qrData.qr3002 ? (
          [
            { qr: qrData.qr3001, url: qrData.url3001, label: "Applicant" },
            { qr: qrData.qr3002, url: qrData.url3002, label: "Counter" },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <h2 className="card-title" style={{ fontSize: "16px" }}>
                {item.label}
              </h2>
              <div
                className="qr-placeholder"
                style={{
                  width: 250,
                  height: 250,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#232b36",
                  borderRadius: 20,
                }}
              >
                {item.qr ? (
                  <img
                    src={item.qr}
                    alt={item.label}
                    style={{
                      width: "80%",
                      height: "80%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                ) : (
                  <QrCode
                    style={{ width: "80%", height: "80%" }}
                    className="qr-placeholder-icon"
                  />
                )}
              </div>
              {item.url && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    wordBreak: "break-all",
                    textAlign: "center",
                  }}
                >
                  <span>{item.url}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          // Fallback to placeholders if no QR codes
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <h2 className="card-title" style={{ fontSize: "16px" }}></h2>
              <div
                className="qr-placeholder"
                style={{
                  width: 250,
                  height: 250,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#232b36",
                  borderRadius: 20,
                }}
              >
                <QrCode
                  style={{ width: "80%", height: "80%" }}
                  className="qr-placeholder-icon"
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <h2 className="card-title" style={{ fontSize: "16px" }}></h2>
              <div className="qr-placeholder">
                <QrCode className="qr-placeholder-icon" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
