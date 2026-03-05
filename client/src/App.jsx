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
import { loginSuccess, logout } from "./middleware/authSlice";
import { persistor } from "./middleware/store";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useSelector } from "react-redux";
import { Loader } from "lucide-react";

const CURRENT_USER = gql`
  query CurrentUser {
    currentUser {
      id
      fullname
      email
      username
      role
      position
      department {
        id
        name
      }
      status
    }
  }
`;

function App() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const {
    data: currentUserData,
    loading: currentUserLoading,
    error: currentUserError,
  } = useQuery(CURRENT_USER, {
    skip: !auth.token, // only query if token exists
  });

  // Handle user login when data is ready
  useEffect(() => {
    if (auth.token && currentUserData?.currentUser) {
      dispatch(
        loginSuccess({ token: auth.token, user: currentUserData.currentUser }),
      );
    }
  }, [dispatch, auth.token, currentUserData]);

  // Handle token errors
  useEffect(() => {
    if (currentUserError && auth.token) {
      console.warn("currentUser query error, clearing auth", currentUserError);
      dispatch(logout());
      persistor.purge();
    }
  }, [currentUserError, auth.token, dispatch]);

  // Show loading screen while currentUser query is running
  if (auth.token && currentUserLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader size={70} className="animate-spin text-blue-500" />
          <span className="text-blue-500 font-medium">
            Loading user data...
          </span>
        </div>
      </div>
    );
  }

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
