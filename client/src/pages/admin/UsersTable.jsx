import {
  CalendarArrowUp,
  CalendarPlus2,
  Eye,
  Pen,
  Trash,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { GRAPHQL_URL } from "@/config/api.js";

export default function AdminTable() {
  //GET ALL THE USERS
  const GET_USERS = `
  query Query {
    users {
      id
      fullname
      department
      role
      position
      email
      status
      createdAt
      updatedAt
    }
  }
`;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        setLoading(true);

        const result = await axios.post(
          GRAPHQL_URL,
          { query: GET_USERS },
          { headers: { "Content-Type": "application/json" } },
        );

          if (!result?.data?.data?.users?.length === 0) {
            console.log("No users found");
            return;
          }

        setUsers(result.data.data.users); 
      } catch (error) {
        console.log("theres an error here", error.message);
      } finally {
        setLoading(false);
      }
    };

    getAllUsers();
  }, [GET_USERS]);

  console.log("rusults", users);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search filter - use actual fetched data (users)
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.fullname?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.department?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search) ||
      user.status?.toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Actions
  const handleView = (user) => {
    console.log("View user:", user);
    alert(`Viewing: ${user.fullname}`);
  };

  const handleEdit = (user) => {
    console.log("Edit user:", user);
    alert(`Editing: ${user.fullname}`);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== id));
      console.log("Deleted user:", id);
    }
  };

  // // Helper functions
  const getUserColor = (role) => {
    if (role === "admin") return "bg-red-100 text-red-800";
    if (role === "hr") return "bg-blue-100 text-blue-800";
    if (role === "user") return "bg-green-100 text-green-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusColor = (status) => {
    if (status === "active") return "bg-green-100 text-blue-800";
    if (status === "inactive") return "bg-red-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }} // start below
      animate={{ y: 0, opacity: 1 }} // move to normal position
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="w-full md:p-2 max-w-8xl mx-auto"
    >
      <div className="bg-white rounded-lg shadow">
        {/* Header with Search */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Users</h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto">
              + User
            </button>
          </div>

          <input
            type="text"
            placeholder="Search by fullname, email, department, role, or status..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Grid Header - Hidden on mobile */}
        <div className="hidden lg:grid lg:grid-cols-7 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
          <div>Full name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Status</div>
          <div>Created At</div>
          <div>Updated At</div>
          <div>Actions</div>
        </div>

        {/* Grid Body */}
        <div className="divide-y divide-gray-200 h-150 overflow-auto">
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Loading users...
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No User found
            </div>
          ) : (
            currentUsers.map((user) => (
              <div key={user.id} className="hover:bg-gray-50 transition-colors">
                {/* Desktop Grid Layout */}
                <div className="hidden lg:grid lg:grid-cols-7 gap-2 px-6 py-4 items-center">
                  {/* row for the data*/}
                  <div>
                    <div className="font-medium text-gray-900 truncate">
                      {user.fullname}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.department}
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 pl-auto truncate">
                    {user.email}
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 text-sm font-medium rounded-full ${getUserColor(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">{user.createdAt}</div>
                  <div className="text-sm text-gray-700">{user.updatedAt}</div>

                  {/* button for the desktop view*/}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleView(user)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:cursor-pointer"
                    >
                      <Eye size={22} />
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium hover:cursor-pointer"
                    >
                      <Pen size={22} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium hover:cursor-pointer"
                    >
                      <Trash2 size={22} />
                    </button>
                  </div>
                </div>

                {/* Mobile Card Layout */}
                <div className="lg:hidden p-4 space-y-3">
                  <div className="flex flex-col items-start w-full">
                    {/* Top Row */}
                    <div className="flex flex-row items-center justify-between w-full">
                      <h3 className="font-medium text-gray-900">
                        {user.fullname}
                      </h3>

                      <div className="flex gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}
                        >
                          {user.status}
                        </span>

                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getUserColor(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row */}
                    <p className="text-sm text-gray-500 mt-1">
                      {user.department}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex text-sm text-gray-600 font-medium">
                        <CalendarPlus2 size={20} className="p-1" />
                        {user.createdAt}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex text-sm text-gray-600 font-medium">
                        <CalendarArrowUp size={20} className="p-1" />{" "}
                        {user.updatedAt}
                      </span>
                    </div>
                  </div>
                  {/*button for the mobile action*/}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleView(user)}
                      className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-lg text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 py-2 rounded-lg text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length}{" "}
            users
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    currentPage === index + 1
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}