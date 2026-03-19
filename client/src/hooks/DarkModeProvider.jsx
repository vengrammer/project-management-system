// DarkModeProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context to share dark mode state
const DarkModeContext = createContext();

export const useDarkMode = () => useContext(DarkModeContext);

export default function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(false);

  // On mount, read dark mode from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('dark-mode');
    if (stored !== null) {
      setDark(stored === 'true'); // convert string to boolean
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDark(prefersDark);
    }
  }, []);

  // Update the <html> class and localStorage whenever dark changes
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');

    localStorage.setItem('dark-mode', dark);
  }, [dark]);

  const toggleDark = () => setDark(prev => !prev);

  return (
    <DarkModeContext.Provider value={{ dark, toggleDark }}>
      {children}
    </DarkModeContext.Provider>
  );
}