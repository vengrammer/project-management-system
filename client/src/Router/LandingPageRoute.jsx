import LandingPageLayout from "@/landing/LandingPageLayout.jsx"
import { Routes, Route } from "react-router-dom"
import NotFound from "@/components/Notfound"
import Login from "@/components/Login";

function LandingPageRoute(){
    return (
        <Routes>
            <Route element={<LandingPageLayout />}>
                <Route path="login" element={<Login />} />
                <Route path="/" element={<Login />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}
export default LandingPageRoute;