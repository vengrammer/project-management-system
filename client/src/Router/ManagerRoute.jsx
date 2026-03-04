import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "@/components/Notfound";
// import ProjectTable from "@/pages/admin/ProjectTable";
import ManagerSideBar from "@/layout/ManagerSideBar";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import ProjectDetailsPage from "@/pages/admin/ProjectDetailsPage";
import Profile from "@/pages/admin/Profile";
import ProjectTableManager from "@/pages/manager/ProjectTableManager";
import ProtectedRoute from "./ProtectedRoute";
import ArchiveAdminEmployeeManager from "@/pages/admin/ArchiveAdminEmployeeManager";

function ManagerRoute() {
  return (
    <ProtectedRoute requiredRole="manager">
      <Routes>
        <Route element={<ManagerSideBar />}>
          <Route
            path="/"
            element={<Navigate to="/manager/dashboard" replace />}
          />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="projects" element={<ProjectTableManager />} />
          <Route path="archive" element={<ArchiveAdminEmployeeManager />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
        <Route path="projectdetails/:id" element={<ProjectDetailsPage />} />
        <Route
          path="archive/projectdetails/:id"
          element={<ProjectDetailsPage />}
        />
      </Routes>
    </ProtectedRoute>
  );
}

export default ManagerRoute;
