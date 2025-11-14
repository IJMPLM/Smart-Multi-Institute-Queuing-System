// frontend/server/app/page.tsx

"use client";
import React, { useState, useEffect } from "react";
import DashboardCard from "@/components/DashboardCard";
import "../styles/globals.css";

interface SessionData {
  usersInQueue: number;
  nextInLine: number;
}

interface SummaryData {
  requestsToday: number;
  avgWaitTime: number;
  totalUptime: number;
}

export default function DashboardPage() {
  const [queueData, setQueueData] = useState<SessionData>({ usersInQueue: 0, nextInLine: 0 });
  const [activeUsers, setActiveUsers] = useState(0);
  const [connectedDevices, setConnectedDevices] = useState(0);
  const [activeCounters, setActiveCounters] = useState(0);
  const [summary, setSummary] = useState<SummaryData>({ requestsToday: 0, avgWaitTime: 0, totalUptime: 0 });

  const BASE_URL = "http://localhost:4000/api";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        

        // Current Queue Status
        const sessionRes = await fetch(`${BASE_URL}/queue`); // TODO: Fetch queue data
        const sessionText = await sessionRes.text();
        const sessionData = sessionText ? JSON.parse(sessionText) : {};
        setQueueData({
          usersInQueue: sessionData.usersInQueue ?? 0,
          nextInLine: sessionData.nextInLine ?? 0,
        });

        // Active users
        const devicesRes = await fetch(`${BASE_URL}/users`); // TODO: Fetch active USERS data
        const devicesText = await devicesRes.text();
        const devicesData = devicesText ? JSON.parse(devicesText) : [];
        setActiveUsers(Array.isArray(devicesData) ? devicesData.length : 0);

        // Connected devices
        const connectedRes = await fetch(`${BASE_URL}/devices`); // DONE: fetch connected devices data
        const connectedText = await connectedRes.text();
        const connectedData = connectedText ? JSON.parse(connectedText) : [];
        setConnectedDevices(Array.isArray(connectedData) ? connectedData.length : 0);

        // Active counters
        const countersRes = await fetch(`${BASE_URL}/counters`); // TODO: Fetch COUNTERS data
        const countersText = await countersRes.text();
        const countersData = countersText ? JSON.parse(countersText) : [];
        setActiveCounters(
          Array.isArray(countersData)
            ? countersData.filter((c: { status: string }) => c.status?.toLowerCase() === "online").length
            : 0
        );

        // Summary Table
        const summaryRes = await fetch(`${BASE_URL}/summary`); // TODO: Fetch summary data
        const summaryText = await summaryRes.text();
        const summaryData = summaryText ? JSON.parse(summaryText) : {};
        setSummary({
          requestsToday: summaryData.requestsToday ?? 0,
          avgWaitTime: summaryData.avgWaitTime ?? 0,
          totalUptime: summaryData.totalUptime ?? 0,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setQueueData({ usersInQueue: 0, nextInLine: 0 });
        setActiveUsers(0);
        setConnectedDevices(0);
        setActiveCounters(0);
        setSummary({ requestsToday: 0, avgWaitTime: 0, totalUptime: 0 });
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
          subtitle2="Next in Line"
          value2={`Queue No. ${queueData.nextInLine}`}
          icon={<img src="/icons/currentQueueStatus.svg" alt="Users" className="dashboard-icon" />}
        />
        <DashboardCard
          title="Active Users"
          subtitle="Currently Active"
          value={`${activeUsers} Users`}
          icon={<img src="/icons/activeUsers.svg" alt="Users" className="dashboard-icon" />}
        />
        <DashboardCard
          title="Connected Devices"
          subtitle="Currently Active"
          value={`${connectedDevices} Devices`}
          icon={<img src="/icons/activeUsers.svg" alt="Devices" className="dashboard-icon" />}
        />
        <DashboardCard
          title="Active Counters"
          subtitle="Currently Active"
          value={`${activeCounters} Counters`}
          icon={<img src="/icons/activeUsers.svg" alt="Counters" className="dashboard-icon" />}
        />
      </div>

      <div className="summary-bar">
        <div className="summary-item">
          <p className="summary-label">
            <img src="/icons/requestToday.svg" alt="Requests" className="inline w-4 h-4 mr-1 align-middle" />
            Requests Today
          </p>
          <p className="summary-value">{`${summary.requestsToday} Requests`}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">
            <img src="/icons/avgWaitTime.svg" alt="Requests" className="inline w-4 h-4 mr-1 align-middle" />
            Average Wait Time
          </p>
          <p className="summary-value">{`${summary.avgWaitTime} minutes`}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">
            <img src="/icons/totalUptime.svg" alt="Requests" className="inline w-4 h-4 mr-1 align-middle" />
            Total Uptime
          </p>
          <p className="summary-value">{`${summary.totalUptime} hours`}</p>
        </div>
      </div>
    </div>
  );
}
