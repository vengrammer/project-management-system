import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "@/components/Notfound";
// import ProjectTable from "@/pages/admin/ProjectTable";
import PmSidebar from "@/layout/PmSidebar";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import ProjectDetailsPage from "@/pages/admin/ProjectDetailsPage";
import Profile from "@/pages/admin/Profile";
import ProjectTableManager from "@/pages/manager/ProjectTableManager";
import ProtectedRoute from "./ProtectedRoute";
import ArchiveAdminEmployeeManager from "@/pages/admin/ArchiveAdminEmployeeManager";
import Notification from "@/pages/admin/Notification";
import CalendaMentions from "@/pages/CalendarMentions";



import ProjectManagerDashboard from "@/pages/project_manager/ProjectManagerDashboard";

function ProjectManagerRoute() {
    return (
        <ProtectedRoute requiredRole="pm">
            <Routes>
                <Route element={< PmSidebar />}>
                    <Route
                        path="/"
                        element={<Navigate to="/projectmanager/dashboard" replace />}
                    />
                    <Route path="dashboard" element={<ProjectManagerDashboard />} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </ProtectedRoute>
    );
}

export default ProjectManagerRoute;