import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  console.log("Auth state in ProtectedRoute:", { token, user });
  if (!token) {
    return <Navigate to="/landingpage" replace />;
  }

  // If required role and user not yet loaded, render children while user is fetched
  if (requiredRole && !user) {
    return children;
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
