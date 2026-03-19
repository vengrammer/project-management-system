// DarkModeSwitch.jsx
import React from 'react';
import { useDarkMode } from './DarkModeProvider';

export default function DarkModeSwitch() {
  const { dark, toggleDark } = useDarkMode();

  return (
     <div className="relative inline-block ">

      {/* Button */}
      <button
        onClick={toggleDark}
        className="relative w-16 h-8 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer animate-pulse
                   bg-gray-300 dark:bg-gray-700 focus:outline-none group dark:border-yellow-400 border-2 border-black"
        aria-label="Toggle Dark Mode"
      >
        {/* The circle */}
        <span
          className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300
                      ${dark ? 'translate-x-8' : 'translate-x-0'}`}
        />
        {/* Optional icons */}
        <span className="absolute left-1 text-yellow-400 text-sm">{!dark && '☀️'}</span>
        <span className="absolute right-1 text-gray-200 text-sm">{dark && '🌙'}</span>
      </button>
    </div>
  );
}