import { Eye, Pen, Trash2, Users } from "lucide-react";
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

  // Get the department data
  const { loading, error, data } = useQuery(GET_DEPARTMENT);

  //DELETE DEPARTMENT ID IT UNUSED
  const [deleteDepartment] = useMutation(DELETE_DEPARTMENT, {
    onCompleted: () => {
      toast.success("Successfully deleted department");
    },
    onError: (error) => {
      //check if the error is has this
      if (error.message.includes("Failed: This department is currently used")) {
        toast.error(error.message);
        return;
      }
      // 3️⃣ Default fallback
      toast.error("Failed to delete department");
    },
    refetchQueries: [{ query: GET_DEPARTMENT }],
    awaitRefetchQueries: true,
  });
  const handleDelete = (id) => {
    console.log(id);
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
        deleteDepartment({
          variables: { deleteDepartmentId: id },
        });
      }
    });
  };

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
        <div className="text-red-600">Failed to load departments</div>
      </div>
    );
  }

  // Extract departments from response
  const departments = data?.departments || [];

  // Search filter
  const filteredDepartments = departments.filter((dept) => {
    const search = searchTerm.toLowerCase();
    return (
      dept.name?.toLowerCase().includes(search) ||
      dept.description?.toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDepartments = filteredDepartments.slice(startIndex, endIndex);

  const handleEdit = (department) => {
    console.log("Edit department:", department);
    alert(`Editing: ${department.name}`);
  };

  const getStatusColor = (isActive) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
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
            <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Grid Header*/}
        <div className="hidden lg:grid lg:grid-cols-5 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
          <div>Department</div>
          <div>Description</div>
          <div>Status</div>
          <div>Members</div>
          <div>Actions</div>
        </div>

        {/* Grid Body */}
        <div className="divide-y divide-gray-200 max-h-150 overflow-auto">
          {currentDepartments.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No departments found
            </div>
          ) : (
            currentDepartments.map((department) => (
              <div
                key={department.id}
                className="hover:bg-gray-50 transition-colors p-4 lg:px-6 lg:py-4"
              >
                <div className="lg:grid lg:grid-cols-5 lg:gap-2 lg:items-center space-y-3 lg:space-y-0">
                  {/* Department Name  */}
                  <div className="flex flex-row items-center justify-between lg:justify-start lg:block">
                    <h3 className="font-medium text-gray-900 truncate">
                      {department.name}
                    </h3>
                    {/* Status badge*/}
                    <span
                      className={`lg:hidden px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        department.isActive,
                      )}`}
                    >
                      {department.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="text-sm text-gray-500 lg:text-gray-500">
                    {department.description}
                  </div>

                  {/* Status*/}
                  <div className="hidden lg:block">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        department.isActive,
                      )}`}
                    >
                      {department.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Members count */}
                  <div className="flex items-center text-sm text-gray-600 lg:text-gray-700 gap-2">
                    <Users size={16} className="lg:w-4.5 lg:h-4.5" />
                    <span>
                      {department.users?.length || 0}{" "}
                      {department.users?.length === 1 ? "member" : "members"}
                    </span>
                  </div>

                  {/* Actions*/}
                  <div className="flex gap-2 pt-2 border-t border-gray-100 lg:border-t-0 lg:pt-0 lg:gap-3">
                    <FormEditDepartment departmentId={department.id} />
                    <button
                      onClick={() => handleDelete(department.id)}
                      className="flex-1 lg:flex-none bg-red-600 px-2 py-2 rounded cursor-pointer text-white hover:bg-red-700 text-sm font-medium lg:font-normal"
                      title="Delete"
                    >
                      <span className="lg:hidden">Delete</span>
                      <Trash2 size={20} className="hidden lg:block" />
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
              {Math.min(endIndex, filteredDepartments.length)} of{" "}
              {filteredDepartments.length} departments
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
        )}

        {/* Total count footer */}
        <div className="px-4 md:px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Total: {filteredDepartments.length}{" "}
            {filteredDepartments.length === 1 ? "department" : "departments"}
            {searchTerm && ` (filtered from ${departments.length} total)`}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
