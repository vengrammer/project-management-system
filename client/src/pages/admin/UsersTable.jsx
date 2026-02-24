import { Power, PowerOff } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-toastify";
import { gql } from "@apollo/client";
import FormAddUser from "./FormAddUser";
import FormEditUser from "./FormEditUser";
import Swal from "sweetalert2";

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

  const UPDATE_USER_STATUS = gql`
    mutation UpdateUser($updateUserId: ID!, $status: Boolean) {
      updateUser(id: $updateUserId, status: $status) {
        message
      }
    }
  `;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [updateUserStatus, { loading: loadingUpdateUserStatus }] = useMutation(
    UPDATE_USER_STATUS,
    {
      onCompleted: () => {
        toast.success("Successfully update account!");
      },
      onError: () => {
        toast.error("Failed to update account");
      },
      refetchQueries: [{ query: GET_USERS }],
    },
  );

  const handleUpdateStatus = (id, status) => {
    Swal.fire({
      title: "Are you sure you want to update status?",
      text: "active or inactive account!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        updateUserStatus({
          variables: {
            updateUserId: id,
            status: status,
          },
        });
      }
    });
  };

  // Get the users data using Apollo Client
  const { loading, error, data } = useQuery(GET_USERS);

  // Handle loading state
  if (loading || loadingUpdateUserStatus) {
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
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

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
      <div className="bg-white rounded-lg shadow">
        {/* Header with Search */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Users</h1>
            <div className="px-4 py-2 rounded-lg w-full sm:w-auto">
              <FormAddUser />
            </div>
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
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          user.status,
                        )}`}
                      >
                        {user.status ? "Active" : "Inactive"}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                          user.role,
                        )}`}
                      >
                        {user?.role === "user" ? "employee" : user.role}
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
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                        user.role,
                      )}`}
                    >
                      {user?.role === "user" ? "employee" : user?.role}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="hidden md:block">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        user.status,
                      )}`}
                    >
                      {user.status ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Actions*/}
                  <div className="flex gap-2 pt-2 border-t border-gray-100 md:border-t-0 md:pt-0 md:gap-3">
                    <FormEditUser userId={user?.id} />
                    <button
                      onClick={() =>
                        handleUpdateStatus(user?.id, !user?.status)
                      }
                      className={`flex hover:cursor-pointer items-center gap-2 ${
                        user.status
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }  text-white  px-3 py-3 rounded-md text-sm font-medium`}
                      title="Ban User"
                    >
                      {user.status ? (
                        <PowerOff size={20} />
                      ) : (
                        <Power size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination*/}
        {totalPages > 1 && (
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
        )}

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
