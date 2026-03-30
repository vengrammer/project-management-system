import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { gql } from "@apollo/client";
import { useQuery, useSubscription } from "@apollo/client/react";
import { persistor } from "@/middleware/store";
import { useApolloClient } from "@apollo/client/react";
import {
  Menu,
  X,
  FolderOpenDot,
  LogOut,
  User,
  LayoutDashboard,
  Archive,
  Bell,
  CalendarClock,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/middleware/authSlice";
import DarkModeSwitch from "@/hooks/DarkModeSwitch";

const GET_USER = gql`
  query User($userId: ID!) {
    user(id: $userId) {
      id
      fullname
      email
    }
  }
`;

const COUNT_UNREAD_NOTIFICATIOS = gql`
  query Notifications {
    notifications {
      id
      isRead
    }
  }
`;

const NOTIFICATION_SUB = gql`
  subscription Subscription($userId: ID!) {
    notificationAdded(userId: $userId) {
      id
      isRead
    }
  }
`;

const NOTIFICATION_MARK_AS_READ_SUB = gql`
  subscription NotificationMarkAsRead($userId: ID!) {
    notificationMarkAsRead(userId: $userId) {
      id
      isRead
    }
  }
`;

export default function ManagerSideBar() {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const client = useApolloClient();
  const userId = auth.user?.id;
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);

  const getInitials = (name) => {
    if (!name) return "";

    const words = name.trim().split(" ");

    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }

    return (words[0][0] + words[1][0]).toUpperCase();
  };

  // Remove async - not needed for simple path checking
  const isActive = (route) => {
    return location.pathname.includes(route);
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const { error: userError, data: userData } = useQuery(GET_USER, {
    variables: { userId },
    skip: !userId,
  });

  //get the noticatios count
  const { data } = useQuery(COUNT_UNREAD_NOTIFICATIOS);
  const { data: subData } = useSubscription(NOTIFICATION_SUB, {
    variables: { userId },
  });

  const { data: markAsReadSubData } = useSubscription(
    NOTIFICATION_MARK_AS_READ_SUB,
    {
      variables: { userId },
    },
  );

  //get the updated count of the notif
  useEffect(() => {
    function isNotfification() {
      if (data?.notifications) setNotifications(data.notifications);
    }

    isNotfification();
  }, [data]);

  useEffect(() => {
    function isAddNotification() {
      if (subData?.notificationAdded)
        setNotifications((prev) => [subData.notificationAdded, ...prev]);
    }
    isAddNotification();
  }, [subData]);

  useEffect(() => {
    function isMarkAsReadNotification() {
      if (markAsReadSubData?.notificationMarkAsRead) {
        const updatedNotification = markAsReadSubData.notificationMarkAsRead;
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === updatedNotification.id ? updatedNotification : n,
          ),
        );
      }
    }
    isMarkAsReadNotification();
  }, [markAsReadSubData]);

  const filterUnReadCount = notifications.filter((n) => {
    return n.isRead === false;
  });

  if (userError) {
    toast.error("Failed to load user data");
  }

  const fullnameMgr = userData?.user.fullname || "";
  const emailMgr = userData?.user.email || "";

  const linkDesign =
    "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-[#252d3d] hover:text-blue-600 dark:hover:text-[#b8ed06] transition-colors";
  const active =
    "bg-blue-100 dark:bg-[#049417] dark:text-[#b8ed06] text-blue-600";

  return (
    <div className="flex h-screen dark:bg-[#202120] dark:text-white bg-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 right-4 z-50 p-2 bg-blue-600 text-white rounded-lg md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 dark:bg-[#222732] shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          flex flex-col
        `}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b dark:border-[#2a3040] flex items-center gap-3 bg-white dark:bg-[#222732]">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-[#2a3040]">
            <img
              src={logo}
              alt="Logo"
              className="h-12 w-12 object-contain rounded-full"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">
            Project Management
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 overflow-y-auto bg-white dark:bg-[#222732]">
          <div className="px-4 py-2 mb-4 rounded-2xl border dark:border-[#2a3040] shadow-blue-800 shadow-2xs">
            <h1 className="font-semibold text-gray-800 dark:text-slate-200">
              Welcome, <span className="text-blue-600 dark:text-[#31f64b]">Manager</span>
            </h1>
            <div className="flex items-center justify-center p-2">
              <DarkModeSwitch />
            </div>
          </div>
          <ul className="space-y-2">
            <li>
              <Link
                to="/manager/dashboard"
                className={`${linkDesign} ${
                  isActive("/manager/dashboard") ? active : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/manager/projects"
                className={`${linkDesign} ${
                  isActive("/manager/projects") ? active : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                <FolderOpenDot size={20} />
                <span>Project</span>
              </Link>
            </li>
            <li>
              <Link
                to="/manager/archive"
                className={`${linkDesign} ${
                  isActive("/manager/archive") ? active : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Archive size={20} />
                <span>Archive</span>
              </Link>
            </li>

            {/* calendar mentions  */}
             <li>
              <Link
                to="/manager/calendarmentions"
                className={`flex relative ${linkDesign} ${
                  isActive("/manager/calendarmentions") ? active : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                <CalendarClock size={20} />
                <span>Calendar Mentions</span>{" "}
              </Link>
            </li>
 
            <li>
              <Link
                to="/manager/notification"
                className={`flex relative ${linkDesign} ${
                  isActive("/manager/notification") ? active : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Bell size={20} />
                <span>Notifications</span>{" "}
                {filterUnReadCount.length > 0 && (
                  <span className="absolute right-0 bg-red-600 bold text-white px-2 rounded-4xl">
                    {filterUnReadCount.length}
                  </span>
                )}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Account Section at Bottom */}
        <div className="p-4 border-t dark:border-[#2a3040] bg-white dark:bg-[#222732]">
          {/* User Info */}
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 dark:bg-[#0e0698] rounded-lg">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {getInitials(fullnameMgr || "U")}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                {fullnameMgr || "Unknown user"}{" "}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-200">
                {emailMgr || "no email"}
              </p>
            </div>
          </div>

          {/* Profile Link */}
          <Link
            to="/manager/profile"
            className={`${linkDesign} mb-1 ${
              isActive("/manager/profile") ? active : ""
            }`}
            onClick={() => setIsOpen(false)}
          >
            <User size={18} />
            <span className="text-sm">Profile</span>
          </Link>

          <button
            onClick={() => {
              dispatch(logout());
              persistor.purge();
              client.resetStore();
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden p-2">
        <Outlet />
      </main>
    </div>
  );
}
