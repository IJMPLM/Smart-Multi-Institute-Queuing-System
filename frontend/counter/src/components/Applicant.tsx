"use client";

import React, { useState, useEffect } from "react";
import {
  FaCheck,
  FaExclamationTriangle,
  FaTimes,
  FaClock,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";
import PopUp from "@/components/PopUp";

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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const API_BASE = `${BASE_URL}/api/`;

const Applicant = () => {
  const [inProgressApplicant, setInProgressApplicant] =
    useState<QueueApplicant | null>(null);
  const [nextInLine, setNextInLine] = useState<QueueApplicant | null>(null);
  const [inQueueCount, setInQueueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isProcessPopUpOpen, setIsProcessPopUpOpen] = useState(false);
  const [isMissingPopUpOpen, setIsMissingPopUpOpen] = useState(false);
  const [isClosePopUpOpen, setIsClosePopUpOpen] = useState(false);

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchQueueData = async () => {
    try {
      const response = await fetch(`${API_BASE}queue/status`, {
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();

        // Find current counter's queue using currentCounterId
        const counterQueue = result.data.queueDistribution.find(
          (q: any) => q.counterId === result.data.currentCounterId
        );

        if (counterQueue && counterQueue.applicants.length > 0) {
          // Find the applicant currently being processed
          const processing = counterQueue.applicants[0];

          // Find waiting applicants (not processing, not closed)
          const waiting = counterQueue.applicants[1];

          setInProgressApplicant(processing || null);
          setNextInLine(waiting[0] || null);
          setInQueueCount(waiting.length);
        } else {
          setInProgressApplicant(null);
          setNextInLine(null);
          setInQueueCount(0);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching queue data:", error);
      setLoading(false);
    }
  };

  const handleProcessConfirm = async () => {
    if (!inProgressApplicant) return;

    try {
      const response = await fetch(`${API_BASE}applicant/process`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ sessionId: inProgressApplicant.sessionId }),
      });

      if (response.ok) {
        setIsProcessPopUpOpen(false);
        fetchQueueData(); // Refresh the queue
      } else {
        const error = await response.json();
        alert(
          `Failed to process applicant: ${error.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error processing applicant:", error);
      alert("Error processing applicant");
    }
  };

  const handleMissingConfirm = async () => {
    if (!inProgressApplicant) return;

    try {
      const response = await fetch(`${API_BASE}applicant/missing`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ sessionId: inProgressApplicant.sessionId }),
      });

      if (response.ok) {
        setIsMissingPopUpOpen(false);
        fetchQueueData(); // Refresh the queue
      } else {
        const error = await response.json();
        alert(`Failed to mark as missing: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error marking as missing:", error);
      alert("Error marking as missing");
    }
  };

  const handleCloseConfirm = async () => {
    if (!inProgressApplicant) return;

    try {
      const response = await fetch(`${API_BASE}applicant/closed`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ sessionId: inProgressApplicant.sessionId }),
      });

      if (response.ok) {
        setIsClosePopUpOpen(false);
        fetchQueueData(); // Refresh the queue
      } else {
        const error = await response.json();
        alert(`Failed to close request: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error closing request:", error);
      alert("Error closing request");
    }
  };

  if (loading) {
    return (
      <div className="bg-amber-50 p-6 md:p-10 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading queue...</p>
      </div>
    );
  }

  return (
    // Main container with the light cream/yellow background
    <div className="bg-amber-50 p-6 md:p-10 min-h-screen">
      {/* Top Row: 3 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Card 1: In Progress */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <FaClock className="text-gray-400 text-3xl" />
          <div>
            <h3 className="text-gray-500 text-sm font-medium">In Progress</h3>
            <p className="text-4xl font-semibold text-blue-600">
              {inProgressApplicant ? `#${inProgressApplicant.position}` : "-"}
            </p>
          </div>
        </div>

        {/* Card 2: Next in Line */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <FaUserFriends className="text-gray-400 text-3xl" />
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Next in Line</h3>
            <p className="text-4xl font-semibold text-green-600">
              {nextInLine ? `#${nextInLine.position}` : "-"}
            </p>
          </div>
        </div>

        {/* Card 3: In Queue */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
          <FaUsers className="text-gray-400 text-3xl" />
          <div>
            <h3 className="text-gray-500 text-sm font-medium">In Queue</h3>
            <p className="text-4xl font-semibold text-gray-800">
              {inQueueCount}
            </p>
          </div>
        </div>
      </div>

      {/* Current Applicant Details */}
      <div className="bg-white p-10 rounded-lg shadow-md text-center mb-6">
        <h2 className="text-gray-500 text-sm uppercase tracking-wider font-semibold mb-4">
          Current Applicant
        </h2>

        <p className="text-5xl font-bold text-gray-900 mb-10">
          {inProgressApplicant
            ? inProgressApplicant.name
            : "No applicant in queue"}
        </p>

        {/* Applicant sub-details */}
        {inProgressApplicant && (
          <div className="flex flex-col md:flex-row justify-center md:justify-around items-center gap-8">
            <div className="text-center">
              <h4 className="text-gray-500 text-sm font-medium mb-1">
                Queue No.
              </h4>
              <p className="text-3xl font-semibold text-blue-600">
                #{inProgressApplicant.position}
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-gray-500 text-sm font-medium mb-1">
                Request
              </h4>
              <p className="text-3xl font-semibold text-gray-800">
                {inProgressApplicant.document}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => setIsProcessPopUpOpen(true)}
          disabled={!inProgressApplicant}
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-7 py-3 rounded-lg font-medium shadow-sm hover:bg-white hover:text-green-500 hover:border-1 hover:border-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaCheck />
          <span>Process</span>
        </button>

        <button
          onClick={() => setIsMissingPopUpOpen(true)}
          disabled={!inProgressApplicant}
          className="flex items-center justify-center gap-2 bg-orange-500 text-white px-7 py-3 rounded-lg font-medium shadow-sm hover:bg-white hover:text-orange-500 hover:border-1 hover:border-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaExclamationTriangle />
          <span>Missing</span>
        </button>

        <button
          onClick={() => setIsClosePopUpOpen(true)}
          disabled={!inProgressApplicant}
          className="flex items-center justify-center gap-2 bg-red-700 text-white px-7 py-3 rounded-lg font-medium shadow-sm hover:bg-white hover:text-red-700 hover:border-1 hover:border-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaTimes />
          <span>Close</span>
        </button>
      </div>

      {inProgressApplicant && (
        <>
          <PopUp
            isOpen={isProcessPopUpOpen}
            onClose={() => setIsProcessPopUpOpen(false)}
            onConfirm={handleProcessConfirm}
            applicantName={inProgressApplicant.name}
            applicantQueueNo={`#${inProgressApplicant.position}`}
            title="Start Processing?"
            message={`"You are about to mark this applicant as currently being processed."`}
            confirmText="Confirm"
            cancelText="Cancel"
            borderColor="border-green-500"
          />

          <PopUp
            isOpen={isMissingPopUpOpen}
            onClose={() => setIsMissingPopUpOpen(false)}
            onConfirm={handleMissingConfirm}
            applicantName={inProgressApplicant.name}
            applicantQueueNo={`#${inProgressApplicant.position}`}
            title="Mark Applicant as Missing?"
            message={`"This applicant did not respond. Do you want to mark #${inProgressApplicant.position} as missing?"`}
            confirmText="Confirm"
            cancelText="Cancel"
            borderColor="border-orange-500"
          />

          <PopUp
            isOpen={isClosePopUpOpen}
            onClose={() => setIsClosePopUpOpen(false)}
            onConfirm={handleCloseConfirm}
            applicantName={inProgressApplicant.name}
            applicantQueueNo={`#${inProgressApplicant.position}`}
            title="Close Request?"
            message={`"This will close the request of #${inProgressApplicant.position}. This action cannot be undone."`}
            confirmText="Confirm"
            cancelText="Cancel"
            borderColor="border-red-600"
          />
        </>
      )}
    </div>
  );
};

export default Applicant;
