
import { Routes, Route, Navigate } from "react-router-dom"
import NotFound from "@/components/Notfound"
import HomeLayout from "@/layout/HomeLayout";
import Dashboard from "@/pages/admin/Dashboard";
import ProjectTable from "@/pages/admin/MyProjectTable";
import SuperAdminsTable from "@/pages/admin/SuperAdminsTable";


function HomeRoute() {
    return (
      <Routes>
        <Route element={<HomeLayout />}>
          <Route
            path="/"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="myprojects" element={<ProjectTable />} />
          <Route path="superadmin" element={<SuperAdminsTable />} />
          
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
}
export default HomeRoute;