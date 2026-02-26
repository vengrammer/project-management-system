import { useMemo, useState } from "react";
import {
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Pencil,
  Trash2,
  Eye,
  Check,
  Search,
  Users,
  ChevronDown,
  ChevronUp,
  Loader,
} from "lucide-react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";

const TEMP_AUTHOR_ID = "6992d115b034bbfbac83b8fb";

const UPDATE_TASK_STATUS_IN_PROGRESS = gql`
  mutation UpdateTask(
    $updateTaskId: ID!
    $status: String
    $completedDate: String
  ) {
    updateTask(
      id: $updateTaskId
      status: $status
      completedDate: $completedDate
    ) {
      id
    }
  }
`;
const GET_TASK = gql`
  query Task($taskId: ID!) {
    task(id: $taskId) {
      id
      title
      completedDate
      status
      users {
        id
        fullname
        position
      }
      project {
        id
        title
      }
    }
  }
`;
const GET_TASKLOGS = gql`
  query TaskLogsByTask($taskId: ID!) {
    taskLogsByTask(taskId: $taskId) {
      id
      content
      status
      createdAt
      updatedAt
      task {
        id
        title
      }
      author {
        id
        fullname
      }
    }
  }
`;
const CREATE_TASKLOG = gql`
  mutation CreateTaskLog(
    $content: String!
    $task: ID!
    $status: TaskStatus!
    $author: ID!
  ) {
    createTaskLog(
      content: $content
      task: $task
      status: $status
      author: $author
    ) {
      id
    }
  }
`;
const UPDATE_TASKLOG = gql`
  mutation UpdateTaskLog($id: ID!, $content: String, $status: TaskStatus) {
    updateTaskLog(id: $id, content: $content, status: $status) {
      id
    }
  }
`;
const DELETE_TASKLOG = gql`
  mutation DeleteTaskLog($id: ID!) {
    deleteTaskLog(id: $id) {
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
const UPDATE_TASK_STATUS_TO_COMPLETED = gql`
  mutation updateTask(
    $updateTaskId: ID!
    $status: String
    $completedDate: String
  ) {
    updateTask(
      id: $updateTaskId
      status: $status
      completedDate: $completedDate
    ) {
      id
    }
  }
