import { Plus, XCircle } from "lucide-react";
import { useState } from "react";

function AddTaskForm() {
  const [tasks, setTasks] = useState([]); // define tasks state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    assignedTo: "",
    dueDate: "",
    status: "Not Started",
    progress: 0,
  });

  const [teamMembers] = useState([
    { id: 1, name: "John Doe", role: "UI/UX Designer", avatar: "JD" },
    { id: 2, name: "Jane Smith", role: "Frontend Developer", avatar: "JS" },
    { id: 3, name: "Mike Johnson", role: "Backend Developer", avatar: "MJ" },
    { id: 4, name: "Emily Davis", role: "Full Stack Developer", avatar: "ED" },
    { id: 5, name: "Tom Brown", role: "QA Engineer", avatar: "TB" },
    { id: 6, name: "Lisa Anderson", role: "DevOps Engineer", avatar: "LA" },
    { id: 7, name: "David Lee", role: "Product Manager", avatar: "DL" },
    { id: 8, name: "Sarah Wilson", role: "Business Analyst", avatar: "SW" },
    { id: 9, name: "Emily Davis", role: "Full Stack Developer", avatar: "ED" },
    { id: 10, name: "Tom Brown", role: "QA Engineer", avatar: "TB" },
    { id: 11, name: "Lisa Anderson", role: "DevOps Engineer", avatar: "LA" },
    { id: 12, name: "David Lee", role: "Product Manager", avatar: "DL" },
    { id: 13, name: "Sarah Wilson", role: "Business Analyst", avatar: "SW" },
  ]);

  const handleAddTask = (e) => {
    e.preventDefault();
    const task = {
      id: tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
      ...newTask,
      completedDate: null,
    };
    setTasks([...tasks, task]);
    setIsAddTaskOpen(false);
    setNewTask({
      title: "",
      description: "",
      priority: "Medium",
      assignedTo: "",
      dueDate: "",
      status: "Not Started",
      progress: 0,
    });
  };

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
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
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
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assign To *
                    </label>
                    <select
                      value={newTask.assignedTo}
                      onChange={(e) =>
                        setNewTask({ ...newTask, assignedTo: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select team member</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.name}>
                          {member.name} - {member.role}
                        </option>
                      ))}
                    </select>
                  </div>

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
