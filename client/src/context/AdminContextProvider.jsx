import { createContext, useState, useContext, useEffect } from "react";

const AdminContext = createContext({
  admin: null,
  token: null,
  setAdmin: () => {},
  setToken: () => {},
  notification: "",
  setNotification: () => {},
});

export function AdminContextProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    // Optional: load employee info from localStorage if you store it
    const saved = localStorage.getItem("admin_info");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setTokenState] = useState(() =>
    localStorage.getItem("admin_token"),
  );
  const [notification, setNotificationState] = useState("");

  // Keep token in sync with localStorage
  const setToken = (newToken) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("admin_token", newToken);
    } else {
      localStorage.removeItem("admin_token");
    }
  };

  // Optional: save employee info to localStorage
  useEffect(() => {
    if (admin) {
      localStorage.setItem("admin_info", JSON.stringify(admin));
    } else {
      localStorage.removeItem("admin_info");
    }
  }, [admin]);

  // Notification helper
  const showNotification = (message, duration = 5000) => {
    setNotificationState(message);
    setTimeout(() => setNotificationState(""), duration);
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        token,
        setAdmin,
        setToken,
        notification,
        setNotification: showNotification,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

// Custom hook for easier usage
export const useAdminContext = () => useContext(AdminContext);