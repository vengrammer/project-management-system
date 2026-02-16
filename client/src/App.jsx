import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPageRoute from "./Router/LandingPageRoute";
import NotFound from "./components/NotFound";
import HomeRoute from "./Router/AdminRoute";

import { AdminContextProvider } from "./context/AdminContextProvider";
import { EmployeeContextProvider } from "./context/EmployeeContextProvider";
import ProjectDetailsPage from "./pages/admin/ProjectDetailsPage";
import TaskActivityPage from "@/pages/admin/TaskActivityPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <BrowserRouter>
      <AdminContextProvider>
        <EmployeeContextProvider>
          <Routes>
            <Route path="/*" element={<LandingPageRoute />} />
            <Route path="admin/*" element={<HomeRoute />} />
            <Route path="*" element={<NotFound />} />
            <Route path="projectdetails/:id" element={<ProjectDetailsPage />} />
            <Route path="taskactivity" element={<TaskActivityPage />} />
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
        </EmployeeContextProvider>
      </AdminContextProvider>
    </BrowserRouter>
  );
}
export default App;