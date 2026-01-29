
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPageRoute from "./Router/LandingPageRoute";
import NotFound from "./components/NotFound";
import HomeRoute from "./Router/HomeRoute";

import { AdminContextProvider } from "./context/AdminContextProvider";
import {EmployeeContextProvider} from "./context/EmployeeContextProvider";
function App() {
  return (
    <BrowserRouter>
      <AdminContextProvider>
        <EmployeeContextProvider>
          <Routes>
            <Route path="/*" element={<LandingPageRoute />} />
            <Route path="workspace/*" element={<HomeRoute />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </EmployeeContextProvider>
      </AdminContextProvider>
    </BrowserRouter>
  );
}
export default App