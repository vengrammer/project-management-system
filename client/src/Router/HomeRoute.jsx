
import { Routes, Route, Navigate } from "react-router-dom"
import NotFound from "@/components/Notfound"
import HomeLayout from "@/layout/HomeLayout";
import Dashboard from "@/pages/Dashboard";

function HomeRoute() {
    return (
        <Routes>
            <Route element={<HomeLayout />}>
                <Route path="/" element={<Navigate to="/workspace/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} /> 
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}
export default HomeRoute;