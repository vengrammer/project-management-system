import { Loader, Trash2, Users } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-toastify";
import { gql } from "@apollo/client";
import FormAddDepartment from "./FormAddDepartment";
import Swal from "sweetalert2";
import FormEditDepartment from "./FormEditDepartment";

const GET_DEPARTMENT = gql`
  query Departments {
    departments {
      id
      isActive
      name
      description
      users {
        id
      }
    }
  }
`;

const DELETE_DEPARTMENT = gql`
  mutation deleteDepartment($deleteDepartmentId: ID!) {
    deleteDepartment(id: $deleteDepartmentId) {
      message
    }
  }
`;

export default function DepartmentTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { loading, error, data } = useQuery(GET_DEPARTMENT);

  const [deleteDepartment] = useMutation(DELETE_DEPARTMENT, {
    onCompleted: () => {
      toast.success("Successfully deleted department");
    },
    onError: (error) => {
      if (error.message.includes("Failed: This department is currently used")) {
        toast.error(error.message);
        return;
      }
      toast.error("Failed to delete department");
    },
    refetchQueries: [{ query: GET_DEPARTMENT }],
    awaitRefetchQueries: true,
  });

  const handleDelete = (id, department) => {
    if (!department) {
      Swal.fire({
        title: "Unable to delete department. It is currently linked to active users or projects.",
        text: "Failed to delete department",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Okay",
      });
      return;
    }
    Swal.fire({
      title: "Are you sure you want to delete department?",
      text: "You won't be able to revert this!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        deleteDepartment({ variables: { deleteDepartmentId: id } });
      }
    });
  };

  if (loading) {
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
        <div className="text-red-600">Failed to load departments</div>
      </div>
    );
  }

  const departments = data?.departments || [];

  const filteredDepartments = departments.filter((dept) => {
    const search = searchTerm.toLowerCase();
    return (
      dept.name?.toLowerCase().includes(search) ||
      dept.description?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDepartments = filteredDepartments.slice(startIndex, endIndex);

  const getStatusColor = (isActive) => {
    return isActive
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
              <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Departments</h1>
            </div>
            <FormAddDepartment />
          </div>

          <input
            type="text"
            placeholder="Search by name or description..."
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
        <div className="hidden lg:grid lg:grid-cols-5 gap-4 px-6 py-3
          bg-gray-50 dark:bg-[#1a1f2b]
          border-b border-gray-200 dark:border-[#2a3040]
          text-xs font-bold text-gray-600 dark:text-[#31f64b]/60 uppercase tracking-wider">
          <div>Department</div>
          <div>Description</div>
          <div>Status</div>
          <div>Members</div>
          <div>Actions</div>
        </div>

        {/* ── Rows ── */}
        <div className="divide-y divide-gray-200 dark:divide-[#2a3040] h-full overflow-auto">
          {currentDepartments.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-500">
              No departments found
            </div>
          ) : (
            currentDepartments.map((department) => (
              <div
                key={department.id}
                className="hover:bg-gray-50 dark:hover:bg-[#252d3d] transition-colors p-4 lg:px-6 lg:py-4"
              >
                <div className="lg:grid lg:grid-cols-5 lg:gap-2 lg:items-center space-y-3 lg:space-y-0">

                  {/* Department Name */}
                  <div className="flex flex-row items-center justify-between lg:justify-start lg:block">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 truncate">
                      {department.name}
                    </h3>
                    {/* Mobile status badge */}
                    <span className={`lg:hidden px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(department.isActive)}`}>
                      {department.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="text-sm text-gray-500 dark:text-slate-400">
                    {department.description}
                  </div>

                  {/* Status — desktop */}
                  <div className="hidden lg:block">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(department.isActive)}`}>
                      {department.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Members count */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-slate-400 gap-2">
                    <Users size={16} className="text-gray-400 dark:text-[#31f64b]/50" />
                    <span>
                      {department.users?.length || 0}{" "}
                      {department.users?.length === 1 ? "member" : "members"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-[#2a3040] lg:border-t-0 lg:pt-0 lg:gap-2">
                    <FormEditDepartment departmentId={department.id} />

                    <button
                      onClick={() =>
                        handleDelete(department.id, department.users?.length < 1 ? true : false)
                      }
                      title="Delete"
                      className="flex-1 lg:flex-none cursor-pointer
                        bg-red-600 hover:bg-red-700
                        dark:bg-red-600/90 dark:hover:bg-red-500
                        dark:hover:shadow-[0_0_8px_rgba(239,68,68,0.35)]
                        px-2 py-2 rounded-md text-white
                        text-sm font-medium transition-all duration-150"
                    >
                      <span className="lg:hidden">Delete</span>
                      <Trash2 size={18} className="hidden lg:block" />
                    </button>
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
              {Math.min(endIndex, filteredDepartments.length)} of{" "}
              {filteredDepartments.length} departments
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

              {/* Page number buttons */}
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
                      ${currentPage === index + 1
                        ? "bg-blue-600 text-white dark:bg-[#31f64b] dark:text-black dark:font-bold"
                        : "border border-gray-300 dark:border-[#2a3040] bg-white dark:bg-[#1a1f2b] text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-[#252d3d]"
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

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
            Total: {filteredDepartments.length}{" "}
            {filteredDepartments.length === 1 ? "department" : "departments"}
            {searchTerm && ` (filtered from ${departments.length} total)`}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
