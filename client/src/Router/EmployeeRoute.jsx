import { Routes, Route, Navigate } from "react-router-dom";
import EmployeeSideBar from "@/layout/EmployeeSideBar";
import ProjectTableEmployee from "@/pages/employee/ProjectTableEmployee";
import ProjectDetailsPage from "@/pages/admin/ProjectDetailsPage";
import Acrhive from "@/pages/employee/archive";
import Dashboard from "@/pages/employee/Dashboard";

function EmployeeRoute() {
     return (
       <Routes>
         <Route element={<EmployeeSideBar />}>
           <Route
             path="/"
             element={<Navigate to="/employee/projects" replace />}
           />
           <Route path="projects" element={<ProjectTableEmployee />} />
           <Route path="archive" element={<Acrhive />} />
           <Route path="dashboard" element={<Dashboard />} />
         </Route>
         <Route path="projectdetails/:id" element={<ProjectDetailsPage />} />
       </Routes>
     );
}
export default EmployeeRoute;