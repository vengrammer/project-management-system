import React, { createContext, useContext, useState, useEffect } from 'react';


const DarkModeContext = createContext();

export const useDarkMode = () => useContext(DarkModeContext);

export default function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(false);

  
  useEffect(() => {
    const stored = localStorage.getItem('dark-mode');
    if (stored !== null) {
      setDark(stored === 'true'); 
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDark(prefersDark);
    }
  }, []);

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