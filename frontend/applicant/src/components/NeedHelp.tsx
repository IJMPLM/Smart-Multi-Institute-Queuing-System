import React, { useState } from "react";
import HelpChatbot from "./HelpChatbot"; // 👈 import it since it’s in the same folder

export function NeedHelp({ message = "Need Help?" }) {
  const [showHelp, setShowHelp] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false); // 👈 new state for chatbot

  return (
    <div className="mb-6 relative">
      {/* Button that toggles help message */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        type="button"
      >
        <div className="w-6 h-6 rounded-full border-2 border-gray-700 flex items-center justify-center">
          <span className="text-sm font-semibold">?</span>
        </div>
        <span className="text-sm italic">Need Help?</span>
      </button>

      {/* The small yellow message */}
      {showHelp && (
        <div className="absolute top-0 left-32 bg-amber-50 border border-amber-200 rounded px-3 py-2 shadow-md z-10 text-xs whitespace-nowrap text-gray-800">
          {message}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.dispatchEvent(new Event("openHelpChat"));
            }}
            className="ml-2 underline text-blue-700"
          >
            Open Chat
          </button>
        </div>
      )}

      {/* Floating chatbot window */}
      {showChatbot && (
        <HelpChatbot
          onClose={() => setShowChatbot(false)} // 👈 close chatbot
        />
      )}
    </div>
  );
}
