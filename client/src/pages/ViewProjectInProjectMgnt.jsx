import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
  X, Calendar, DollarSign, Users, Target, Clock,
  TrendingUp, CheckCircle2, User, AlertTriangle,
} from "lucide-react";

const GET_PROJECT = gql`
  query Query($projectId: ID!) {
    project(id: $projectId) {
      client
      budget
      department { id name }
      id
      endDate
      description
      priority
      projectManager { id fullname }
      startDate
      status
      title
      users { id fullname position }
    }
  }
`;

const GET_TASKS = gql`
  query TaskByProject($taskByProjectId: ID!) {
    taskByProject(id: $taskByProjectId) {
      id
      status
    }
  }
`;

const getStatusColor = (status) => {
  if (!status) return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
  const s = String(status).toLowerCase().replace(/[_\s]/g, "");
  if (s === "completed") return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-[#31f64b] dark:border-green-800";
  if (s === "inprogress") return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
  if (s === "notstarted" || s === "todo") return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
  return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
};

const getPriorityColor = (priority) => {
  if (!priority) return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
  const p = String(priority).toLowerCase();
  if (p === "high") return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
  if (p === "medium") return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
  if (p === "low") return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
  return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
};

const getInitials = (name) => {
  if (!name) return "";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const formatDate = (date) => {
  if (!date) return "N/A";
  const parsed = new Date(Number(date));
  if (isNaN(parsed)) return date;
  return parsed.toLocaleString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const calculateProgress = (total, completed, status) => {
  if (status === "not started") return 0;
  if (status === "completed") return 100;
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

function ViewProjectInProjectMgnt({ isOpen = false, setIsOpen, projectId }) {
  const { loading: projectLoading, data: projectData } = useQuery(GET_PROJECT, {
    variables: { projectId },
    skip: !isOpen || !projectId,
  });

  const { loading: taskLoading, data: taskData } = useQuery(GET_TASKS, {
    variables: { taskByProjectId: projectId },
    skip: !isOpen || !projectId,
  });

  if (!isOpen) return null;

  const project = projectData?.project;
  const tasks = taskData?.taskByProject ?? [];

  const isOverdue = project?.endDate && project?.status !== "completed"
    ? new Date(Number(project.endDate)) < new Date()
    : false;

  const totalTasks = tasks.length;
  const notStarted = tasks.filter((t) => ["todo", "not started"].includes(String(t.status).toLowerCase())).length;
  const inProgress = tasks.filter((t) => ["in_progress", "inprogress", "in progress"].includes(String(t.status).toLowerCase())).length;
  const completed = tasks.filter((t) => String(t.status).toLowerCase() === "completed").length;
  const progress = calculateProgress(totalTasks, completed, project?.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#222732] rounded-xl shadow-xl dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-[#2a3040]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Project Details</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-[#2a3040] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {(projectLoading || taskLoading) ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-10 h-10 border-4 border-blue-500 dark:border-[#31f64b] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !project ? (
          <div className="py-16 text-center text-red-500 dark:text-red-400">Project not found.</div>
        ) : (
          <div className="p-5 flex flex-col gap-5">

            {/* Title + badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">{project.title || "No title"}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border first-letter:uppercase ${getStatusColor(project.status)}`}>
                  {project.status || "No status"}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border first-letter:uppercase ${getPriorityColor(project.priority)}`}>
                  {project.priority || "No priority"} Priority
                </span>
                {isOverdue && (
                  <span className="flex items-center gap-1 text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wide">
                    <AlertTriangle size={12} /> Overdue
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {project.description || "No description"}
              </p>
            </div>

            {/* Info row */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <User size={15} />
                {project.projectManager?.fullname || "No manager"}
              </span>
              <span className="flex items-center gap-1">
                <Users size={15} />
                {project.users?.length || 0} members
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={15} />
                {formatDate(project.startDate)} — {formatDate(project.endDate)}
              </span>
              {project.client && (
                <span className="flex items-center gap-1">
                  <User size={15} />
                  Client: {project.client}
                </span>
              )}
              {project.department?.name && (
                <span className="flex items-center gap-1">
                  <Target size={15} />
                  {project.department.name}
                </span>
              )}
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="font-medium text-gray-700 dark:text-slate-300">Overall Progress</span>
                <span className="font-bold text-gray-900 dark:text-slate-100">{progress}%</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-[#2a3040] rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-blue-600 dark:from-[#31f64b] dark:to-[#28d940] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Task stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-900/40">
                <Target className="text-blue-600 dark:text-blue-400 mb-1" size={18} />
                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{totalTasks}</p>
                <p className="text-xs text-gray-600 dark:text-slate-400">Total Tasks</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-100 dark:border-orange-900/40">
                <Clock className="text-orange-600 dark:text-orange-400 mb-1" size={18} />
                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{notStarted}</p>
                <p className="text-xs text-gray-600 dark:text-slate-400">Not Started</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-900/40">
                <TrendingUp className="text-blue-600 dark:text-blue-400 mb-1" size={18} />
                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{inProgress}</p>
                <p className="text-xs text-gray-600 dark:text-slate-400">In Progress</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-100 dark:border-green-900/40">
                <CheckCircle2 className="text-green-600 dark:text-[#31f64b] mb-1" size={18} />
                <p className="text-xl font-bold text-gray-900 dark:text-slate-100">{completed}</p>
                <p className="text-xs text-gray-600 dark:text-slate-400">Completed</p>
              </div>
            </div>

            {/* Budget */}
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/40 rounded-lg p-3">
              <DollarSign size={16} className="text-purple-600 dark:text-purple-400" />
              <span className="font-medium">Budget:</span>
              <span className="font-bold text-gray-900 dark:text-slate-100">{project.budget ?? "N/A"}</span>
            </div>

            {/* Team members */}
            {(project.users?.length || 0) > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                  <Users size={15} /> Team Members
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.users.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-[#1a1f2b] border border-gray-200 dark:border-[#2a3040] rounded-lg"
                    >
                      <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-purple-500 dark:from-[#31f64b] dark:to-blue-500 flex items-center justify-center text-white dark:text-black text-xs font-bold">
                        {getInitials(member.fullname)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-slate-100">{member.fullname}</p>
                        {member.position && (
                          <p className="text-[10px] text-gray-500 dark:text-slate-500">{member.position}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default ViewProjectInProjectMgnt;