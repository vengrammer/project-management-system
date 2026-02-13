import LandingPageLayout from "@/landing/LandingPageLayout.jsx"
import { Routes, Route, Navigate } from "react-router-dom"
import NotFound from "@/components/Notfound"
import LandingPageHome from "@/pages/admin/LandingPageHome";

function LandingPageRoute() {
    return (
        <Routes>
            <Route element={<LandingPageLayout />}>
                <Route path="/" element={<Navigate to="/landingpage" replace />} />
                <Route path="landingpage" element={<LandingPageHome />} />      
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}
export default LandingPageRoute;