`;

const STATUS_OPTIONS = [
  {
    value: "in_progress",
    label: "In Progress",
    color: "bg-blue-100 text-blue-700",
    icon: Clock,
  },
  {
    value: "done",
    label: "Done",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  {
    value: "stuck",
    label: "Stuck",
    color: "bg-red-100 text-red-700",
    icon: AlertCircle,
  },
];

function getStatus(val) {
  return STATUS_OPTIONS.find((s) => s.value === val) || STATUS_OPTIONS[0];
}

function getInitials(name) {
  if (!name) return "??";
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

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

function Avatar({ initials, size = "w-9 h-9", text = "text-sm" }) {
  return (
    <div
      className={`${size} rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold ${text} shadow-sm shrink-0`}
    >
      {initials}
    </div>
  );
}

export default function TaskActivityModal({ id: taskId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("in_progress");
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingStatus, setEditingStatus] = useState("in_progress");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  // mobile: toggle between "post" and "timeline" tabs
  const [mobileTab, setMobileTab] = useState("timeline");
  // mobile: collapse post form
  // const [postFormOpen, setPostFormOpen] = useState(false);

  const { id } = useParams();
  const shouldFetch = isOpen && Boolean(taskId);

  const {
    data: taskData,
    loading: loadingTask,
    error: errorTask,
  } = useQuery(GET_TASK, {
    variables: { taskId },
    skip: !shouldFetch,
  });

  const {
    data: dataTasksLog,
    loading: loadingTasksLog,
    error: errorTasksLog,
    refetch: refetchTaskLogs,
  } = useQuery(GET_TASKLOGS, {
    variables: { taskId },
    skip: !shouldFetch,
    fetchPolicy: "network-only",
  });

  const [updateTaskCompleted] = useMutation(UPDATE_TASK_STATUS_TO_COMPLETED, {
    onCompleted: () => toast.success("Task status updated!"),
    onError: () => toast.error("Failed to update task!"),
    refetchQueries: [{ query: GET_TASKS, variables: { taskByProjectId: id } }],
    awaitRefetchQueries: true,
  });

  const handleMarkAsDone = (tId, currentStatus) => {

    Swal.fire({
      title: "Mark this task as done?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Mark as done",
    }).then((result) => {
      if (result.isConfirmed)
        updateTaskCompleted({
          variables: {
            updateTaskId: tId,
            status: currentStatus === "in_progress" ? "completed" : "in_progress",
            completedDate: currentStatus === "in_progress" ? String(Date.now()) : null,
          },
        });
    });
  };

  const [createTaskLog, { loading: loadingCreate }] = useMutation(
    CREATE_TASKLOG,
    {
      onCompleted: async () => {
        setComment("");
        await refetchTaskLogs();
        toast.success("Update posted");
        // setPostFormOpen(false);
        setMobileTab("timeline");
      },
      onError: () => toast.error("Failed to post update"),
    },
  );

  const [updateTaskLog, { loading: loadingUpdate }] = useMutation(
    UPDATE_TASKLOG,
    {
      onCompleted: async () => {
        setEditingId(null);
        setEditingContent("");
        setEditingStatus("in_progress");
        await refetchTaskLogs();
        toast.success("Update saved");
      },
      onError: () => toast.error("Failed to update log"),
    },
  );

  const [deleteTaskLog, { loading: loadingDelete }] = useMutation(
    DELETE_TASKLOG,
    {
      onCompleted: async () => {
        await refetchTaskLogs();
        toast.success("Update deleted");
      },
      onError: () => toast.error("Failed to delete log"),
    },
  );

  const [updateTask] = useMutation(UPDATE_TASK_STATUS_IN_PROGRESS, {
    onError: () => toast.error("Error updating the task"),
    refetchQueries: [{ query: GET_TASKS, variables: { taskByProjectId: id } }],
    awaitRefetchQueries: true,
  });

  const handleDelete = (taskLogId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) deleteTaskLog({ variables: { id: taskLogId } });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await createTaskLog({
      variables: {
        content: comment.trim(),
        task: taskId,
        status: selectedStatus,
        author: TEMP_AUTHOR_ID,
      },
    });
    //when user add a new log, if the task is not in progress,
    //change it to in progress. and if the task is completed before, change the completedDate to null
    await updateTask({
      variables: { updateTaskId: taskId, status: "in_progress", completedDate: null },
    });
  };

  const allLogs = useMemo(
    () => dataTasksLog?.taskLogsByTask || [],
    [dataTasksLog],
  );

  const uniqueAuthors = useMemo(() => {
    const map = new Map();
    allLogs.forEach((log) => {
      if (log.author?.id) map.set(log.author.id, log.author.fullname);
    });
    return Array.from(map.entries()).map(([id, fullname]) => ({
      id,
      fullname,
    }));
  }, [allLogs]);

  const assignedUsers = useMemo(() => {
    const raw = taskData?.task?.users;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  }, [taskData]);

  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      const matchesUser =
        selectedUser === "all" || log.author?.id === selectedUser;
      const matchesSearch =
        search.trim() === "" ||
        log.content?.toLowerCase().includes(search.toLowerCase()) ||
        log.author?.fullname?.toLowerCase().includes(search.toLowerCase());
      return matchesUser && matchesSearch;
    });
  }, [allLogs, selectedUser, search]);

  const userSummary = useMemo(() => {
    const map = new Map();
    allLogs.forEach((log) => {
      const uid = log.author?.id;
      if (!uid) return;
      if (!map.has(uid))
        map.set(uid, {
          fullname: log.author.fullname,
          total: 0,
          lastStatus: log.status,
        });
      const entry = map.get(uid);
      entry.total += 1;
      entry.lastStatus = log.status;
    });
    return map;
  }, [allLogs]);

  console.log(taskData?.task?.status);

  // ── Post form (shared between desktop left panel and mobile tab) ──
  const PostForm = (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Status
        </label>
        <div className="flex flex-col gap-2">
          {STATUS_OPTIONS.map((s) => {
            const Icon = s.icon;
            const active = selectedStatus === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setSelectedStatus(s.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  active
                    ? s.value === "done"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : s.value === "stuck"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                }`}
              >
                <Icon size={15} /> {s.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          What did you do today?
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your daily update here…"
          rows={4}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
        />
      </div>
      <button
        type="submit"
        disabled={loadingCreate || !taskId}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        <Send size={15} /> Post Update
      </button>
    </form>
  );

  // ── Timeline content ──
  const Timeline = (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search + filter */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search updates…"
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-gray-300 bg-white whitespace-nowrap"
          >
            <Users size={13} />
            <span className="hidden sm:inline">
              {selectedUser === "all"
                ? "All"
                : uniqueAuthors
                    .find((a) => a.id === selectedUser)
                    ?.fullname?.split(" ")[0] || "Member"}
            </span>
            <ChevronDown size={13} />
          </button>
          {userDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-44 py-1 overflow-hidden">
              <button
                onClick={() => {
                  setSelectedUser("all");
                  setUserDropdownOpen(false);
                }}
                className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                  selectedUser === "all"
                    ? "font-semibold text-blue-600"
                    : "text-gray-700"
                }`}
              >
                All Members
              </button>
              {uniqueAuthors.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setSelectedUser(a.id);
                    setUserDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 ${
                    selectedUser === a.id
                      ? "font-semibold text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  <Avatar
                    initials={getInitials(a.fullname)}
                    size="w-5 h-5"
                    text="text-[9px]"
                  />
                  <span className="truncate">{a.fullname}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400 hidden sm:block whitespace-nowrap">
          {filteredLogs.length} update{filteredLogs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {loadingTasksLog || loadingTask ? (
          <div className="p-6 text-sm text-gray-500 text-center">
            Loading...
          </div>
        ) : errorTasksLog || errorTask ? (
          <div className="p-6 text-sm text-red-600 text-center">
            Failed to load activity.
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-6 text-sm text-gray-400 text-center">
            {search || selectedUser !== "all"
              ? "No updates match your filter."
              : "No updates yet."}
          </div>
        ) : (
          filteredLogs.map((log) => {
            const st = getStatus(log.status);
            const Icon = st.icon;
            const isMine = String(log.author?.id) === TEMP_AUTHOR_ID;
            const isEditing = editingId === log.id;
            return (
              <div
                key={log.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <Avatar
                      initials={getInitials(log.author?.fullname)}
                      size="w-8 h-8"
                      text="text-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">
                          {log.author?.fullname || "Unknown"}
                        </p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-400">
                          {formatTimeAgo(log?.updatedAt)}
                        </p>
                      </div>
                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              value={editingStatus}
                              onChange={(e) => setEditingStatus(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={loadingUpdate}
                              onClick={() =>
                                updateTaskLog({
                                  variables: {
                                    id: log.id,
                                    content: editingContent.trim(),
                                    status: editingStatus,
                                  },
                                })
                              }
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setEditingContent("");
                                setEditingStatus("in_progress");
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 mt-1 wrap-break-words">
                          {log.content}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* right side: badge + actions */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${st.color}`}
                    >
                      <Icon size={11} />
                      <span className="text-xs font-semibold hidden sm:inline">
                        {st.label}
                      </span>
                    </div>
                    {isMine && !isEditing && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(log.id);
                            setEditingContent(log.content || "");
                            setEditingStatus(log.status || "in_progress");
                          }}
                          className="p-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={loadingDelete}
                          onClick={() => handleDelete(log.id)}
                          className="p-1.5 text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
      >
        <Eye size={18} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          {/* Modal container — full screen on mobile, constrained on desktop */}
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-4xl sm:max-h-[90vh] h-full sm:h-auto flex flex-col rounded-t-2xl max-h-[95vh]">
            {/* ── HEADER ── */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-start justify-between gap-3 shrink-0">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-blue-600 mb-0.5 truncate">
                  {taskData?.task?.project?.title || "Task Activity"}
                </p>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {taskData?.task?.title || `Task: ${taskId || ""}`}
                </h2>

                {/* Assigned users */}
                {assignedUsers.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Users size={12} />
                      <span>Assigned:</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                      {assignedUsers.map((u) => {
                        const summary = userSummary.get(u.id);
                        const lastSt = summary
                          ? getStatus(summary.lastStatus)
                          : null;
                        return (
                          <button
                            key={u.id}
                            onClick={() =>
                              setSelectedUser(
                                selectedUser === u.id ? "all" : u.id,
                              )
                            }
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium transition-all ${
                              selectedUser === u.id
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            <Avatar
                              initials={getInitials(u.fullname)}
                              size="w-4 h-4"
                              text="text-[8px]"
                            />
                            <span className="max-w-20 truncate">
                              {u.fullname.split(" ")[0]}
                            </span>
                            {lastSt && (
                              <span
                                className={`px-1 py-0.5 rounded-full text-[9px] font-semibold ${lastSt.color}`}
                              >
                                {lastSt.label}
                              </span>
                            )}
                            {summary && (
                              <span className="text-gray-400 text-[10px]">
                                {summary.total}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() =>
                        handleMarkAsDone(
                          taskData?.task?.id,
                          taskData?.task?.status,
                        )
                      }
                      className={`flex items-center gap-1 px-2.5 py-1.5 ${
                        taskData?.task?.status === "in_progress"
                          ? "bg-green-600 text-white rounded-lg hover:bg-green-700"
                          : "bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      } transition-colors text-xs font-semibold shrink-0`}
                    >
                      {taskData?.task?.status === "in_progress" ? (
                        <>
                          <Check size={13} />
                          <span className="text-xs">Mark as Done</span>
                        </>
                      ) : (
                        <>
                          <Loader size={13} />
                          <span className="text-xs">Mark as In Progress</span>
                        </>
                      )}
                      {/* <span className="xs:hidden">Done</span> */}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0 mt-0.5"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* ── MOBILE TABS ── */}
            <div className="flex sm:hidden border-b border-gray-100 shrink-0">
              <button
                onClick={() => setMobileTab("timeline")}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  mobileTab === "timeline"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setMobileTab("post")}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  mobileTab === "post"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
              >
                Post Update
              </button>
            </div>

            {/* ── BODY ── */}

            {/* Mobile: single tab view */}
            <div className="flex sm:hidden flex-1 overflow-hidden flex-col">
              {mobileTab === "timeline" ? (
                Timeline
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <h3 className="text-sm font-bold text-gray-800 mb-4">
                      Post Today's Update
                    </h3>
                    {PostForm}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: two-column layout */}
            <div className="hidden sm:flex flex-1 overflow-hidden">
              {/* Left: Post form */}
              <div className="w-72 shrink-0 border-r border-gray-100 overflow-y-auto p-5">
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-4">
                    Post Today's Update
                  </h3>
                  {PostForm}
                </div>
              </div>

              {/* Right: Timeline */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {Timeline}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
