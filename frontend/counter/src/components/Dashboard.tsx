"use client";

import React, { useState, useEffect } from "react";
import { Search, UserCheck, Users, Ticket, List } from "lucide-react";

interface QueueApplicant {
  position: number;
  sessionId: string;
  name: string;
  document: string;
  isPriority: boolean;
  dateSubmitted: string;
  dateClosed?: string;
  dateProcessing?: string;
}

interface CounterQueue {
  counterId: string;
  counterName: string;
  applicants: QueueApplicant[];
}

interface QueueData {
  queueDistribution: CounterQueue[];
  statistics: {
    totalActiveCounters: number;
    totalWaitingApplicants: number;
    priorityApplicants: number;
    regularApplicants: number;
  };
  currentCounterId: string;
}
<<<<<<< HEAD

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_BASE = `${BASE_URL}/api/`;
=======
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || `http://localhost:4000/api/`
>>>>>>> upstream/main

const Dashboard = () => {
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [currentQueue, setCurrentQueue] = useState<CounterQueue | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueueData = async () => {
    try {
      const statusResponse = await fetch(`${API_BASE}queue/status`, {
        credentials: "include",
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setQueueData(statusData.data);

        // Find current counter's queue using the currentCounterId from backend
        const counterQueue =
          statusData.data.queueDistribution.find(
            (q: CounterQueue) =>
              q.counterId === statusData.data.currentCounterId
          ) || null;
        setCurrentQueue(counterQueue);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching queue data:", error);
      setLoading(false);
    }
  };

  const inProgressApplicant =
    currentQueue?.applicants.find((a) => a.dateProcessing && !a.dateClosed) ||
    null;
  const waitingApplicants =
    currentQueue?.applicants.filter(
      (a) => !a.dateProcessing && !a.dateClosed
    ) || [];
  const nextInLine = waitingApplicants[0] || null;
  const inQueueCount = waitingApplicants.length;

  const filteredQueue =
    currentQueue?.applicants.filter(
      (applicant) =>
        applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.document.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (loading) {
    return (
      <div className="p-8 bg-[#F6F6E9] min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading queue data...</p>
      </div>
    );
  }
  return (
    <div className="p-8 bg-[#F6F6E9] min-h-screen">
      {/* Search Bar */}
      <div className="flex justify-end mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search queue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 bg-white text-gray-900"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* In Progress Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500">
            <UserCheck size={20} />
            <h3 className="text-lg font-medium">In Progress</h3>
          </div>
          <p className="text-5xl font-bold text-blue-600 mt-4">
            {inProgressApplicant ? `#${inProgressApplicant.position}` : "-"}
          </p>
        </div>

        {/* Next in Line Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500">
            <Users size={20} />
            <h3 className="text-lg font-medium">Next in Line</h3>
          </div>
          <p className="text-5xl font-bold text-green-600 mt-4">
            {nextInLine ? `#${nextInLine.position}` : "-"}
          </p>
        </div>

        {/* In Queue Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500">
            <Ticket size={20} />
            <h3 className="text-lg font-medium">In Queue</h3>
          </div>
          <p className="text-5xl font-bold text-gray-800 mt-4">
            {inQueueCount}
          </p>
        </div>
      </div>

      {/* Current Status Card */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Current Status for Counter
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">
              Name of Person Being Processed
            </p>
            <p className="text-2xl font-semibold text-green-600">
              {inProgressApplicant
                ? inProgressApplicant.name
                : "No one in progress"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Queue No. Being Processed</p>
            <p className="text-2xl font-semibold text-blue-600">
              {inProgressApplicant ? `#${inProgressApplicant.position}` : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Next in Line Queue No.</p>
            <p className="text-2xl font-semibold text-gray-700">
              {nextInLine ? `#${nextInLine.position}` : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Active Queue List Table */}
      <div className="bg-white rounded-lg shadow-md mt-6 overflow-x-auto">
        <h3 className="text-xl font-bold text-gray-800 p-6">
          Active Queue List
        </h3>
        <table className="w-full min-w-max">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">
                Queue No.
              </th>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">
                Name
              </th>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">
                Request
              </th>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredQueue.length > 0 ? (
              filteredQueue.map((item, index) => {
                const status = item.dateClosed
                  ? "Closed"
                  : item.dateProcessing
                  ? "Processing"
                  : "In Line";

                const statusStyles = item.dateClosed
                  ? "bg-gray-100 text-gray-800"
                  : item.dateProcessing
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800";

                return (
                  <tr
                    key={item.sessionId}
                    className="even:bg-yellow-50/50 border-b border-gray-100"
                  >
                    <td className="p-4 text-gray-700 font-medium">
                      #{item.position}
                    </td>
                    <td className="p-4 text-gray-700">{item.name}</td>
                    <td className="p-4 text-gray-700">{item.document}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles}`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No applicants in queue
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
