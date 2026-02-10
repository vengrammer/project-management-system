
import { Routes, Route, Navigate } from "react-router-dom"
import NotFound from "@/components/Notfound"
// import HomeLayout from "@/layout/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
//import ProjectTable from "@/pages/admin/MyProjectTable";
import AdminTable from "@/pages/admin/UsersTable"; 
import ProjectTable from "@/pages/admin/ProjectTable";
import SampleSidebar from "@/layout/SampleSideBar";

function HomeRoute() {
    return (
      <Routes>
        <Route element={<SampleSidebar />}>
          <Route
            path="/"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="myprojects" element={<ProjectTable />} />
          <Route path="users" element={<AdminTable />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
}
export default HomeRoute;