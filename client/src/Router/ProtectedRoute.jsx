import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  if (!token) {
    return <Navigate to="/landingpage" replace />;
  }

  // If a specific role is required, check if user has it
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on their actual role
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === "manager") {
      return <Navigate to="/manager/dashboard" replace />;
    } else if (user?.role === "user") {
      return <Navigate to="/employee/dashboard" replace />;
    }
    return <Navigate to="/landingpage" replace />;
  }

  return children;
};

export default ProtectedRoute;
