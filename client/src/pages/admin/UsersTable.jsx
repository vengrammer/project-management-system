import { Eye, Pen, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@apollo/client/react";
import toast, { Toaster } from "react-hot-toast";
import { gql } from "@apollo/client";

export default function UsersTable() {
  const GET_USERS = gql`
    query Users {
      users {
        id
        fullname
        role
        position
        email
        status
        department {
          name
        }
      }
    }
  `;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get the users data using Apollo Client
  const { loading, error, data } = useQuery(GET_USERS);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }

  // Handle error state
  if (error) {
    toast.error(`Error: ${error.message}`);
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Toaster position="top-right" />
        <div className="text-red-600">Failed to load users</div>
      </div>
    );
  }

  // Extract users from response
  const users = data?.users || [];

  // Search filter
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.fullname?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.department?.name?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search) ||
      user.position?.toLowerCase().includes(search)
    );
  });

  // Pagination
 // const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
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
    if (window.confirm("Are you sure you want to delete this user?")) {
      console.log("Delete user:", id);
      // TODO: Implement delete mutation
      toast.success("User deleted successfully");
    }
  };

  // Helper functions
  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      manager: "bg-purple-100 text-purple-800",
      hr: "bg-blue-100 text-blue-800",
      user: "bg-green-100 text-green-800",
    };
    return colors[role?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status) => {
    return status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="w-full md:p-2 max-w-8xl mx-auto"
    >
      <Toaster position="top-left" />
      <div className="bg-white rounded-lg shadow">
        {/* Header with Search */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Users</h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto">
              + Add User
            </button>
          </div>

          <input
            type="text"
            placeholder="Search by name, email, department, role, or position..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Grid Header - Hidden on mobile */}
        <div className="hidden md:grid md:grid-cols-6 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
          <div>Name</div>
          <div>Position</div>
          <div>Email</div>
          <div>Role</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {/* Grid Body*/}
        <div className="divide-y divide-gray-200 max-h-150 overflow-auto">
          {users.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No users found
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No results for "{searchTerm}"
            </div>
          ) : (
            currentUsers.map((user) => (
              <div
                key={user.id}
                className="hover:bg-gray-100 transition-colors p-4 md:px-6 md:py-4"
              >
                <div className="md:grid md:grid-cols-6 md:gap-2 md:items-center space-y-3 md:space-y-0">
                  <div className="flex flex-row items-center justify-between md:justify-start md:block">
                    <div>
                      <div className="font-medium text-gray-900 truncate">
                        {user.fullname}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.department?.name || "No Department"}
                      </div>
                    </div>

                    {/* Role & Status badges*/}
                    <div className="flex gap-2 md:hidden">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}
                      >
                        {user.status ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Position */}
                  <div className="text-sm text-gray-700 md:text-gray-700">
                    {user.position}
                  </div>

                  {/* Email */}
                  <div className="text-sm text-gray-600 md:text-gray-700 truncate">
                    {user.email}
                  </div>

                  {/* Role  */}
                  <div className="hidden md:block">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="hidden md:block">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}
                    >
                      {user.status ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Actions*/}
                  <div className="flex gap-2 pt-2 border-t border-gray-100 md:border-t-0 md:pt-0 md:gap-3">
                    <button
                      onClick={() => handleView(user)}
                      className="flex-1 md:flex-none bg-blue-50 md:bg-transparent text-blue-600 hover:bg-blue-100 md:hover:bg-transparent md:hover:text-blue-800 py-2 md:py-0 rounded-lg md:rounded-none text-sm font-medium md:font-normal"
                      title="View"
                    >
                      <span className="md:hidden">View</span>
                      <Eye size={20} className="hidden md:block" />
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="flex-1 md:flex-none bg-green-50 md:bg-transparent text-green-600 hover:bg-green-100 md:hover:bg-transparent md:hover:text-green-800 py-2 md:py-0 rounded-lg md:rounded-none text-sm font-medium md:font-normal"
                      title="Edit"
                    >
                      <span className="md:hidden">Edit</span>
                      <Pen size={20} className="hidden md:block" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="flex-1 md:flex-none bg-red-50 md:bg-transparent text-red-600 hover:bg-red-100 md:hover:bg-transparent md:hover:text-red-800 py-2 md:py-0 rounded-lg md:rounded-none text-sm font-medium md:font-normal"
                      title="Delete"
                    >
                      <span className="md:hidden">Delete</span>
                      <Trash2 size={20} className="hidden md:block" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination*/}
        {/* {totalPages > 1 && (
          <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Previous
              </button>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )} */}

        {/* Total count footer */}
        <div className="px-4 md:px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Total: {filteredUsers.length}{" "}
            {filteredUsers.length === 1 ? "user" : "users"}
            {searchTerm && ` (filtered from ${users.length} total)`}
          </div>
        </div>
      </div>
    </motion.div>
  );
}