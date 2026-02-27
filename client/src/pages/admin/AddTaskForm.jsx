import { Plus, XCircle } from "lucide-react";
import { useState } from "react";
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
    }
  }
`;

// const GET_PROJECTS = gql`
//   query Project($projectId: ID!) {
//     project(id: $projectId) {
//       title
//       client
//       budget
//       description
//       priority
//       startDate
//       status
//       endDate
//       id
//       department {
//         id
//         name
//       }
//       projectManager {
//         id
//         fullname
//       }
//       users {
//         id
//         fullname
//         position
//       }
//     }
//   }
// `;

function AddTaskForm({refetchProjects}) {
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
    // refetchQueries: [{ query: GET_PROJECTS, variables: { projectId: id } }],
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

 

  //insert the task
  const [createTask] = useMutation(INSERT_TASK, {
    onCompleted: () => {
      toast.success("Task created successfully");
      // reset form and selection (restore defaults)
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
    },
    onError: () => {
      toast.error("Failed to create task");
    },
    // refetch task list
    // refetchQueries: [{ query: GET_TASKS, variables: { taskByProjectId: id } }],
    // awaitRefetchQueries: true,
  });

  const handleAddTask = (e) => {
    e.preventDefault();

    // Check if this is the first task (no existing tasks)
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

    // Always update status to in progress
    updateProject({
      variables: {
        updateProjectId: id,
        ...(isFirstTask && {status: "in progress"}),
        // Only include start date if this is the first task
        // ...(isFirstTask && { startDate: new Date().toISOString() }),
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
      {/* Button to open modal */}
      <button
        onClick={() => setIsAddTaskOpen(true)}
        className="flex px-4 py-2 bg-blue-600 text-white rounded-lg "
      >
        <Plus />
        Add Task
      </button>

      {/* Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Task</h2>
              <button
                onClick={() => setIsAddTaskOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={24} className="text-gray-500 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="p-6">
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
                </div>

                {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) =>
                        setNewTask({ ...newTask, dueDate: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div> 
                </div> */}
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
                  className="px-6 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
