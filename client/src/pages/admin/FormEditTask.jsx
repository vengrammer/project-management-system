import { Pencil, Plus, XCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const GET_MEMBERS = gql`
  query Project($projectId: ID!) {
    project(id: $projectId) {
      users { id fullname position }
    }
  }
`;

const GET_TASKS = gql`
  query TaskByProject($taskByProjectId: ID!) {
    taskByProject(id: $taskByProjectId) {
      id title description
      users { id fullname }
      priority status
    }
  }
`;

const GET_TASK = gql`
  query Query($taskId: ID!) {
    task(id: $taskId) {
      id title description
      users { id fullname }
      priority status
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: ID! $title: String $description: String
    $priority: String $status: String $users: [ID]
  ) {
    updateTask(id: $id title: $title description: $description
      priority: $priority status: $status users: $users
    ) {
      id title
      users { id }
    }
  }
`;

const CREATE_NOTIF = gql`
  mutation CreateNotif($input: AddNotifInput!) {
    createNotif(input: $input) { id isRead title }
  }
`;

const toInputDate = (val) => {
  if (!val) return "";
  const n = Number(val);
  const d = Number.isNaN(n) ? new Date(val) : new Date(n);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

// Shared input/select/textarea class
const inputCls =
  "w-full px-4 py-2 rounded-lg text-sm transition-all " +
  "border border-gray-300 dark:border-[#2a3040] " +
  "bg-white dark:bg-[#1a1f2b] " +
  "text-gray-800 dark:text-slate-200 " +
  "placeholder-gray-400 dark:placeholder-slate-600 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40 focus:border-transparent";

const labelCls = "block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2";

function FormEditTask({ taskID }) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "", description: "", priority: "medium", assignedTo: [], dueDate: "", status: "todo",
  });

  const [oldMember, setOldMember] = useState([]);
  const oldMemberRef = useRef([]);
  const initializedRef = useRef(false);

  useEffect(() => { oldMemberRef.current = oldMember; }, [oldMember]);

  const auth = useSelector((state) => state.auth);
  const userId = auth.user?.id;
  const { id } = useParams();

  const { loading: memberLoading, error: memberError, data: memberData } = useQuery(GET_MEMBERS, {
    variables: { projectId: id },
    skip: !isAddTaskOpen,
    onError: () => toast.error("Failed to load members"),
  });

  const { loading: loadingTask, error: errorTask, data: taskData } = useQuery(GET_TASK, {
    variables: { taskId: taskID },
    skip: !isAddTaskOpen || !taskID,
    fetchPolicy: "cache-and-network",
    onError: () => toast.error("Failed to load task"),
  });

  useEffect(() => {
    function callMe() {
      if (!isAddTaskOpen) { initializedRef.current = false; return; }
      if (initializedRef.current) return;
      const t = taskData?.task;
      if (!t) return;
      initializedRef.current = true;
      const oldUsers = t.users?.map((u) => u.id) ?? [];
      setOldMember(oldUsers);
      oldMemberRef.current = oldUsers;
      setNewTask({
        title: t.title ?? "", description: t.description ?? "",
        priority: t.priority ?? "medium", assignedTo: oldUsers,
        dueDate: toInputDate(t.dueDate), status: t.status ?? "todo",
      });
    }
    callMe();
  }, [isAddTaskOpen, taskData]);

  const [createNotif] = useMutation(CREATE_NOTIF);

  const [updateTask, { loading: updatingTask }] = useMutation(UPDATE_TASK, {
    onCompleted: (data) => {
      toast.success("Task updated successfully");
      const oldMembers = oldMemberRef.current || [];
      const newMembers = newTask.assignedTo || [];
      const hasChanges = JSON.stringify(oldMembers.sort()) !== JSON.stringify(newMembers.sort());
      if (!hasChanges) { setIsAddTaskOpen(false); return; }
      const removedMembers = oldMembers.filter((id) => !newMembers.includes(id));
      const addedMembers = newMembers.filter((id) => !oldMembers.includes(id));
      if (removedMembers && removedMembers.length > 0) {
        createNotif({ variables: { input: { entity: { id: taskID, type: "Task" }, isRead: false, message: `You have been removed from the task "${data?.updateTask?.title}".`, recipients: removedMembers, sender: userId, title: "Removed from Task", type: "Task Removed" } } });
      }
      if (addedMembers && addedMembers.length > 0) {
        createNotif({ variables: { input: { entity: { id: taskID, type: "Task" }, isRead: false, message: `You have been assigned to the task "${data?.updateTask?.title}".`, recipients: addedMembers, sender: userId, title: "Assigned to Task", type: "Task Assigned" } } });
      }
      setIsAddTaskOpen(false);
    },
    onError: () => toast.error("Failed to update task"),
    refetchQueries: [{ query: GET_TASKS, variables: { taskByProjectId: id } }],
    awaitRefetchQueries: true,
  });

  const handleUpdateTask = (e) => {
    e.preventDefault();
    updateTask({
      variables: {
        id: taskID, title: newTask.title, description: newTask.description,
        priority: newTask.priority, status: newTask.status,
        dueDate: newTask.dueDate || null,
        users: newTask.assignedTo.length > 0 ? newTask.assignedTo : null,
      },
    });
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => {
          setNewTask({ title: "", description: "", priority: "medium", assignedTo: [], dueDate: "", status: "todo" });
          setOldMember([]);
          oldMemberRef.current = [];
          setIsAddTaskOpen(true);
        }}
        className="p-2 text-white rounded-lg transition-all duration-150 cursor-pointer
          bg-green-600 hover:bg-green-700
          dark:bg-[#31f64b] dark:text-black dark:hover:bg-[#28d940]
          dark:hover:shadow-[0_0_8px_rgba(49,246,75,0.35)]"
      >
        <Pencil size={18} />
      </button>

      {/* Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#222732] rounded-lg shadow-xl dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2a3040]">
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 rounded-full bg-blue-600 dark:bg-[#31f64b]" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Edit Task</h2>
              </div>
              <button
                onClick={() => setIsAddTaskOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#252d3d] rounded-lg transition-colors"
              >
                <XCircle size={24} className="text-gray-500 dark:text-slate-500 cursor-pointer" />
              </button>
            </div>

            {/* Loading */}
            {(memberLoading || loadingTask) && (
              <div className="p-6">
                <span className="loading loading-spinner loading-md dark:text-[#31f64b]"></span>
              </div>
            )}

            {/* Error */}
            {(memberError || errorTask) && (
              <div className="p-6 text-red-600">Failed to load members or task</div>
            )}

            {/* Form */}
            {!memberLoading && !loadingTask && !memberError && !errorTask && (
              <form onSubmit={handleUpdateTask} className="p-6">
                <div className="space-y-4">

                  {/* Title */}
                  <div>
                    <label className={labelCls}>Task Title *</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Enter task title"
                      required
                      className={inputCls}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className={labelCls}>Description *</label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Enter task description"
                      required
                      rows="3"
                      className={inputCls + " resize-none"}
                    />
                  </div>

                  {/* Priority + Assign To */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Priority *</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        required
                        className={inputCls + " appearance-none"}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Assign To *</label>
                      <div className="border border-gray-300 dark:border-[#2a3040] rounded-lg p-3 max-h-40 overflow-y-auto bg-white dark:bg-[#1a1f2b]">
                        {(memberData?.project?.users || []).length === 0 ? (
                          <p className="text-gray-500 dark:text-slate-500 text-sm">No team members available</p>
                        ) : (
                          (memberData?.project?.users || []).map((member) => (
                            <label
                              key={member.id}
                              className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#252d3d] rounded px-1 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={newTask.assignedTo.includes(member.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewTask((prev) => ({ ...prev, assignedTo: [...prev.assignedTo, member.id] }));
                                  } else {
                                    setNewTask((prev) => ({ ...prev, assignedTo: prev.assignedTo.filter((id) => id !== member.id) }));
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 dark:accent-[#31f64b] rounded border-gray-300 dark:border-[#2a3040] focus:ring-blue-500 dark:focus:ring-[#31f64b]/40"
                              />
                              <span className="text-sm text-gray-700 dark:text-slate-300">
                                {member.fullname} - {member.position}
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-[#2a3040]">
                  <button
                    type="button"
                    onClick={() => setIsAddTaskOpen(false)}
                    className="px-6 py-2 cursor-pointer rounded-lg text-sm font-medium transition-all duration-150
                      border border-gray-300 dark:border-[#2a3040]
                      bg-white dark:bg-[#1a1f2b]
                      text-gray-700 dark:text-slate-300
                      hover:bg-gray-100 dark:hover:bg-[#252d3d]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingTask}
                    className="px-6 py-2 cursor-pointer rounded-lg text-sm font-semibold transition-all duration-150
                      bg-blue-600 hover:bg-blue-700 text-white
                      dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
                      dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]
                      flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} />
                    {updatingTask ? "Updating..." : "Update Task"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default FormEditTask;