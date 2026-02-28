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
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const CURRENT_USER = gql`
  query CurrentUser {
    currentUser {
      id
      fullname
      email
      username
      role
      position
      department
      status
    }
  }
`;

function App() {
  const dispatch = useDispatch();
  const {
    data: currentUserData,
    loading: currentUserLoading,
    error: currentUserError,
  } = useQuery(CURRENT_USER, {
    skip: !localStorage.getItem("token"), // Only query if token exists
  });

  console.log("currentUser query", {
    currentUserData,
    currentUserLoading,
    currentUserError,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("App effect token", token, "userData", currentUserData);

    // If token exists and we got user data from the API, dispatch to Redux
    if (token && currentUserData?.currentUser) {
      dispatch(loginSuccess({ token, user: currentUserData.currentUser }));
    }
  }, [dispatch, currentUserData]);

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
