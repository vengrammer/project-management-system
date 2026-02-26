import { Pencil, Plus, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const GET_MEMBERS = gql`
  query Project($projectId: ID!) {
    project(id: $projectId) {
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
      users {
        id
        fullname
      }
      priority
      status
      #dueDate
    }
  }
`;
//get old task
const GET_TASK = gql`
  query Query($taskId: ID!) {
    task(id: $taskId) {
      id
      title
      description
      users {
        id
        fullname
      }
      priority
      status
      #dueDate
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: ID!
    $title: String
    $description: String
    $priority: String
    $status: String
    #$dueDate: String
    $users: [ID]
  ) {
    updateTask(
      id: $id
      title: $title
      description: $description
      priority: $priority
      status: $status
      #dueDate: $dueDate
      users: $users
    ) {
      id
      title
    }
  }
`;

const toInputDate = (val) => {
  if (!val) return "";
  const n = Number(val);
  const d = Number.isNaN(n) ? new Date(val) : new Date(n);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

function FormEditTask({ taskID }) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: [],
    //dueDate: "",
    status: "todo",
  });

  const { id } = useParams();
  //get the member
  const {
    loading: memberLoading,
    error: memberError,
    data: memberData,
  } = useQuery(GET_MEMBERS, {
    variables: { projectId: id },
    // Don't fetch members for every row; only when modal is open
    skip: !isAddTaskOpen,
    onError: () => toast.error("Failed to load members"),
  });

  //const get the old task
  const {
    loading: loadingTask,
    error: errorTask,
    data: taskData,
  } = useQuery(GET_TASK, {
    variables: { taskId: taskID },
    // Don't fetch task for every row; only when modal is open
    skip: !isAddTaskOpen || !taskID,
    // If the task is already in Apollo cache, `onCompleted` may not run.
    // Use `data` + effect below to ensure the form always gets hydrated.
    fetchPolicy: "cache-and-network",
    onError: () => toast.error("Failed to load task"),
  });

  useEffect(() => {
    if (!isAddTaskOpen) return;
    const t = taskData?.task;
    if (!t) return;
    setNewTask({
      title: t.title ?? "",
      description: t.description ?? "",
      priority: t.priority ?? "medium",
      assignedTo: t.users?.map((u) => u.id) ?? [],
      dueDate: toInputDate(t.dueDate),
      status: t.status ?? "todo",
    });
  }, [isAddTaskOpen, taskData]);

  const [updateTask, { loading: updatingTask }] = useMutation(UPDATE_TASK, {
    onCompleted: () => {
      toast.success("Task updated successfully");
      setIsAddTaskOpen(false);
    },
    onError: () => {
      toast.error("Failed to update task");
    },
    refetchQueries: [{ query: GET_TASKS, variables: { taskByProjectId: id } }],
    awaitRefetchQueries: true,
  });

  const handleUpdateTask = (e) => {
    e.preventDefault();
    updateTask({
      variables: {
        id: taskID,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: newTask.status,
        dueDate: newTask.dueDate || null,
        users: newTask.assignedTo.length > 0 ? newTask.assignedTo : null,
      },
    });
  };

  return (
    <>
      {/* Button to open modal */}
      <button
        onClick={() => {
          // reset while loading so you don't see previous task values
          setNewTask({
            title: "",
            description: "",
            priority: "medium",
            assignedTo: [],
            dueDate: "",
            status: "todo",
          });
          setIsAddTaskOpen(true);
        }}
        className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors cursor-pointer"
      >
        <Pencil size={18} />
      </button>

      {/* Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Task</h2>
              <button
                onClick={() => setIsAddTaskOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={24} className="text-gray-500 cursor-pointer" />
              </button>
            </div>

            {(memberLoading || loadingTask) && (
              <div className="p-6">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            )}

            {(memberError || errorTask) && (
              <div className="p-6 text-red-600">
                Failed to load members or task
              </div>
            )}

            {!memberLoading && !loadingTask && !memberError && !errorTask && (
              <form onSubmit={handleUpdateTask} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      placeholder="Enter task title"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                      placeholder="Enter task description"
                      required
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Priority *
                      </label>
                      <select
                        value={newTask.priority}
                        onChange={(e) =>
                          setNewTask({ ...newTask, priority: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    {/* <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status *
                      </label>
                      <select
                        value={newTask.status}
                        onChange={(e) =>
                          setNewTask({ ...newTask, status: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div> */}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Assign To *
                      </label>
                      <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                        {(memberData?.project?.users || []).length === 0 ? (
                          <p className="text-gray-500 text-sm">
                            No team members available
                          </p>
                        ) : (
                          (memberData?.project?.users || []).map((member) => (
                            <label
                              key={member.id}
                              className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 rounded px-1"
                            >
                              <input
                                type="checkbox"
                                checked={newTask.assignedTo.includes(member.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewTask({
                                      ...newTask,
                                      assignedTo: [
                                        ...newTask.assignedTo,
                                        member.id,
                                      ],
                                    });
                                  } else {
                                    setNewTask({
                                      ...newTask,
                                      assignedTo: newTask.assignedTo.filter(
                                        (id) => id !== member.id,
                                      ),
                                    });
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">
                                {member.fullname} - {member.position}
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) =>
                          setNewTask({ ...newTask, dueDate: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div> */}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsAddTaskOpen(false)}
                    className="px-6 py-2 cursor-pointer border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingTask}
                    className="px-6 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={20} />
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
