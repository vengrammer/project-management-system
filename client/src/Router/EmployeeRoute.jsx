import { Routes, Route, Navigate } from "react-router-dom";
import EmployeeSideBar from "@/layout/EmployeeSideBar";
import ProjectTableEmployee from "@/pages/employee/ProjectTableEmployee";
import ProjectDetailsPage from "@/pages/admin/ProjectDetailsPage";

function EmployeeRoute() {
     return (
       <Routes>
         <Route element={<EmployeeSideBar />}>
           <Route
             path="/"
             element={<Navigate to="/employee/projects" replace />}
           />
           <Route path="projects" element={<ProjectTableEmployee />} />
         </Route>
         <Route path="projectdetails/:id" element={<ProjectDetailsPage />} />
       </Routes>
     );
}
export default EmployeeRoute;