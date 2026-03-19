import {
  Archive,
  CalendarArrowDown,
  CalendarArrowUp,
  Eye,
  Loader,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";
import { gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import FormAddProjectModal from "../admin/FormAddProjectModal";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

export default function ProjectTableManager() {

  const auth = useSelector((state) => state.auth);
  const userId = auth.user?.id;
  const navigate = useNavigate();

  const DELETE_PROJECT = gql`
    mutation DeleteProject($id: ID!) {
      deleteProject(id: $id) {
        message
        project {
          id
        }
      }
    }
  `;
  const [deleteProject] = useMutation(DELETE_PROJECT);

  const GET_PROJECTS = gql`
    query ProjectsByManager($projectsByManagerId: ID) {
      projectsByManager(id: $projectsByManagerId) {
        id
        title
        priority
        status
        department {
          name
        }
        projectManager {
          id
          fullname
        }
        budget
        startDate
        endDate
      }
    }
  `;

  const SET_ARCHIVE = gql`
    mutation Mutation($updateProjectId: ID!, $isArchive: Boolean) {
      updateProject(id: $updateProjectId, isArchive: $isArchive) {
        message
        project {
          isArchive
        }
      }
    }
  `;

  const [updateProject] = useMutation(SET_ARCHIVE);

  const handleArchive = async (id) => {
    Swal.fire({
      title: "Are you sure you want to archive this project?",
      text: "Archive project!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, archive it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data } = await updateProject({
            variables: { updateProjectId: id, isArchive: true },
          });
          if (data.updateProject) {
            toast.success("Project restore successfully");
            await refetch();
          }
        } catch (error) {
          toast.error(`Error archiving project ${error}`);
        }
      }
    });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { loading, error, data, refetch } = useQuery(GET_PROJECTS, {
    variables: { projectsByManagerId: userId },
    notifyOnNetworkStatusChange: true,
  });

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-[#1a1f2b]">
        <div className="flex flex-col items-center gap-3">
          <Loader size={70} className="animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (error) {
    toast.error("Failde to load projects");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Failed to load projects</div>
      </div>
    );
  }

  const projects = data?.projectsByManager || [];

  const filteredProjects = projects.filter((project) => {
    const search = searchTerm.toLowerCase();
    return (
      project.title?.toLowerCase().includes(search) ||
      project.description?.toLowerCase().includes(search) ||
      project.department?.name?.toLowerCase().includes(search) ||
      project.status?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const handleView = (project) => {
    navigate(`/manager/projectdetails/${project.id}`);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure you want to delete this project?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data } = await deleteProject({ variables: { id } });
          if (data.deleteProject) {
            toast.success("Project deleted successfully");
            await refetch();
          }
        } catch (error) {
          toast.error(`Error deleting project: ${error.message}`);
        }
      }
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    };
    return colors[priority?.toLowerCase()] || "bg-gray-100 text-gray-800 dark:bg-[#2a3040] dark:text-slate-300";
  };

  const getStatusColor = (status) => {
    const colors = {
      "in progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      "not started": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800 dark:bg-[#2a3040] dark:text-slate-300";
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="w-full md:p-2 max-w-8xl mx-auto"
    >
      <div className="bg-white dark:bg-[#222732] rounded-lg shadow w-full h-full flex flex-col">

        {/* Header with Search */}
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-[#2a3040]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Projects</h1>
            <FormAddProjectModal refechProjects={async () => await refetch()} />
          </div>
          <input
            type="text"
            placeholder="Search by title or department..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 rounded-lg text-sm transition-all
              border border-gray-300 dark:border-[#2a3040]
              bg-white dark:bg-[#1a1f2b]
              text-gray-800 dark:text-slate-200
              placeholder-gray-400 dark:placeholder-slate-600
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40"
          />
        </div>

        {/* Grid Header - Hidden on mobile */}
        <div className="hidden lg:grid lg:grid-cols-9 gap-4 px-6 py-3 bg-gray-50 dark:bg-[#1a1f2b] border-b border-gray-200 dark:border-[#2a3040] text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
          <div>Title</div>
          <div>Department</div>
          <div>Status</div>
          <div>Priority</div>
          <div>Project Manager</div>
          <div>Budget</div>
          <div>Start Date</div>
          <div>End Date</div>
          <div>Actions</div>
        </div>

        {/* Grid Body */}
        <div className="divide-y divide-gray-200 dark:divide-[#2a3040] max-h-full overflow-auto">
          {projects.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-500">
              No projects found
            </div>
          ) : currentProjects.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-500">
              No results for "{searchTerm}"
            </div>
          ) : (
            currentProjects.map((project) => (
              <div
                key={project.id}
                className="hover:bg-gray-50 dark:hover:bg-[#252d3d] transition-colors p-4 lg:px-6 border dark:border-[#2a3040] lg:py-4"
              >
                <div className="lg:grid lg:grid-cols-9 lg:gap-4 lg:items-center space-y-3 lg:space-y-0">

                  {/* Title */}
                  <div className="flex flex-row items-start justify-between lg:justify-start lg:block">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-slate-100 wrap-break-word">
                        {project.title ? project.title : "No project title"}
                      </div>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="text-sm text-gray-700 dark:text-slate-300 lg:block">
                    <span className="text-gray-500 dark:text-slate-500 lg:hidden">Department: </span>
                    <span className="font-medium lg:font-normal">
                      {project.department?.name ? project.department?.name : "No department"}
                    </span>
                  </div>

                  {/* Status - Desktop */}
                  <div className="hidden lg:block">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(project.status)}`}>
                      {project.status ? project.status : "No status"}
                    </span>
                  </div>

                  {/* Priority - Desktop */}
                  <div className="hidden lg:block">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                      {project.priority ? project.priority : "No Priority"}
                    </span>
                  </div>

                  {/* Status & Priority - Mobile */}
                  <div className="flex gap-2 lg:hidden">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                      {project.priority || "No priority"}
                    </span>
                  </div>

                  {/* Project Manager */}
                  <div className="text-sm text-gray-700 dark:text-slate-300">
                    <span className="text-gray-500 dark:text-slate-500 lg:hidden">PM: </span>
                    <span className="font-medium lg:font-normal">
                      {project?.projectManager?.fullname ? project?.projectManager.fullname : "No PM"}
                    </span>
                  </div>

                  {/* Budget */}
                  <div className="text-sm text-gray-700 dark:text-slate-300">
                    <span className="text-gray-500 dark:text-slate-500 lg:hidden">Budget: </span>
                    <span className="font-medium lg:font-normal">
                      {project.budget?.toLocaleString() || "0"}
                    </span>
                  </div>

                  {/* Dates - Mobile */}
                  <div className="flex gap-4 text-sm lg:hidden">
                    <div className="flex items-center gap-1">
                      <CalendarArrowUp size={15} className="text-gray-500 dark:text-slate-500" />
                      <span className="text-gray-900 dark:text-slate-200 font-medium">{project.startDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarArrowDown size={15} className="text-gray-500 dark:text-slate-500" />
                      <span className="text-gray-900 dark:text-slate-200 font-medium">{project.endDate}</span>
                    </div>
                  </div>

                  {/* Start Date - Desktop */}
                  <div className="hidden lg:block text-sm text-gray-700 dark:text-slate-300">
                    {project.startDate}
                  </div>

                  {/* End Date - Desktop */}
                  <div className="hidden lg:block text-sm text-gray-700 dark:text-slate-300">
                    {project.endDate}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-[#2a3040] lg:border-t-0 lg:pt-0 lg:gap-1">
                    <button
                      onClick={() => handleView(project)}
                      className="flex-1 cursor-pointer lg:flex-none
                        bg-blue-600 hover:bg-blue-700
                         dark:text-black
                        text-white py-2 lg:py-1 lg:px-1 rounded text-sm font-medium
                        transition-all duration-150
                        dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]"
                      title="View"
                    >
                      <span className="lg:hidden">View</span>
                      <Eye size={20} className="hidden lg:inline" />
                    </button>

                    <button
                      onClick={() => handleArchive(project.id)}
                      className="flex-1 cursor-pointer lg:flex-none
                        bg-gray-500 hover:bg-gray-600
                        dark:bg-[#31f64b] dark:hover:bg-[#28d940] dark:text-black
                        text-white py-2 lg:py-1 lg:px-1 rounded text-sm font-medium
                        transition-colors"
                      title="Archive"
                    >
                      <span className="lg:hidden">Archive</span>
                      <Archive size={20} className="hidden lg:inline" />
                    </button>

                    <button
                      onClick={() => handleDelete(project.id)}
                      className="flex-1 cursor-pointer lg:flex-none
                        bg-red-600 hover:bg-red-700
                        dark:bg-red-700 dark:hover:bg-red-800
                        text-white py-2 lg:py-1 lg:px-1 rounded text-sm font-medium
                        transition-colors"
                      title="Delete"
                    >
                      <span className="lg:hidden">Delete</span>
                      <Trash2 size={18} className="hidden lg:inline text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 md:px-6 py-4 border-t border-gray-200 dark:border-[#2a3040] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-slate-400">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredProjects.length)} of{" "}
              {filteredProjects.length} projects
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 dark:border-[#2a3040] rounded-lg
                  text-gray-700 dark:text-slate-300
                  hover:bg-gray-50 dark:hover:bg-[#252d3d]
                  disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-[#2a3040] rounded-lg
                  text-gray-700 dark:text-slate-300
                  hover:bg-gray-50 dark:hover:bg-[#252d3d]
                  disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
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
