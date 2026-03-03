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
    skip: !auth.token, // Only query if token exists
  });

  // log results for debugging
  console.log("currentUser query", {
    currentUserData,
    currentUserLoading,
    currentUserError,
  });

  // when we rehydrate or the Apollo query returns currentUser, make
  // sure the store has consistent state.  We read token from redux state
  // rather than localStorage since we persist the entire auth slice.
  useEffect(() => {
    const token = auth.token;

    // If token exists and we got user data from the API, dispatch to Redux
    if (token && currentUserData?.currentUser) {
      dispatch(loginSuccess({ token, user: currentUserData.currentUser }));
    }
  }, [dispatch, auth.token, currentUserData]);

  // if the query fails while a token is present, erase persisted auth
  useEffect(() => {
    if (currentUserError && auth.token) {
      console.warn(
        "currentUser error, clearing persisted auth",
        currentUserError,
      );
      dispatch(logout());
      persistor.purge();
    }
  }, [currentUserError, auth.token, dispatch]);

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
