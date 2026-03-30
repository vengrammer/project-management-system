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
  Check,
  Loader,
} from "lucide-react";
import AddMembers from "./AddMembersForm";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import AddTaskForm from "./AddTaskForm";
import FormEditProject from "./FormEditProject";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import TaskActivityModal from "./TaskActivityModal";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import FormEditTask from "./FormEditTask";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useEffect } from "react";

////-----------------THIS PAGE IS SHARED BY ADMIN,USER-EMPLOYEE, AND MANAGER-----------------////

const UPDATE_PROJECT_STATUS = gql`
  mutation updateProject($updateProjectId: ID!, $status: String) {
    updateProject(id: $updateProjectId, status: $status) {
      message
    }
  }
`;
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
      isArchive
      department {
        id
        name
      }
      projectManager {
        id
        fullname
      }
      projectMgnt {
        _id
        title
      }
      users {
        id
        fullname
        position
      }
    }
  }
`;
const REMOVE_MEMBER = gql`
  mutation updateProject($updateProjectId: ID!, $removeUsers: [ID]) {
    updateProject(id: $updateProjectId, removeUsers: $removeUsers) {
      message
    }
  }
`;

const DELETE_TASK = gql`
  mutation deleteTask($deleteTaskId: ID!) {
    deleteTask(id: $deleteTaskId) {
      id
    }
  }
`;

const GET_TASKS = gql`
  query TaskByProject($taskByProjectId: ID!) {
    taskByProject(id: $taskByProjectId) {
      id
      title
      description
      users {
        id
        fullname
      }
      priority
      status
      completedDate
      createdAt
    }
  }
