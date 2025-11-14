import React from 'react';
import { Search, UserCheck, Users, Ticket, List } from 'lucide-react';

// Mock data for the queue list
const queueData = [
  { queueNo: 'A001', name: 'John Smith', request: 'Document Request', status: 'In Progress' },
  { queueNo: 'A002', name: 'Sarah Johnson', request: 'Inquiry', status: 'Waiting' },
  { queueNo: 'A003', name: 'Michael Brown', request: 'Payment Processing', status: 'Waiting' },
  { queueNo: 'A004', name: 'Emily Davis', request: 'Document Request', status: 'Waiting' },
  { queueNo: 'A005', name: 'David Wilson', request: 'Application Submission', status: 'Waiting' },
];

const Dashboard = () => {
  return (
    <div className="p-8 bg-[#F6F6E9] min-h-screen">
      
        {/* Search Bar */}
      <div className="flex justify-end mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search queue..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 bg-white" // <-- Add bg-white here
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
          <p className="text-5xl font-bold text-blue-600 mt-4">A001</p>
        </div>

        {/* Next in Line Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500">
            <Users size={20} />
            <h3 className="text-lg font-medium">Next in Line</h3>
          </div>
          <p className="text-5xl font-bold text-green-600 mt-4">A002</p>
        </div>

        {/* In Queue Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500">
            <Ticket size={20} />
            <h3 className="text-lg font-medium">In Queue</h3>
          </div>
          <p className="text-5xl font-bold text-gray-800 mt-4">4</p>
        </div>
      </div>

      {/* Current Status Card */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Current Status for Counter</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name of Person Being Processed</p>
            <p className="text-2xl font-semibold text-green-600">John Smith</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Queue No. Being Processed</p>
            <p className="text-2xl font-semibold text-blue-600">A001</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Next in Line Queue No.</p>
            <p className="text-2xl font-semibold text-gray-700">A002</p>
          </div>
        </div>
      </div>

      {/* Active Queue List Table */}
      <div className="bg-white rounded-lg shadow-md mt-6 overflow-x-auto">
        <h3 className="text-xl font-bold text-gray-800 p-6">Active Queue List</h3>
        <table className="w-full min-w-max">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">Queue No.</th>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">Name</th>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">Request</th>
              <th className="text-left text-sm font-semibold text-gray-600 p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {queueData.map((item, index) => (
              <tr key={item.queueNo} className="even:bg-yellow-50/50 border-b border-gray-100">
                <td className="p-4 text-gray-700 font-medium">{item.queueNo}</td>
                <td className="p-4 text-gray-700">{item.name}</td>
                <td className="p-4 text-gray-700">{item.request}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'In Progress'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;