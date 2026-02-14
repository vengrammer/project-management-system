import React, { useState } from "react";
import AddMembers from "./AddMembersForm";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Target,
  Clock,
  TrendingUp,
  CheckCircle2,
  Trash2,
  User,
  Pencil,
  Eye,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AddTaskForm from "./AddTaskForm";
import FormEditProject from "./FormEditProject";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Toaster } from "react-hot-toast";

const GET_PROJECTS = gql`
  query Project($projectId: ID!) {
    project(id: $projectId) {
      title
      client
      budget
      description
      priority
      startDate
      status
      endDate
      id
      department {
        id
        name
      }
      projectManager {
        id
        fullname
      }
      users {
        id
        fullname
        position
      }
    }
  }
`;

const GET_TASKS = gql`
  query TaskByProject($taskByProjectId: ID!) {
    taskByProject(id: $taskByProjectId) {
      id
      title
      description
      assignedTo {
        id
        fullname
      }
      priority
      status
      dueDate
    }
  }
`;

//get the first letter of the fullname and return it for the profile
const getInitials = (name) => {
  if (!name) return "";

  const words = name.trim().split(" ");

  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
};

// format status
const formatStatus = (status) => {
  if (!status) return "";
  const s = String(status).toLowerCase();
  if (s === "todo") return "Not Started";
  if (s === "in_progress" || s === "inprogress" || s === "in progress")
    return "In Progress";
  if (s === "completed") return "Completed";
  if (s === "not started") return "Not Started";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const formatPriority = (p) => {
  if (!p) return "";
  const s = String(p).toLowerCase();
  if (s === "high") return "High";
  if (s === "medium") return "Medium";
  if (s === "low") return "Low";
  if (s === "critical") return "Critical";
  return p.charAt(0).toUpperCase() + p.slice(1);
};

const formatDate = (date) => {
  if (!date) return "N/A";

  const parsedDate = new Date(Number(date));

  return parsedDate.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ProjectDetailsPage = () => {
  const { id } = useParams();

  // Tasks data
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Design Homepage Mockup",
      description: "Create initial design concepts for the new homepage",
      status: "Completed",
      priority: "High",
      assignedTo: "John Doe",
      dueDate: "2024-02-05",
      completedDate: "2024-02-04",
      progress: 100,
    },
    {
      id: 2,
      title: "Implement Product Catalog",
      description:
        "Build the product catalog with filtering and search functionality",
      status: "In Progress",
      priority: "High",
      assignedTo: "Jane Smith",
      dueDate: "2024-02-20",
      completedDate: null,
      progress: 75,
    },
    {
      id: 3,
      title: "Shopping Cart Integration",
      description: "Integrate shopping cart with payment gateway",
      status: "In Progress",
      priority: "Critical",
      assignedTo: "Mike Johnson",
      dueDate: "2024-02-25",
      completedDate: null,
      progress: 40,
    },
    {
      id: 4,
      title: "User Authentication System",
      description: "Implement secure login and registration system",
      status: "Not Started",
      priority: "Medium",
      assignedTo: "Emily Davis",
      dueDate: "2024-03-01",
      completedDate: null,
      progress: 0,
    },
    {
      id: 5,
      title: "Mobile Responsive Design",
      description: "Ensure all pages are mobile-friendly",
      status: "Not Started",
      priority: "High",
      assignedTo: "Tom Brown",
      dueDate: "2024-03-10",
      completedDate: null,
      progress: 0,
    },

    {
      id: 6,
      title: "Mobile Responsive Design",
      description: "Ensure all pages are mobile-friendly",
      status: "Not Started",
      priority: "High",
      assignedTo: "Tom Brown",
      dueDate: "2024-03-10",
      completedDate: null,
      progress: 0,
    },

    {
      id: 7,
      title: "Mobile Responsive Design",
      description: "Ensure all pages are mobile-friendly",
      status: "Not Started",
      priority: "High",
      assignedTo: "Tom Brown",
      dueDate: "2024-03-10",
      completedDate: null,
      progress: 0,
    },
  ]);

  // Team members
  // const [teamMembers] = useState([
  //   { id: 1, name: "John Doe", role: "UI/UX Designer", avatar: "JD" },
  //   { id: 2, name: "Jane Smith", role: "Frontend Developer", avatar: "JS" },
  //   { id: 3, name: "Mike Johnson", role: "Backend Developer", avatar: "MJ" },
  //   { id: 4, name: "Emily Davis", role: "Full Stack Developer", avatar: "ED" },
  //   { id: 5, name: "Tom Brown", role: "QA Engineer", avatar: "TB" },
  //   { id: 6, name: "Lisa Anderson", role: "DevOps Engineer", avatar: "LA" },
  //   { id: 7, name: "David Lee", role: "Product Manager", avatar: "DL" },
  //   { id: 8, name: "Sarah Wilson", role: "Business Analyst", avatar: "SW" },
  //   { id: 9, name: "Emily Davis", role: "Full Stack Developer", avatar: "ED" },
  //   { id: 10, name: "Tom Brown", role: "QA Engineer", avatar: "TB" },
  //   { id: 11, name: "Lisa Anderson", role: "DevOps Engineer", avatar: "LA" },
  //   { id: 12, name: "David Lee", role: "Product Manager", avatar: "DL" },
  //   { id: 13, name: "Sarah Wilson", role: "Business Analyst", avatar: "SW" },
  // ]);

  // const [newTask, setNewTask] = useState({
  //   title: "",
  //   description: "",
  //   priority: "Medium",
  //   assignedTo: "",
  //   dueDate: "",
  //   status: "Not Started",
  //   progress: 0,
  // });

  // Handle add task
  // const handleAddTask = (e) => {
  //   e.preventDefault();
  //   const task = {
  //     id: Math.max(...tasks.map((t) => t.id)) + 1,
  //     ...newTask,
  //     completedDate: null,
  //   };
  //   setTasks([...tasks, task]);
  //   setIsAddTaskOpen(false);
  //   setNewTask({
  //     title: "",
  //     description: "",
  //     priority: "Medium",
  //     assignedTo: "",
  //     dueDate: "",
  //     status: "Not Started",
  //     progress: 0,
  //   });
  // };

  // Handle delete task
  const handleDeleteTask = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter((task) => task.id !== id));
    }
  };

  // Get status color

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700 border-gray-200";
    const s = String(status).toLowerCase().replace(/[_\s]/g, "");
    if (s === "completed")
      return "bg-green-100 text-green-700 border-green-200";
    if (s === "inprogress" || s === "in_progress")
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (s === "notstarted" || s === "todo")
      return "bg-gray-100 text-gray-700 border-gray-200";
    if (s === "onhold")
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (s === "cancelled" || s === "canceled")
      return "bg-red-100 text-red-700 border-red-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    if (!priority) return "bg-blue-100 text-blue-700 border-blue-200";
    const p = String(priority).toLowerCase();
    if (p === "critical") return "bg-red-100 text-red-700 border-red-200";
    if (p === "high") return "bg-orange-100 text-orange-700 border-orange-200";
    if (p === "medium") return "bg-blue-100 text-blue-700 border-blue-200";
    if (p === "low") return "bg-gray-100 text-gray-700 border-gray-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  const calculateProgress = (taskLength, taskComplete) => {
    if (taskLength === 0) return 0;
    const percent = (taskComplete / taskLength) * 100;
    return Math.round(percent);
  };

  // Task statistics are computed from `taskData.taskByProject` inline where needed.
  const navigate = useNavigate();

  //GET THE PROJECT
  const {
    loading: projectLoading,
    error: projectError,
    data: projectData,
  } = useQuery(GET_PROJECTS, { variables: { projectId: id } });

  //GET THE TASK
  const {
    loading: taskLoading,
    error: taskError,
    data: taskData,
  } = useQuery(GET_TASKS, { variables: { taskByProjectId: id } });

  //show the error and loading when getting the projects
  if (projectLoading || taskLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }
  if (projectError || taskError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Toaster />
        <div className="text-red-600">Failed to load projects and tasks</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trigger Button */}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          bottom: 20,
          right: 20,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e293b",
            color: "#fff",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "14px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          },

          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },

          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/projects")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Projects</span>
        </button>
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {projectData.project.title
                    ? projectData.project.title
                    : "No project title"}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs flex gap-1 font-medium border ${getStatusColor(projectData.project.status)}`}
                >
                  {projectData.project.status
                    ? projectData.project.status
                    : "No project status"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs flex gap-1 font-medium border ${getPriorityColor(projectData.project.priority)}`}
                >
                  {projectData.project.priority ? (
                    <div className="first-letter:uppercase">
                      {projectData.project.priority}
                    </div>
                  ) : (
                    "No"
                  )}{" "}
                  Priority
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                {projectData.project.description
                  ? projectData.project.description
                  : "no description"}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User size={16} />
                  PM:{" "}
                  {projectData.project.projectManager.fullname
                    ? projectData.project.projectManager.fullname
                    : "no project manager"}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  Team:{" "}
                  {projectData.project.users.length
                    ? projectData.project.users.length
                    : "0"}{" "}
                  members
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {projectData.project.startDate
                    ? projectData.project.startDate
                    : "no start date"}{" "}
                  -{" "}
                  {projectData.project.endDate
                    ? projectData.project.endDate
                    : "no end date"}
                </span>
              </div>
            </div>
            {/**/}

            {/* Buttons for edit project and add member*/}
            <div className="flex gap-3">
              <FormEditProject />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Overall Progress
              </span>
              <span className="text-sm font-bold text-gray-900">
                {calculateProgress(
                  taskData.taskByProject.length,
                  taskData.taskByProject.filter(
                    (task) => task.status === "completed",
                  ).length,
                )}
                %
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{
                  width: `${calculateProgress(
                    taskData.taskByProject.length,
                    taskData.taskByProject.filter(
                      (task) => task.status === "completed",
                    ).length,
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {/* total task*/}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <Target className="text-blue-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {taskData.taskByProject.length
                  ? taskData.taskByProject.length
                  : "0"}
              </p>
              <p className="text-xs text-gray-600">Total Tasks</p>
            </div>
            {/*not started*/}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-orange-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {taskData.taskByProject.filter(
                  (task) => task.status === "in_progress",
                ).length
                  ? taskData.taskByProject.filter(
                      (task) => task.status === "in_progress",
                    ).length
                  : "0"}
              </p>
              <p className="text-xs text-gray-600">Not Started</p>
            </div>
            {/* Inprogress*/}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="text-orange-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {taskData.taskByProject.filter(
                  (task) => task.status === "in_progress",
                ).length
                  ? taskData.taskByProject.filter(
                      (task) => task.status === "in_progress",
                    ).length
                  : "0"}
              </p>
              <p className="text-xs text-gray-600">In Progress</p>
            </div>
            {/* completed*/}
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="text-green-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {taskData.taskByProject.filter(
                  (task) => task.status === "completed",
                ).length
                  ? taskData.taskByProject.filter(
                      (task) => task.status === "completed",
                    ).length
                  : "0"}
              </p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>

            {/* budget*/}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="text-purple-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {projectData.project.budget}
              </p>
              <p className="text-xs text-gray-600">Budget</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Section (2 columns) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {taskData.taskByProject.length
                        ? taskData.taskByProject.length
                        : "0"}{" "}
                      total tasks
                    </p>
                  </div>
                  <AddTaskForm />
                </div>
              </div>
              {/*all task value*/}
              {taskData.taskByProject.length > 0 ? (
                <div className="divide-y divide-gray-200 max-h-160 overflow-auto">
                  {taskData.taskByProject.map((task) => (
                    <div
                      key={task.id}
                      className="p-6 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {task.title}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}
                            >
                              {formatStatus(task.status)}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}
                            >
                              {formatPriority(task.priority)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {task.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {task.assignedTo?.fullname ||
                                task.assignedTo ||
                                "Unassigned"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              Due: {formatDate(task.dueDate)}
                            </span>
                            {task.completedDate && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 size={14} />
                                Completed: {formatDate(task.completedDate)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row gap-2">
                          <button
                            onClick={() =>
                              navigate("/taskactivity", { replace: true })
                            }
                            className="p-2 text-blue-600 hover:bg-blue-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 text-green-600 hover:bg-green-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 text-red-600 hover:bg-red-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="justify-items-center py-5">
                  <p className="text-red-400 ">No task</p>
                </div>
              )}
            </div>
          </div>
          {/* Team Members Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Team Members
                </h2>
                <AddMembers />
              </div>

              <div className="bg-black max-w-full h-px mb-4"></div>
              {projectData.project.users.length > 0 ? (
                <div className=" space-y-3 max-h-160 overflow-auto">
                  {projectData.project.users.map((member) => {
                    const assignedTasks = (
                      taskData?.taskByProject || []
                    ).filter(
                      (t) =>
                        (t.assignedTo?.fullname || t.assignedTo) ===
                        member.fullname,
                    );
                    const completedTasks = assignedTasks.filter((t) => {
                      const s = String(t.status).toLowerCase();
                      return s === "completed";
                    });
                    return (
                      <div
                        key={member.id}
                        className=" flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {getInitials(member.fullname)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {member.fullname}
                            </p>
                            <p className="text-xs text-gray-600">
                              {member.position}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-gap-4">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {assignedTasks.length}
                            </p>
                            <p className="text-xs text-gray-600">
                              {completedTasks.length} done
                            </p>
                          </div>
                          <div className="pl-3">
                            <button
                              // onClick={() => handleDeleteRow(row.id)}
                              className="py-3 px-3 text-red-600 hover:text-white hover:bg-red-700 rounded transition-colors cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="justify-items-center">
                  <p className="text-red-400 ">No member</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;