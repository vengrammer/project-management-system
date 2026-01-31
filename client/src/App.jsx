
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPageRoute from "./Router/LandingPageRoute";
import NotFound from "./components/NotFound";
import HomeRoute from "./Router/AdminRoute";

import { AdminContextProvider } from "./context/AdminContextProvider";
import {EmployeeContextProvider} from "./context/EmployeeContextProvider";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
function App() {
  return (
    <BrowserRouter>
      <AdminContextProvider>
        <EmployeeContextProvider>
          <Routes>
            <Route path="/*" element={<LandingPageRoute />} />
            <Route path="admin/*" element={<HomeRoute />} />
            <Route path="*" element={<NotFound />} />
            <Route path="projectdetails" element={<ProjectDetailsPage />}/>
          </Routes>
        </EmployeeContextProvider>
      </AdminContextProvider>
    </BrowserRouter>
  );
}
export default App