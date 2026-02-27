
import { Routes, Route, Navigate } from "react-router-dom"
import NotFound from "@/components/Notfound"
// import HomeLayout from "@/layout/AdminLayout";
//import Dashboard from "@/pages/admin/AdminDashboard";
//import ProjectTable from "@/pages/admin/MyProjectTable";
import UsersTable from "@/pages/admin/UsersTable"; 
import ProjectTable from "@/pages/admin/ProjectTable";
import AdminSidebar from "@/layout/AdminSideBar";
import DepartmentTable from "@/pages/admin/DepartmentTable";
import PracticeComponent from "@/pages/admin/PracticeComponent";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ProjectDetailsPage from "@/pages/admin/ProjectDetailsPage";
import Profile from "@/pages/admin/Profile";


function HomeRoute() {
    return (
      <Routes>
        <Route element={<AdminSidebar />}>
          <Route
            path="/"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="projects" element={<ProjectTable />} />
          <Route path="users" element={<UsersTable />} />
          <Route path="department" element={<DepartmentTable />} />
          <Route path="practice" element={<PracticeComponent />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
        <Route path="projectdetails/:id" element={<ProjectDetailsPage />} />
      </Routes>
    );
}
export default HomeRoute;