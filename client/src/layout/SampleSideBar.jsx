import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import {
  Menu,
  X,
  FolderOpenDot,
  Users,
  UserCheck,
  LogOut,
  User,
  LayoutDashboard,
  Building2,
} from "lucide-react";

export default function SampleSidebar() {
  const [isOpen, setIsOpen] = useState(false);


  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

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
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">My App</h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
            </li>

            <li>
              <Link
                to="/admin/myprojects"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <FolderOpenDot size={20} />
                <span>Project</span>
              </Link>
            </li>

            <li>
              <Link
                to="/admin/users"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <UserCheck size={20} />
                <span>Users</span>
              </Link>
            </li>

            <li>
              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Building2 size={20} />
                <span>Department</span>
              </Link>
            </li>

            <li>
              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Users size={20} />
                <span>Team</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Account Section at Bottom */}
        <div className="p-4 border-t">
          {/* User Info */}
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              JD
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">John Doe</p>
              <p className="text-xs text-gray-500">john@example.com</p>
            </div>
          </div>

          {/* Account Links */}
          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors mb-1"
            onClick={() => setIsOpen(false)}
          >
            <User size={18} />
            <span className="text-sm">Profile</span>
          </Link>

          <button
            onClick={() => {
              // Add your logout logic here
              console.log("Logout clicked");
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
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}