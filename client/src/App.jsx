import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPageRoute from "./Router/LandingPageRoute";
import NotFound from "./components/NotFound";
import AdminRoute from "./Router/AdminRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmployeeRoute from "./Router/EmployeeRoute";
import ManagerRoute from "./Router/ManagerRoute";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "./middleware/authSlice";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      dispatch(loginSuccess({ token, user: JSON.parse(user) }));
    }
  }, [dispatch]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<LandingPageRoute />} />
        <Route path="admin/*" element={<AdminRoute />} />
        <Route path="employee/*" element={<EmployeeRoute />} />
        <Route path="manager/*" element={<ManagerRoute />} />

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
