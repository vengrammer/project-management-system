import LandingPageLayout from "@/landing/LandingPageLayout.jsx"
import { Routes, Route, Navigate } from "react-router-dom"
import NotFound from "@/components/Notfound"
import LandingPageHome from "@/pages/admin/LandingPageHome";
import { useSelector } from "react-redux";

function LandingPageRoute() {

   const token = useSelector((state) => state.auth.token);
   const user = useSelector((state) => state.auth.user);

   console.log("Auth state in LandingPageRoute:", { token, user });

    // If user is already logged in, redirect to their respective dashboard
    if (token && user) {
      if (user.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      }
      else if (user.role === "manager") {
        return <Navigate to="/manager/dashboard" replace />;
      }
      else if (user.role === "user") {
        return <Navigate to="/employee/dashboard" replace />;
      }
    }
    
    return (
     
        <Routes>
          <Route element={<LandingPageLayout />}>
            <Route path="/" element={<Navigate to="/landingpage" replace />} />
            <Route path="landingpage" element={<LandingPageHome />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
export default LandingPageRoute;