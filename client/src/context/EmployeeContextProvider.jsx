import { createContext, useState, useContext, useEffect } from "react";

const EmployeeContext = createContext({
  employee: null,
  token: null,
  setEmployee: () => {},
  setToken: () => {},
  notification: "",
  setNotification: () => {},
});

export function EmployeeContextProvider({ children }) {
  const [employee, setEmployee] = useState(() => {
    // Optional: load employee info from localStorage if you store it
    const saved = localStorage.getItem("employee_info");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setTokenState] = useState(() =>
    localStorage.getItem("employee_token"),
  );
  
  const [notification, setNotificationState] = useState("");

  // Keep token in sync with localStorage
  const setToken = (newToken) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("employee_token", newToken);
    } else {
      localStorage.removeItem("employee_token");
    }
  };

  // Optional: save employee info to localStorage
  useEffect(() => {
    if (employee) {
      localStorage.setItem("employee_info", JSON.stringify(employee));
    } else {
      localStorage.removeItem("employee_info");
    }
  }, [employee]);

  // Notification helper
  const showNotification = (message, duration = 5000) => {
    setNotificationState(message);
    setTimeout(() => setNotificationState(""), duration);
  };

  return (
    <EmployeeContext.Provider
      value={{
        employee,
        token,
        setEmployee,
        setToken,
        notification,
        setNotification: showNotification,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

// Custom hook for easier usage
export const useEmployeeContext = () => useContext(EmployeeContext);