import { Routes, Route, Navigate } from "react-router-dom";
import EmployeeSideBar from "@/layout/EmployeeSideBar";
import ProjectTableEmployee from "@/pages/employee/ProjectTableEmployee";
import ProjectDetailsPage from "@/pages/admin/ProjectDetailsPage";
import Acrhive from "@/pages/employee/archive";
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
import Profile from "@/pages/admin/Profile";

function EmployeeRoute() {
     return (
       <Routes>
         <Route element={<EmployeeSideBar />}>
           <Route
             path="/"
             element={<Navigate to="/employee/dashboard" replace />}
           />
           <Route path="projects" element={<ProjectTableEmployee />} />
           <Route path="archive" element={<Acrhive />} />
           <Route path="dashboard" element={<EmployeeDashboard />} />
           <Route path="profile" element={<Profile />} />
         </Route>
         <Route path="projectdetails/:id" element={<ProjectDetailsPage />} />
       </Routes>
     );
}
export default EmployeeRoute;