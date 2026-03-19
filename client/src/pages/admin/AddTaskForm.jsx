import { Plus, XCircle } from "lucide-react";
import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

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

const UPDATE_PROJECT_STATUS_AND_STARTDATE = gql`
  mutation updateProject(
    $updateProjectId: ID!
    $status: String
  ) {
    updateProject(
      id: $updateProjectId
      status: $status
    ) {
      message
    }
  }
`;

const INSERT_TASK = gql`
  mutation createTask(
    $title: String!
    $project: ID!
    $description: String
    $priority: String
    $status: String
    # $dueDate: String
    $users: [ID]
  ) {
    createTask(
      title: $title
      project: $project
      description: $description
      priority: $priority
      status: $status
      #dueDate: $dueDate
      users: $users
    ) {
      id
      title
      users {
        id
      }
      project {
        id
      }
    }
  }
`;

const CREATE_NOTIF = gql`
  mutation CreateNotif($input: AddNotifInput!) {
    createNotif(input: $input) {
      id
      isRead
      title
    }
  }
`;

// Shared input / select class — mirrors FormAddUser
const inputCls =
  "w-full px-3 py-2 rounded-md text-sm transition-all " +
  "border border-gray-300 dark:border-[#2a3040] " +
  "bg-white dark:bg-[#1a1f2b] " +
  "text-gray-800 dark:text-slate-200 " +
  "placeholder-gray-400 dark:placeholder-slate-600 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40";

const labelCls = "block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2";

function AddTaskForm({ refetchProjects }) {
  const auth = useSelector((state) => state.auth);
  const userId = auth.user?.id;

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: [],
    status: "todo",
  });

  const { id } = useParams();

  //update the project status to in progress when the user add task
  const [updateProject] = useMutation(UPDATE_PROJECT_STATUS_AND_STARTDATE, {
    onError: () => {
      toast.error("Failed to update the project");
    },
  });

  //get the tasks to check if this is the first task
  const { loading: tasksLoading, data: tasksData } = useQuery(GET_TASKS, {
    variables: { taskByProjectId: id },
  });

  //get the member
  const {
    loading: memberLoading,
    error: memberError,
    data: memberData,
  } = useQuery(GET_MEMBERS, { variables: { projectId: id } });

  const [createNotif] = useMutation(CREATE_NOTIF);

  //insert the task
  const [createTask] = useMutation(INSERT_TASK, {
    onCompleted: (data) => {
      toast.success("Task created successfully");
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        assignedTo: [],
        dueDate: "",
        status: "todo",
      });

      refetchProjects();
      setIsAddTaskOpen(false);

      if (data.createTask.users.length > 0) {
        createNotif({
          variables: {
            input: {
              entity: {
                id: data.createTask.project.id,
                type: "Task",
              },
              isRead: false,
              message: `You have been assigned to the task "${data?.createTask?.title}"`,
              recipients: data.createTask.users.map((user) => user.id),
              sender: userId,
              title: "New Task Assigned",
              type: "Task Assignment",
            },
          },
        });
      }
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });

  const handleAddTask = (e) => {
    e.preventDefault();

    const existingTasks = tasksData?.taskByProject || [];
    const isFirstTask = existingTasks.length === 0;

    createTask({
      variables: {
        title: newTask.title,
        description: newTask.description,
        project: id,
        priority: newTask.priority,
        status: newTask.status,
        dueDate: newTask.dueDate || null,
        users: newTask.assignedTo.length > 0 ? newTask.assignedTo : null,
      },
    });

    updateProject({
      variables: {
        updateProjectId: id,
        ...(isFirstTask && { status: "in progress" }),
      },
    });
  };

  if (tasksLoading || memberLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }
  if (memberError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Failed to load members</div>
      </div>
    );
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsAddTaskOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-150
          bg-blue-600 hover:bg-blue-700 text-white
          dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
          dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]"
      >
        <Plus size={16} />
        Add Task
      </button>

      {/* Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#222732] rounded-xl shadow-xl dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2a3040]">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Add Task</h2>
              <button
                onClick={() => setIsAddTaskOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#252d3d] rounded-lg transition-colors"
              >
                <XCircle size={24} className="text-gray-500 dark:text-slate-400 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="p-6">
              <div className="space-y-4">

                {/* Task Title */}
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
                    <div className="border border-gray-300 dark:border-[#2a3040] rounded-md p-3 max-h-40 overflow-y-auto bg-white dark:bg-[#1a1f2b]">
                      {(memberData?.project?.users || []).length === 0 ? (
                        <p className="text-gray-500 dark:text-slate-500 text-sm">
                          No team members available
                        </p>
                      ) : (
                        (memberData?.project?.users || []).map((member) => (
                          <label
                            key={member.id}
                            className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#252d3d] rounded px-1"
                          >
                            <input
                              type="checkbox"
                              checked={newTask.assignedTo.includes(member.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewTask({
                                    ...newTask,
                                    assignedTo: [...newTask.assignedTo, member.id],
                                  });
                                } else {
                                  setNewTask({
                                    ...newTask,
                                    assignedTo: newTask.assignedTo.filter((id) => id !== member.id),
                                  });
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

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-[#2a3040]">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-6 py-2 cursor-pointer border border-gray-300 dark:border-[#2a3040] rounded-lg
                    text-gray-700 dark:text-slate-300
                    hover:bg-gray-100 dark:hover:bg-[#252d3d]
                    transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 cursor-pointer rounded-lg text-sm font-semibold transition-all duration-150
                    bg-blue-600 hover:bg-blue-700 text-white
                    dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
                    dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]"
                >
                  <Plus size={20} />
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AddTaskForm;
