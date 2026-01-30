
import { Routes, Route, Navigate } from "react-router-dom"
import NotFound from "@/components/Notfound"
import HomeLayout from "@/layout/HomeLayout";
import Dashboard from "@/pages/Dashboard";
import ProjectTable from "@/pages/ProjectTable";

function HomeRoute() {
    return (
        <Routes>
            <Route element={<HomeLayout />}>
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} /> 
                <Route path="myprojects" element={<ProjectTable />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}
export default HomeRoute;