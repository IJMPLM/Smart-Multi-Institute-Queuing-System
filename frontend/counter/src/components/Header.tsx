import React from 'react';
import { LayoutDashboard, User, LogOut } from 'lucide-react';

const Header = () => {
  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      {/* Logo/Title */}
      <div className="text-xl font-bold">
        Counter Admin
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors">
          <LayoutDashboard size={18} />
          Dashboard
        </button>
        <button className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-500 transition-colors">
          <User size={18} />
          Applicant
        </button>
        <button className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-500 transition-colors">
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </nav>
  );
};

export default Header;