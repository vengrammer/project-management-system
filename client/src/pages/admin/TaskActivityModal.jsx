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
} from "lucide-react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// temporary user id
const TEMP_AUTHOR_ID = "6992d115b034bbfbac83b8fb";

const GET_TASK = gql`
  query Task($taskId: ID!) {
    task(id: $taskId) {
      id
      title
      assignedTo {
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
      task {
        id
        title
      }
      status
      author {
        id
        fullname
      }
      createdAt
      updatedAt
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

// ─── status config ────────────────────────────────────────
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

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (weeks <= 2) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;

  // If more than 2 weeks → show full date
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── avatar ───────────────────────────────────────────────
function Avatar({ initials, size = "w-9 h-9", text = "text-sm" }) {
  return (
    <div
      className={`${size} rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold ${text} shadow-sm`}
    >
      {initials}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────
export default function TaskActivityModal({ id: taskId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("in_progress");
  const [comment, setComment] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingStatus, setEditingStatus] = useState("in_progress");

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

  const [createTaskLog, { loading: loadingCreate }] = useMutation(
    CREATE_TASKLOG,
    {
      onCompleted: async () => {
        setComment("");
        await refetchTaskLogs();
        toast.success("Update posted");
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

  const handleDelete = (taskLogId) => {
    // show confirmation first, then delete only if user confirms
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTaskLog({
          variables: { id: taskLogId },
        });
      }
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
  };

  const taskLogs = useMemo(() => {
    return dataTasksLog?.taskLogsByTask || [];
  }, [dataTasksLog?.taskLogsByTask]);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-blue-600 hover:bg-blue-700 hover:text-white rounded-lg transition-colors cursor-pointer"
      >
        <Eye size={18}/>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            {/* ── header ── */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-600 mb-1">
                  {taskData?.task?.project?.title || "Task Activity"}
                </p>
                <h2 className="text-xl font-bold text-gray-900">
                  {taskData?.task?.title || `Task: ${taskId || ""}`}
                </h2>
                {taskData?.task?.assignedTo?.fullname && (
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar
                      initials={getInitials(taskData.task.assignedTo.fullname)}
                      size="w-6 h-6"
                      text="text-xs"
                    />
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        {taskData.task.assignedTo.fullname}
                      </p>
                      <p className="text-xs text-gray-400">
                        {taskData.task.assignedTo.position || "Assignee"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* ── scrollable content ── */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* ── update form ── */}
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-5 mb-5 border border-blue-100">
                <h3 className="text-sm font-bold text-gray-800 mb-4">
                  Post Today's Update
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* status picker */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="flex gap-2">
                      {STATUS_OPTIONS.map((s) => {
                        const Icon = s.icon;
                        const active = selectedStatus === s.value;
                        return (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => setSelectedStatus(s.value)}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                              active
                                ? s.value === "done"
                                  ? "border-green-500 bg-green-50 text-green-700"
                                  : s.value === "stuck"
                                  ? "border-red-500 bg-red-50 text-red-700"
                                  : "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <Icon size={16} />
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* comment */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      What did you do today?
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your daily update here…"
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>

                  {/* submit */}
                  <button
                    type="submit"
                    disabled={loadingCreate || !taskId}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send size={16} />
                    Post Update
                  </button>
                </form>
              </div>

              {/* ── updates log ── */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-sm font-bold text-gray-800">
                    Activity Timeline
                  </p>
                  <p className="text-xs text-gray-500">
                    {taskLogs.length} update{taskLogs.length !== 1 ? "s" : ""}{" "}
                    posted
                  </p>
                </div>

                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {loadingTasksLog || loadingTask ? (
                    <div className="p-4 text-sm text-gray-500">Loading...</div>
                  ) : errorTasksLog || errorTask ? (
                    <div className="p-4 text-sm text-red-600">
                      Failed to load task activity.
                    </div>
                  ) : taskLogs.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">
                      No updates yet.
                    </div>
                  ) : (
                    taskLogs.map((log) => {
                      const st = getStatus(log.status);
                      const Icon = st.icon;
                      const isMine = String(log.author?.id) === TEMP_AUTHOR_ID;
                      const isEditing = editingId === log.id;
                      return (
                        <div
                          key={log.id}
                          className="p-4 hover:bg-gray-50 transition-colors"
                        >
                          {/* row: avatar + name + status + date */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-start gap-3 flex-1">
                              <Avatar
                                initials={getInitials(log.author?.fullname)}
                                size="w-8 h-8"
                                text="text-xs"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {log.author?.fullname || "Unknown"}
                                  </p>
                                  <span className="text-xs text-gray-400">
                                    •
                                  </span>
                                  <p className="text-xs text-gray-500">
                                    {formatTimeAgo(log?.updatedAt)}
                                  </p>
                                </div>
                                {isEditing ? (
                                  <div className="mt-2 space-y-2">
                                    <textarea
                                      value={editingContent}
                                      onChange={(e) =>
                                        setEditingContent(e.target.value)
                                      }
                                      rows={3}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex items-center gap-2">
                                      <select
                                        value={editingStatus}
                                        onChange={(e) =>
                                          setEditingStatus(e.target.value)
                                        }
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
                                  <div className="flex flex-col gap-1 flex-1 min-w-0 ">
                                    <p className=" text-sm text-gray-700 mt-1.5">
                                      {log.content}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* status badge + edit */}
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${st.color}`}
                              >
                                <Icon size={12} />
                                <span className="text-xs font-semibold">
                                  {st.label}
                                </span>
                              </div>
                              {isMine && !isEditing && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingId(log.id);
                                      setEditingContent(log.content || "");
                                      setEditingStatus(
                                        log.status || "in_progress",
                                      );
                                    }}
                                    className="p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={loadingDelete}
                                    onClick={() => handleDelete(log.id)}
                                    className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
