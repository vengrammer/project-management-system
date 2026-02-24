import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPageRoute from "./Router/LandingPageRoute";
import NotFound from "./components/NotFound";
import AdminRoute from "./Router/AdminRoute";
import ProjectDetailsPage from "./pages/admin/ProjectDetailsPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmployeeRoute from "./Router/EmployeeRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<LandingPageRoute />} />
        <Route path="admin/*" element={<AdminRoute />} />
        <Route path="employee/*" element={<EmployeeRoute />} />
        <Route path="*" element={<NotFound />} />
        
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </BrowserRouter>
  );
}
export default App;
