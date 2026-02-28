import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { gql } from "@apollo/client";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  Menu,
  X,
  FolderOpenDot,
  LogOut,
  User,
  Archive,
  LayoutDashboard,
  Loader,
} from "lucide-react";
import { useQuery } from "@apollo/client/react";

const GET_USER = gql`
  query User($userId: ID!) {
    user(id: $userId) {
      id
      fullname
      email
    }
  }
`;

export default function EmployeeSideBar() {
  const auth = useSelector((state) => state.auth);
  console.log("Auth state in EmployeeSideBar:", auth);
  const user = "6997ef02e934b856db1ab557";
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const { error: userError, data: userData} = useQuery(GET_USER, {
      variables: {userId : user}
    });
  
  
    if(userError) {
      toast.error("Failed to load user data");
    }

  return (
    <div className="flex h-screen bg-gray-100">
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
          w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          flex flex-col
        `}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b flex items-center gap-3">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-gray-200">
            <img
              src={logo}
              alt="Logo"
              className="h-12 w-12 object-contain rounded-full"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-800">
            Project Management
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="px-4 py-2 mb-4 rounded-2xl shadow-blue-800 border shadow-2xs">
            <h1 className=" font-semibold text-gray-800">
              Welcome, <span className="text-blue-600">Employee</span>
            </h1>
          </div>
          <ul className="space-y-2">
            <li>
              <Link
                to="/employee/dashboard"
                className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActive("/employee/dashboard")
                    ? "bg-blue-100 text-blue-600"
                    : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
            </li>

            <li>
              <Link
                to="/employee/projects"
                className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActive("/employee/projects")
                    ? "bg-blue-100 text-blue-600"
                    : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                <FolderOpenDot size={20} />
                <span>Project</span>
              </Link>
            </li>
            <li>
              <Link
                to="/employee/archive"
                className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActive("/employee/archive")
                    ? "bg-blue-100 text-blue-600"
                    : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Archive size={20} />
                <span>Archive</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Account Section at Bottom */}
        <div className="p-4 border-t">
          {/* User Info */}
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {getInitials(userData?.user.fullname || "U")}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">
                {userData?.user.fullname || "Unknown user"}{" "}
              </p>
              <p className="text-xs text-gray-500">
                {userData?.user.email || "no email"}
              </p>
            </div>
          </div>

          {/* Account Links */}
          <Link
            to="/employee/profile"
            className={`flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors mb-1 ${
              isActive("/employee/profile") ? "bg-blue-100 text-blue-600" : ""
            }`}
            onClick={() => setIsOpen(false)}
          >
            <User size={18} />
            <span className="text-sm">Profile</span>
          </Link>

          <button
            onClick={() => {
              navigate("/");
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
      <main
        className="flex-1 flex overflow-hidden p-2"
        // style={{
        //   minHeight: "calc(100vh - 1px)",
        // }}
      >
        <Outlet />
      </main>
    </div>
  );
}
