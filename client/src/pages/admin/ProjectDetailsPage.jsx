
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
  Pen,
  Check,
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
      #dueDate
      createdAt
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

  //I want to hide the button that employee that only must admin can see
  const location = useLocation();
  const isEmployee = location.pathname.includes("employee");

  // Get status color

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700 border-gray-200";
    const s = String(status).toLowerCase().replace(/[_\s]/g, "");
    if (s === "completed")
      return "bg-green-100 text-green-700 border-green-200";
    if (s === "inprogress" || s === "in_progress")
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (s === "not_started" || s === "todo")
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

  // Task statistics are computed from `taskData.taskByProject` inline where needed.
  const navigate = useNavigate();

  //GET THE PROJECT
  const {
    loading: projectLoading,
    error: projectError,
    data: projectData,
    refetch: refetchProject,
  } = useQuery(GET_PROJECTS, {
    variables: { projectId: id },
    notifyOnNetworkStatusChange: true,
  });

  //GET THE TASK
  const {
    loading: taskLoading,
    error: taskError,
    data: taskData,
    refetch: refetchTasks,
  } = useQuery(GET_TASKS, {
    variables: { taskByProjectId: id },
    notifyOnNetworkStatusChange: true,
  });

  // note: no need to manually refetch on mount, queries already run automatically and
  // mutations have refetchQueries. Removing this effect prevents double fetching
  // which caused a blink/flashing UI during initial mount.

  //this will trigger the add refetch
  const refetching = async () => {
    await refetchProject();
    await refetchTasks();
  };

  //remove the member from the project
  const [updateProject] = useMutation(REMOVE_MEMBER, {
    onCompleted: () => {
      toast.success("Member removed successfully");
    },
    onError: () => {
      toast.error("Failed to remove member");
    },
    refetchQueries: [{ query: GET_PROJECTS, variables: { projectId: id } }],
    awaitRefetchQueries: true,
  });

  //const remove task
  const [deleteTask] = useMutation(DELETE_TASK, {
    onCompleted: () => {
      toast.success("Task successfully deleted");
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
    // After deleting a task, refetch BOTH the task list and the project details.
    refetchQueries: [
      { query: GET_TASKS, variables: { taskByProjectId: id } },
      { query: GET_PROJECTS, variables: { projectId: id } },
    ],
    awaitRefetchQueries: true,
  });

  const [updateProjectStatus] = useMutation(UPDATE_PROJECT_STATUS, {
    onCompleted: () => {
      toast.success("Marked as completed successfully.");
    },
    onError: () => {
      toast.error("Failed to update the project");
    },
    refetchQueries: [{ query: GET_PROJECTS, variables: { projectId: id } }],
  });

  const handleMarkAsDone = () => {
    Swal.fire({
      title: "Mark this project as done?",
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
            status: "completed",
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
        updateProject({
          variables: {
            updateProjectId: id,
            removeUsers: [userId],
          },
        });
      }
    });
  };

  const handleDeleteTask = (taskID) => {
    console.log(taskID);
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
        deleteTask({
          variables: {
            deleteTaskId: taskID,
          },
        });
      }
    });
  };

  const calculateProgress = (taskLength, taskComplete) => {
    if (taskLength === 0) return 0;
    const percent = (taskComplete / taskLength) * 100;
    return Math.round(percent);
  };

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
        <div className="text-red-600">Failed to load projects and tasks</div>
      </div>
    );
  }

  // If the query succeeded but the project is null/undefined, avoid crashing on `projectData.project.*`
  if (!projectData?.project) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Project not found</div>
      </div>
    );
  }


  const project = projectData?.project;
  const tasks = taskData?.taskByProject ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trigger Button */}
      <div className="max-w-7xl mx-auto p-2 sm:p-6 lg:p-5">
        {/* Back Button */}
        <button
          onClick={() =>
            navigate(`/${isEmployee ? "employee" : "admin"}/projects`)
          }
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Projects</span>
        </button>
        {/* Project Header */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {project?.title ? project?.title : "No project title"}
                </h1>
                <span
                  className={`first-letter:uppercase px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    project?.status,
                  )}`}
                >
                  {project?.status ? project?.status : "No project status"}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                    project?.priority,
                  )}`}
                >
                  {project?.priority ? (
                    <span className="first-letter:uppercase">
                      {project?.priority}
                    </span>
                  ) : (
                    "No"
                  )}{" "}
                  Priority
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                {project?.description ? project?.description : "no description"}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User size={16} />
                  PM:{" "}
                  {project?.projectManager?.fullname
                    ? project?.projectManager?.fullname
                    : "no project manager"}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  Team: {project?.users?.length
                    ? project?.users?.length
                    : "0"}{" "}
                  members
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {project?.startDate
                    ? project?.startDate
                    : "no start date"} -{" "}
                  {project?.endDate ? project?.endDate : "no end date"}
                </span>
              </div>
            </div>
            {/**/}

            {/* Buttons for edit project and add member*/}
            <div className="flex gap-3">
              <div>{!isEmployee && <FormEditProject />}</div>
              <div>
                {!isEmployee && (
                  <button
                    onClick={handleMarkAsDone}
                    className="flex items-center gap-2 px-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check size={20} />
                    Mark As Done
                  </button>
                )}
              </div>
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
                  tasks.length,
                  tasks.filter((task) => task.status === "completed").length,
                )}
                %
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{
                  width: `${calculateProgress(
                    tasks.length,
                    tasks.filter((task) => task.status === "completed").length,
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
                {tasks.length ? tasks.length : "0"}
              </p>
              <p className="text-xs text-gray-600">Total Tasks</p>
            </div>
            {/*not started*/}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-orange-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter((task) => task.status === "todo").length || "0"}
              </p>
              <p className="text-xs text-gray-600">Not Started</p>
            </div>
            {/* Inprogress*/}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="text-orange-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter((task) => task.status === "in_progress").length ||
                  "0"}
              </p>
              <p className="text-xs text-gray-600">In Progress</p>
            </div>
            {/* completed*/}
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="text-green-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.filter((task) => task.status === "completed").length ||
                  "0"}
              </p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>

            {/* budget*/}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="text-purple-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {project?.budget ?? "0"}
              </p>
              <p className="text-xs text-gray-600">Budget</p>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Tasks Section (2 columns) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {tasks.length ? tasks.length : "0"} total tasks
                    </p>
                  </div>
                  {!isEmployee && (
                    <AddTaskForm
                      refetchProjects={async () => await refetching()}
                    />
                  )}
                </div>
              </div>
              {/*all task value*/}
              {tasks.length > 0 ? (
                <div className="divide-y divide-gray-200 max-h-105 overflow-auto">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="px-4 py-1 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {task.title}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                task.status,
                              )}`}
                            >
                              {formatStatus(task.status)}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                                task.priority,
                              )}`}
                            >
                              {formatPriority(task.priority)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {task.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1 flex-wrap">
                              {task.users?.length > 0 ? (
                                task.users.map((u) => (
                                  <span
                                    key={u.id}
                                    className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium"
                                  >
                                    {u.fullname.split(" ")[0]}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs">
                                  Unassigned
                                </span>
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              Created: {formatTimeAgo(task.createdAt)}
                            </span>
                            {task.completedDate && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 size={14} />
                                Completed: {formatDate(task.completedDate)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row gap-1">
                          {/*task action */}
                          {/* for the taskactivity */}
                          <div>
                            <TaskActivityModal id={task.id} />
                          </div>

                          {/* EYE FOR THE EDIT TASK*/}
                          {!isEmployee && (
                            <div>
                              <FormEditTask taskID={task?.id} />
                            </div>
                          )}

                          {!isEmployee && (
                            <div>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
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
                {!isEmployee && <AddMembers />}
              </div>

              <div className="bg-black max-w-full h-px mb-4"></div>
              {(project?.users?.length || 0) > 0 ? (
                <div className=" space-y-3 max-h-100 overflow-auto">
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
                            {!isEmployee && (
                              <button
                                onClick={() =>
                                  handleRemoveMember(
                                    member.id,
                                    assignedTasks.length,
                                  )
                                }
                                className="py-2 px-2 text-white bg-red-600 hover:bg-red-700 rounded transition-colors cursor-pointer"
                                title="Delete row"
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
                  <p className="text-red-400 ">No member</p>
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
