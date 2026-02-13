import {
  CalendarArrowDown,
  CalendarArrowUp,
  Eye,
  Pen,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@apollo/client/react";
import toast, { Toaster } from "react-hot-toast";
import { gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import FormAddProjectModal from "./FormAddProjectModal";


export default function ProjectTable() {
  const navigate = useNavigate();
  const GET_PROJECTS = gql`
    query Projects {
      projects {
        id
        title
        priority
        status
        department {
          name
        }
        progress
        budget
        startDate
        endDate
      }
    }
  `;

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get the projects data using Apollo Client
  const { loading, error, data } = useQuery(GET_PROJECTS);

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
        <Toaster />
        <div className="text-red-600">Failed to load projects</div>
      </div>
    );
  }

  // Extract projects from response
  const projects = data?.projects || [];

  // Search filter
  const filteredProjects = projects.filter((project) => {
    const search = searchTerm.toLowerCase();
    return (
      project.title?.toLowerCase().includes(search) ||
      project.description?.toLowerCase().includes(search) ||
      project.department?.name?.toLowerCase().includes(search) ||
      project.status?.toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  // Actions
  const handleView = (project) => {
    navigate("/projectdetails");
    // console.log("View project:", project);
    // alert(`Viewing: ${project.title}`);
  };

  const handleEdit = (project) => {
    console.log("Edit project:", project);
    alert(`Editing: ${project.title}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      console.log("Delete project:", id);
      // TODO: Implement delete mutation
      toast.success("Project deleted successfully");
    }
  };

  // Helper functions
  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return colors[priority?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status) => {
    const colors = {
      "in progress": "bg-blue-100 text-blue-800",
      "not started": "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
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
            <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
            <FormAddProjectModal />
            {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto">
              
            </button> */}
          </div>

          <input
            type="text"
            placeholder="Search by title, description, department, or status..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Grid Header - Hidden on mobile */}
        <div className="hidden lg:grid lg:grid-cols-9 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
          <div>Title</div>
          <div>Department</div>
          <div>Status</div>
          <div>Priority</div>
          <div>Progress</div>
          <div>Budget</div>
          <div>Start Date</div>
          <div>End Date</div>
          <div>Actions</div>
        </div>

        {/* Grid Body - Unified responsive layout */}
        <div className="divide-y divide-gray-200 max-h-150 overflow-auto">
          {projects.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No projects found
            </div>
          ) : currentProjects.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No results for "{searchTerm}"
            </div>
          ) : (
            currentProjects.map((project) => (
              <div
                key={project.id}
                className="hover:bg-gray-50 transition-colors p-4 lg:px-6 lg:py-4"
              >
                {/* Unified Responsive Layout */}
                <div className="lg:grid lg:grid-cols-9 lg:gap-4 lg:items-center space-y-3 lg:space-y-0">
                  {/* Title & Description */}
                  <div className="flex flex-row items-start justify-between lg:justify-start lg:block">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 wrap-break-word">
                        {project.title ? project.title : "No project title"}
                      </div>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="text-sm text-gray-700 lg:block">
                    <span className="text-gray-500 lg:hidden">
                      Department:{" "}
                    </span>
                    <span className="font-medium lg:font-normal">
                      {project.department?.name
                        ? project.department?.name
                        : "No department"}
                    </span>
                  </div>

                  {/* Status - Hidden on mobile (shown in badges section) */}
                  <div className="hidden lg:block">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(project.status)}`}
                    >
                      {project.status ? project.status : "No status"}
                    </span>
                  </div>

                  {/* Priority - Hidden on mobile (shown in badges section) */}
                  <div className="hidden lg:block">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}
                    >
                      {project.priority ? project.priority : "No Priority"}
                    </span>
                  </div>

                  {/* Status & Priority badges - Mobile only */}
                  <div className="flex gap-2 lg:hidden">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}
                    >
                      {project.status}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}
                    >
                      {project.priority || "No priority"}
                    </span>
                  </div>
                  {/* Progress */}
                  <div className="lg:col-span-1">
                    <div className="flex items-center justify-between mb-1 lg:hidden">
                      <span className="text-sm text-gray-500">Progress</span>
                      <span className="text-sm text-gray-600 font-medium">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="hidden lg:block text-sm text-gray-600 whitespace-nowrap">
                        {project.progress}%
                      </span>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="text-sm text-gray-700">
                    <span className="text-gray-500 lg:hidden">Budget: </span>
                    <span className="font-medium lg:font-normal">
                      {project.budget?.toLocaleString() || "0"}
                    </span>
                  </div>

                  {/* Dates - Mobile format */}
                  <div className="flex gap-4 text-sm lg:hidden">
                    <div className="flex items-center gap-1">
                      <CalendarArrowUp size={15} className="text-gray-500" />
                      <span className="text-gray-900 font-medium">
                        {project.startDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarArrowDown size={15} className="text-gray-500" />
                      <span className="text-gray-900 font-medium">
                        {project.endDate}
                      </span>
                    </div>
                  </div>

                  {/* Start Date - Desktop only */}
                  <div className="hidden lg:block text-sm text-gray-700">
                    {project.startDate}
                  </div>

                  {/* End Date - Desktop only */}
                  <div className="hidden lg:block text-sm text-gray-700">
                    {project.endDate}
                  </div>

                  {/* Actions - Full width buttons on mobile, icon buttons on desktop */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100 lg:border-t-0 lg:pt-0 lg:gap-3">
                    <button
                      onClick={() => handleView(project)}
                      className="flex-1 cursor-pointer lg:flex-none bg-blue-50 lg:bg-transparent text-blue-600 hover:bg-blue-100 lg:hover:bg-transparent lg:hover:text-blue-800 py-2 lg:py-0 rounded-lg lg:rounded-none text-sm font-medium lg:font-normal"
                      title="View"
                    >
                      <span className="lg:hidden">View</span>
                      <Eye size={20} className="hidden lg:block" />
                    </button>
                    <button
                      onClick={() => handleEdit(project)}
                      className="flex-1 cursor-pointer lg:flex-none bg-green-50 lg:bg-transparent text-green-600 hover:bg-green-100 lg:hover:bg-transparent lg:hover:text-green-800 py-2 lg:py-0 rounded-lg lg:rounded-none text-sm font-medium lg:font-normal"
                      title="Edit"
                    >
                      <span className="lg:hidden">Edit</span>
                      <Pen size={20} className="hidden lg:block" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="flex-1 cursor-pointer lg:flex-none bg-red-50 lg:bg-transparent text-red-600 hover:bg-red-100 lg:hover:bg-transparent lg:hover:text-red-800 py-2 lg:py-0 rounded-lg lg:rounded-none text-sm font-medium lg:font-normal"
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

        {/* Pagination - Only show if more than 1 page */}
        {totalPages > 1 && (
          <div className="px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredProjects.length)} of{" "}
              {filteredProjects.length} projects
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
        {/* Total count footer
        <div className="px-4 md:px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Total: {filteredProjects.length}{" "}
            {filteredProjects.length === 1 ? "project" : "projects"}
            {searchTerm && ` (filtered from ${projects.length} total)`}
          </div>
        </div> */}
      </div>
    </motion.div>
  );
}