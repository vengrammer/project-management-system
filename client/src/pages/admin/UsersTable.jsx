import { Loader, Power, PowerOff } from "lucide-react";
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
      onCompleted: () => { toast.success("Successfully update account!"); },
      onError: () => { toast.error("Failed to update account"); },
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
        updateUserStatus({ variables: { updateUserId: id, status: status } });
      }
    });
  };

  const { loading, error, data } = useQuery(GET_USERS);

  if (loading || loadingUpdateUserStatus) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-[#181d28]">
        <div className="flex flex-col items-center gap-3">
          <Loader size={70} className="animate-spin text-blue-500 dark:text-[#31f64b]" />
        </div>
      </div>
    );
  }

  if (error) {
    toast.error(`Error: ${error.message}`);
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]">
        <div className="text-red-600">Failed to load users</div>
      </div>
    );
  }

  const users = data?.users || [];

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

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      manager: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      pm: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      user: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-[#31f64b]",
    };
    return colors[role?.toLowerCase()] || "bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300";
  };

  const getStatusColor = (status) => {
    return status
      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-[#31f64b]"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="overflow-hidden w-full h-full flex"
    >
      <div className="bg-white dark:bg-[#222732] rounded-lg shadow dark:shadow-[0_2px_20px_rgba(0,0,0,0.5)] w-full h-full flex flex-col">

        {/* ── Header ── */}
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-[#2a3040]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-7 rounded-full bg-blue-600 dark:bg-[#31f64b]" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Users</h1>
            </div>
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
            className="w-full px-4 py-2 rounded-lg text-sm
              border border-gray-300 dark:border-[#2a3040]
              bg-white dark:bg-[#1a1f2b]
              text-gray-800 dark:text-slate-200
              placeholder-gray-400 dark:placeholder-slate-600
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40
              transition-colors duration-150"
          />
        </div>

        {/* ── Column Headers ── */}
        <div className="hidden md:grid md:grid-cols-6 gap-4 px-6 py-3
          bg-gray-50 dark:bg-[#1a1f2b]
          border-b border-gray-200 dark:border-[#2a3040]
          text-xs font-bold text-gray-600 dark:text-[#31f64b]/60 uppercase tracking-wider">
          <div>Name</div>
          <div>Position</div>
          <div>Email</div>
          <div>Role</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {/* ── Rows ── */}
        <div className="divide-y divide-gray-200 dark:divide-[#2a3040] h-full overflow-auto">
          {users.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-500">
              No users found
            </div>
          ) : currentUsers.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-500">
              No results for "{searchTerm}"
            </div>
          ) : (
            currentUsers.map((user) => (
              <div
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-[#252d3d] transition-colors p-4 md:px-6 md:py-4"
              >
                <div className="md:grid md:grid-cols-6 md:gap-2 md:items-center space-y-3 md:space-y-0">

                  {/* Name + Department */}
                  <div className="flex flex-row items-center justify-between md:justify-start md:block">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-slate-100 truncate">
                        {user.fullname}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-slate-500">
                        {user.department?.name || "No Department"}
                      </div>
                    </div>

                    {/* Mobile: status + role badges */}
                    <div className="flex gap-2 md:hidden">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                        {user.status ? "Active" : "Inactive"}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {user?.role === "user" ? "employee" : user.role}
                      </span>
                    </div>
                  </div>

                  {/* Position */}
                  <div className="text-sm text-gray-700 dark:text-slate-300">
                    {user.position}
                  </div>

                  {/* Email */}
                  <div className="text-sm text-gray-600 dark:text-slate-400 truncate">
                    {user.email}
                  </div>

                  {/* Role — desktop */}
                  <div className="hidden md:block">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {user?.role === "user" ? "employee" : user?.role}
                    </span>
                  </div>

                  {/* Status — desktop */}
                  <div className="hidden md:block">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                      {user.status ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-[#2a3040] md:border-t-0 md:pt-0 md:gap-2">
                    <FormEditUser userId={user?.id} />

                    {user.role !== "admin" && user.role !== "pm" && (
                      <button
                        onClick={() => handleUpdateStatus(user?.id, !user?.status)}
                        title={user.status ? "Deactivate User" : "Activate User"}
                        className={`flex hover:cursor-pointer items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium
                          transition-all duration-150
                          ${user.status
                            ? "bg-red-600 hover:bg-red-700 dark:bg-red-600/90 dark:hover:bg-red-500 dark:hover:shadow-[0_0_8px_rgba(239,68,68,0.35)] text-white"
                            : "bg-green-600 hover:bg-green-700 dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940] dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)] text-white"
                          }`}
                      >
                        {user.status ? <PowerOff size={18} /> : <Power size={18} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="px-4 md:px-6 py-4 border-t border-gray-200 dark:border-[#2a3040]
            flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-1.5 rounded-lg text-sm font-medium
                  border border-gray-300 dark:border-[#2a3040]
                  bg-white dark:bg-[#1a1f2b]
                  text-gray-700 dark:text-slate-300
                  hover:bg-gray-50 dark:hover:bg-[#252d3d]
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-colors duration-150"
              >
                ← Previous
              </button>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-1.5 rounded-lg text-sm font-medium
                  border border-gray-300 dark:border-[#2a3040]
                  bg-white dark:bg-[#1a1f2b]
                  text-gray-700 dark:text-slate-300
                  hover:bg-gray-50 dark:hover:bg-[#252d3d]
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-colors duration-150"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Footer Total ── */}
        <div className="px-4 md:px-6 py-4 border-t border-gray-200 dark:border-[#2a3040]">
          <div className="text-sm text-gray-600 dark:text-slate-400">
            Total: {filteredUsers.length}{" "}
            {filteredUsers.length === 1 ? "user" : "users"}
            {searchTerm && ` (filtered from ${users.length} total)`}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