`;

const getInitials = (name) => {
  if (!name) return "";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const formatStatus = (status) => {
  if (!status) return "";
  const s = String(status).toLowerCase();
  if (s === "todo") return "Not Started";
  if (s === "in_progress" || s === "inprogress" || s === "in progress") return "In Progress";
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
  return parsedDate.toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

function formatTimeAgo(value) {
  if (!value) return "";
  const now = new Date();
  const date = new Date(Number(value));
  const diffMs = now - date;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks <= 2) return `${weeks}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const ProjectDetailsPage = () => {
  const { id } = useParams();

  const location = useLocation();
  const isEmployee = location.pathname.includes("employee");
  const isManager = location.pathname.includes("manager");
  const isArchive = location.pathname.includes("archive");

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
    const s = String(status).toLowerCase().replace(/[_\s]/g, "");
    if (s === "completed") return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-[#31f64b] dark:border-green-800";
    if (s === "inprogress" || s === "in_progress") return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    if (s === "not_started" || s === "todo") return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
    if (s === "onhold") return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
    if (s === "cancelled" || s === "canceled") return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
    return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
  };

  const getPriorityColor = (priority) => {
    if (!priority) return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    const p = String(priority).toLowerCase();
    if (p === "critical") return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
    if (p === "high") return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
    if (p === "medium") return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    if (p === "low") return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
    return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
  };

  const navigate = useNavigate();

  const {
    loading: projectLoading,
    error: projectError,
    data: projectData,
    refetch: refetchProject,
  } = useQuery(GET_PROJECTS, {
    variables: { projectId: id },
    notifyOnNetworkStatusChange: true,
  });

  const auth = useSelector((state) => state.auth);
  const userId = auth.user?.id;
  const role = auth.user?.role;

  const isAdmin = role === "admin";
  const isIncluded = projectData?.project?.users?.some((user) => user.id === userId);
  const isProjectManager = projectData?.project?.projectManager?.id === userId;

  useEffect(() => {
    if (!userId) {
      toast.error("Failed to view the projects. They may have been removed, or you are not part of the project.");
      navigate("/", { replace: true });
      return;
    }
    if (!projectData?.project) return;
    if (!isAdmin && !isIncluded && !isProjectManager) {
      toast.error("Failed to view the projects. They may have been removed, or you are not part of the project.");
      navigate("/", { replace: true });
    }
  }, [userId, isAdmin, isIncluded, isProjectManager, projectData, navigate]);

  const validRoutesForNotArchive = [
    "/admin/projectdetails",
    "/manager/projectdetails",
    "/employee/projectdetails",
  ];

  const validRoutesForArchive = [
    "/admin/archive/projectdetails",
    "/manager/archive/projectdetails",
    "/employee/archive/projectdetails",
  ];

  const validRouteForNotArchive = validRoutesForNotArchive.some((route) =>
    location.pathname.startsWith(route),
  );

  const validRouteForArchive = validRoutesForArchive.some((route) =>
    location.pathname.startsWith(route),
  );

  useEffect(() => {
    const isArchive = projectData?.project?.isArchive;
    if (isArchive === undefined) return;
    if (!isArchive && validRouteForArchive) {
      toast.error("Failed to view the projects. They may have been removed, or you are not part of the project.");
      navigate("/", { replace: true });
    }
    if (isArchive && validRouteForNotArchive) {
      toast.error("Failed to view the projects. They may have been removed, or you are not part of the project.");
      navigate("/", { replace: true });
    }
  }, [projectData, validRouteForNotArchive, validRouteForArchive, navigate]);

  const {
    loading: taskLoading,
    error: taskError,
    data: taskData,
    refetch: refetchTasks,
  } = useQuery(GET_TASKS, {
    variables: { taskByProjectId: id },
    notifyOnNetworkStatusChange: true,
  });

  const refetching = async () => {
    await refetchProject();
    await refetchTasks();
  };

  const [updateProject] = useMutation(REMOVE_MEMBER, {
    onCompleted: () => { toast.success("Member removed successfully"); },
    onError: () => { toast.error("Failed to remove member"); },
    refetchQueries: [{ query: GET_PROJECTS, variables: { projectId: id } }],
    awaitRefetchQueries: true,
  });

  const [deleteTask] = useMutation(DELETE_TASK, {
    onCompleted: () => { toast.success("Task successfully deleted"); },
    onError: () => { toast.error("Failed to delete task"); },
    refetchQueries: [
      { query: GET_TASKS, variables: { taskByProjectId: id } },
      { query: GET_PROJECTS, variables: { projectId: id } },
    ],
    awaitRefetchQueries: true,
  });

  const [updateProjectStatus] = useMutation(UPDATE_PROJECT_STATUS, {
    onCompleted: () => { toast.success("Project status updated successfully."); },
    onError: () => { toast.error("Failed to update the project"); },
    refetchQueries: [{ query: GET_PROJECTS, variables: { projectId: id } }],
  });

  const handleMarkAsDone = (status) => {
    Swal.fire({
      title: `${status === "completed" ? "Mark this project as in progress?" : "Mark this project as completed?"}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm!",
    }).then((result) => {
      if (result.isConfirmed) {
        updateProjectStatus({
          variables: {
            updateProjectId: id,
            status: status === "completed" ? "in progress" : "completed",
          },
        });
      }
    });
  };

  const handleMarkAsNotStarted = () => {
    Swal.fire({
      title: "Mark this project as not started?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm!",
    }).then((result) => {
      if (result.isConfirmed) {
        updateProjectStatus({
          variables: {
            updateProjectId: id,
            status: "not started",
          },
        });
      }
    });
  };

  const handleMarkAsInProgress = () => {
    Swal.fire({
      title: "Mark this project as in progress?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm!",
    }).then((result) => {
      if (result.isConfirmed) {
        updateProjectStatus({
          variables: {
            updateProjectId: id,
            status: "in progress",
          },
        });
      }
    });
  };

  const handleRemoveMember = (userId, assignedTasksCount) => {
    if (assignedTasksCount > 0) {
      Swal.fire({
        title: "Cannot Remove Member",
        text: "This member has assigned tasks. Please reassign or delete tasks first.",
        icon: "error",
      });
      return;
    }
    Swal.fire({
      title: "Are you sure you want to remove this member?",
      text: "remove member from project!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm",
    }).then((result) => {
      if (result.isConfirmed) {
        updateProject({ variables: { updateProjectId: id, removeUsers: [userId] } });
      }
    });
  };

  const handleDeleteTask = (taskID) => {
    Swal.fire({
      title: "Are you sure you want to delete this task?",
      text: "You won't be able to revert this!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTask({ variables: { deleteTaskId: taskID } });
      }
    });
  };

  const calculateProgress = (taskLength, taskComplete, projectStatus) => {
    if (projectStatus === "not started") return 0;
    if (projectStatus === "completed") return 100;
    if (taskLength === 0) return 0;
    return Math.round((taskComplete / taskLength) * 100);
  };

  if (projectLoading || taskLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]">
        <span className="loading loading-spinner loading-xl dark:text-[#31f64b]"></span>
      </div>
    );
  }

  if (projectError || taskError) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]">
        <div className="text-red-600">Failed to load projects and tasks</div>
      </div>
    );
  }

  if (!projectData?.project) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]">
        <div className="text-red-600">Project not found</div>
      </div>
    );
  }

  const project = projectData?.project;
  const tasks = taskData?.taskByProject ?? [];

  const overdue = (project) => {
    const today = new Date();
    const dueDate = new Date(project?.endDate);
    if (project?.status !== "completed") return dueDate < today;
    return false;
  };

  return (
    <div className="flex flex-col h-screen w-full sm:overflow-hidden bg-gray-200 dark:bg-[#181d28]">
      <div className="w-full p-2 sm:p-6 lg:py-8 h-full">

        {/* ── Back Button ── */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() =>
              navigate(
                `/${isEmployee ? "employee" : isManager ? "manager" : "admin"}/${isArchive ? "archive" : "projects"}`,
              )
            }
            className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-[#31f64b] transition-colors duration-150"
          >
            <ArrowLeft size={20} />
            <span>Back to Projects</span>
          </button>
          {project?.projectMgnt && (
            <div className="flex items-center gap-2 text-lg text-gray-600 dark:text-slate-400">
              <span className="text-gray-400 dark:text-slate-500">Project Management:</span>
              <span className="font-semibold text-gray-800 dark:text-slate-200">{project.projectMgnt.title}</span>
            </div>
          )}
        </div>

        {/* ── Project Header Card ── */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`bg-white dark:bg-[#222732] rounded-lg shadow-sm border p-6 mb-2
            ${overdue(project)
              ? "border-red-500 border-2 dark:border-red-500/70"
              : "border-gray-200 dark:border-[#2a3040]"
            }`}
        >
          <div className="flex flex-col w-full h-full lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">
                  {project?.title ? project?.title : "No project title"}
                </h1>
                <span className={`whitespace-nowrap first-letter:uppercase px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project?.status)}`}>
                  {project?.status ? project?.status : "No project status"}
                </span>
                <span className={`whitespace-nowrap px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project?.priority)}`}>
                  {project?.priority ? (
                    <span className="first-letter:uppercase">{project?.priority}</span>
                  ) : "No"}{" "}Priority
                </span>
                {overdue(project) && (
                  <span className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wide">⚠ Overdue</span>
                )}
              </div>
              <p className="text-gray-600 dark:text-slate-400 mb-4">
                {project?.description ? project?.description : "no description"}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <User size={16} />
                  M: {project?.projectManager?.fullname ? project?.projectManager?.fullname : "no manager"}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  Team: {project?.users?.length ? project?.users?.length : "0"} members
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {project?.startDate ? project?.startDate : "no start date"} -{" "}
                  {project?.endDate ? project?.endDate : "no end date"}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 flex-wrap">
              <div>{!isEmployee && !isArchive && !project?.projectMgnt && <FormEditProject />}</div>
              <div>
                {!isEmployee && !isArchive && (
                  <button
                    onClick={() => handleMarkAsDone(project.status)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 text-sm font-semibold text-white
                      ${project.status === "completed"
                        ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500/90 dark:hover:bg-amber-500"
                        : "bg-green-600 hover:bg-green-700 dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940] dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]"
                      }`}
                  >
                    {project.status === "completed" ? <Loader size={18} /> : <Check size={18} />}
                    {project.status === "completed" ? "Mark As In Progress" : "Mark As Completed"}
                  </button>
                )}
              </div>
              <div>
                {!isEmployee && !isArchive && (project.status === "not started") && (
                  <button
                    onClick={() => handleMarkAsInProgress()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 text-sm font-semibold text-white
                      bg-blue-600 hover:bg-blue-700 dark:bg-blue-500/90 dark:hover:bg-blue-500
                      dark:hover:shadow-[0_0_8px_rgba(59,130,246,0.35)]"
                  >
                    <TrendingUp size={18} />
                    Mark As In Progress
                  </button>
                )}
              </div>
              <div>
                {!isEmployee && !isArchive && (project.status === "completed" || project.status === "in_progress" || project.status === "inprogress" || project.status === "in progress") && (
                  <button
                    onClick={() => handleMarkAsNotStarted()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 text-sm font-semibold text-white
                      bg-gray-600 hover:bg-gray-700 dark:bg-gray-500/90 dark:hover:bg-gray-500
                      dark:hover:shadow-[0_0_8px_rgba(107,114,128,0.35)]"
                  >
                    <ArrowLeft size={18} />
                    Mark As Not Started
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Overall Progress</span>
              <span className="text-sm font-bold text-gray-900 dark:text-slate-100">
                {calculateProgress(tasks.length, tasks.filter((t) => t.status === "completed").length, project?.status)}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-[#2a3040] rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-blue-600 dark:from-[#31f64b] dark:to-[#28d940] transition-all duration-500"
                style={{
                  width: `${calculateProgress(tasks.length, tasks.filter((t) => t.status === "completed").length, project?.status)}%`,
                }}
              />
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/40 hover:scale-105 hover:shadow-xl transition-all duration-150">
              <div className="flex items-center justify-between mb-2">
                <Target className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{tasks.length || "0"}</p>
              <p className="text-xs text-gray-600 dark:text-slate-400">Total Tasks</p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-900/40 hover:scale-105 hover:shadow-xl transition-all duration-150">
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-orange-600 dark:text-orange-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {tasks.filter((t) => t.status === "todo").length || "0"}
              </p>
              <p className="text-xs text-gray-600 dark:text-slate-400">Not Started</p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-900/40 hover:scale-105 hover:shadow-xl transition-all duration-150">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="text-orange-600 dark:text-orange-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {tasks.filter((t) => t.status === "in_progress").length || "0"}
              </p>
              <p className="text-xs text-gray-600 dark:text-slate-400">In Progress</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-900/40 hover:scale-105 hover:shadow-xl transition-all duration-150">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="text-green-600 dark:text-[#31f64b]" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {tasks.filter((t) => t.status === "completed").length || "0"}
              </p>
              <p className="text-xs text-gray-600 dark:text-slate-400">Completed</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-900/40 hover:scale-105 hover:shadow-xl transition-all duration-150">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="text-purple-600 dark:text-purple-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{project?.budget ?? "0"}</p>
              <p className="text-xs text-gray-600 dark:text-slate-400">Budget</p>
            </div>
          </div>
        </motion.div>

        {/* ── Tasks + Team ── */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Tasks panel */}
          <div className="lg:col-span-2 flex flex-1 w-full flex-col gap-4">
            <div className="bg-white dark:bg-[#222732] min-h-full overflow-auto rounded-lg shadow-sm border border-gray-200 dark:border-[#2a3040]">
              <div className="p-3 border-b border-gray-200 dark:border-[#2a3040]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Tasks</h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                      {tasks.length || "0"} total tasks
                    </p>
                  </div>
                  {!isEmployee && !isArchive && (
                    <AddTaskForm refetchProjects={async () => await refetching()} />
                  )}
                </div>
              </div>

              {tasks.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-[#2a3040] max-h-105 overflow-auto">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="px-4 py-1 hover:bg-gray-100 dark:hover:bg-[#252d3d] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                              {task.title}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                              {formatStatus(task.status)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                              {formatPriority(task.priority)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{task.description}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-slate-400">
                            <span className="flex items-center gap-1 flex-wrap">
                              {task.users?.length > 0 ? (
                                task.users.map((u) => (
                                  <span
                                    key={u.id}
                                    className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-medium"
                                  >
                                    {u.fullname.split(" ")[0]}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 dark:text-slate-500 text-xs">Unassigned</span>
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              Created: {formatTimeAgo(task.createdAt)}
                            </span>
                            {task.completedDate && (
                              <span className="flex items-center gap-1 text-green-600 dark:text-[#31f64b]">
                                <CheckCircle2 size={14} />
                                Completed: {formatDate(task.completedDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-row gap-1 ml-2">
                          <div>
                            <TaskActivityModal id={task.id} />
                          </div>
                          {!isEmployee && !isArchive && (
                            <div>
                              <FormEditTask taskID={task?.id} />
                            </div>
                          )}
                          {!isEmployee && !isArchive && (
                            <div>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-2 bg-red-600 hover:bg-red-700 dark:bg-red-600/90 dark:hover:bg-red-500
                                  dark:hover:shadow-[0_0_8px_rgba(239,68,68,0.35)]
                                  text-white rounded-lg transition-all duration-150 cursor-pointer"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="justify-items-center py-5">
                  <p className="text-red-400 dark:text-red-500">No task</p>
                </div>
              )}
            </div>
          </div>

          {/* Team Members panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#222732] rounded-lg shadow-sm flex flex-col flex-1 min-h-full border border-gray-200 dark:border-[#2a3040] p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Team Members</h2>
                {!isEmployee && !isArchive && <AddMembers />}
              </div>

              <div className="bg-black dark:bg-[#31f64b]/30 max-w-full h-px mb-4" />

              {(project?.users?.length || 0) > 0 ? (
                <div className="space-y-3 max-h-100 overflow-auto">
                  {(project?.users || []).map((member) => {
                    const assignedTasks = tasks.filter((t) =>
                      t.users?.some((u) => u.id === member.id),
                    );
                    const completedTasks = assignedTasks.filter((t) => {
                      const s = String(t.status).toLowerCase();
                      return s === "completed";
                    });
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#1a1f2b] rounded-lg
                          border border-gray-200 dark:border-[#2a3040]
                          hover:border-blue-300 dark:hover:border-[#31f64b]/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 dark:from-[#31f64b] dark:to-blue-500 flex items-center justify-center text-white dark:text-black font-semibold text-sm">
                            {getInitials(member.fullname)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                              {member.fullname}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-slate-500">
                              {member.position}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 items-center">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                              {assignedTasks.length}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-slate-500">
                              {completedTasks.length} done
                            </p>
                          </div>
                          <div>
                            {!isEmployee && !isArchive && (
                              <button
                                onClick={() => handleRemoveMember(member.id, assignedTasks.length)}
                                className="py-2 px-2 text-white bg-red-600 hover:bg-red-700
                                  dark:bg-red-600/90 dark:hover:bg-red-500
                                  dark:hover:shadow-[0_0_8px_rgba(239,68,68,0.35)]
                                  rounded transition-all duration-150 cursor-pointer"
                                title="Remove member"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="justify-items-center">
                  <p className="text-red-400 dark:text-red-500">No member</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;