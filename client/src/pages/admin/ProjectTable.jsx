import { Eye, Pen, Trash, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import {motion} from "framer-motion"
import axios from "axios";
import { GRAPHQL_URL } from "@/config/api";

export default function ProjectTable() {
  
  const GET_PROJECTS = `
  query Projects {
    projects {
      id
      title
      description
      priority
      status
      department
      progress
      tags
      budget
      startDate
      endDate
      createdAt
      updatedAt
    }
  }
  `;
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const getAllProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          GRAPHQL_URL,
          { query: GET_PROJECTS },
          { headers: { "Content-Type": "application/json" } },
        );
         if (!response?.data?.data?.projects?.length === 0) {
           console.log("No projects found");
           return;
         }
         setProjects(response?.data?.data?.projects);
      } catch (error) {
        console.log("theres an error here", error.message);
      }finally{
        setLoading(false);
      }
    };
    getAllProjects()
  }, [GET_PROJECTS]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search filter
  const filteredProjects = projects.filter((project) => {
    const search = searchTerm.toLowerCase();
    return (
      project.title?.toLowerCase().includes(search) ||
      project.description?.toLowerCase().includes(search) ||
      project.department?.toLowerCase().includes(search) ||
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
    console.log("View project:", project);
    alert(`Viewing: ${project.title}`);
  };

  const handleEdit = (project) => {
    console.log("Edit project:", project);
    alert(`Editing: ${project.title}`);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects(projects.filter((p) => p.id !== id));
      console.log("Deleted project:", id);
    }
  };

  // Helper functions
  const getPriorityColor = (priority) => {
    if (priority === "high") return "bg-red-100 text-red-800";
    if (priority === "medium") return "bg-yellow-100 text-yellow-800";
    if (priority === "low") return "bg-green-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusColor = (status) => {
    if (status === "in progress") return "bg-blue-100 text-blue-800";
    if (status === "not started") return "bg-purple-100 text-purple-800";
    if (status === "completed") return "bg-green-100 text-green-800";
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
            <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto">
              + New Project
            </button>
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

        {/* Grid Body */}
        <div className="divide-y divide-gray-200 h-150 overflow-auto">
          {currentProjects.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
            {loading ? "loading.." : "No projects found"}
            </div>
          ) : (
            currentProjects.map((project) => (
              <div
                key={project.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Desktop Grid Layout */}
                <div className="hidden lg:grid lg:grid-cols-9 gap-4 px-6 py-4 items-center">
                  <div>
                    <div className="font-medium text-gray-900">
                      {project.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {project.description}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 p-auto ">
                    {project.department}
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 text-sm font-medium rounded-full ${getPriorityColor(project.priority)}`}
                    >
                      {project.priority}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    ${project.budget?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-700">
                    {project.startDate}
                  </div>
                  <div className="text-sm text-gray-700">{project.endDate}</div>
                  {/* button for the desktop view*/}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleView(project)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:cursor-pointer"
                    >
                      <Eye size={22} />
                    </button>
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium hover:cursor-pointer"
                    >
                      <Pen size={22} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium hover:cursor-pointer"
                    >
                      <Trash2 size={22} />
                    </button>
                  </div>
                </div>

                {/* Mobile Card Layout */}
                <div className="lg:hidden p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Department:</span>
                      <div className="text-gray-900 font-medium">
                        {project.department}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">End Date:</span>
                      <div className="text-gray-900 font-medium">
                        {project.endDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}
                    >
                      {project.status}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}
                    >
                      {project.priority}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500">Progress</span>
                      <span className="text-sm text-gray-600 font-medium">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-500">Budget: </span>
                    <span className="text-gray-900 font-medium">
                      ${project.budget?.toLocaleString()}
                    </span>
                  </div>
                  {/*button for the mobile action*/}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleView(project)}
                      className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-lg text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(project)}
                      className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 py-2 rounded-lg text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
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