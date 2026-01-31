import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Target,
  Clock,
  TrendingUp,
  CheckCircle2,
  Circle,
  AlertCircle,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  User,
  XCircle,
  Save,
  Pencil,
  UserRoundPlus,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProjectDetailsPage = () => {
  // Project data
  const [project] = useState({
    id: 1,
    name: "E-Commerce Platform Redesign",
    description:
      "Complete overhaul of the company website including new UI/UX design, backend optimization, and mobile responsiveness.",
    client: "ABC Corporation",
    department: "IT",
    status: "In Progress",
    priority: "High",
    projectManager: "Sarah Johnson",
    startDate: "2024-01-15",
    dueDate: "2024-03-30",
    budget: "$125,000",
    spent: "$67,500",
    progress: 54,
    teamSize: 8,
  });

  // Tasks data
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Design Homepage Mockup",
      description: "Create initial design concepts for the new homepage",
      status: "Completed",
      priority: "High",
      assignedTo: "John Doe",
      dueDate: "2024-02-05",
      completedDate: "2024-02-04",
      progress: 100,
    },
    {
      id: 2,
      title: "Implement Product Catalog",
      description:
        "Build the product catalog with filtering and search functionality",
      status: "In Progress",
      priority: "High",
      assignedTo: "Jane Smith",
      dueDate: "2024-02-20",
      completedDate: null,
      progress: 75,
    },
    {
      id: 3,
      title: "Shopping Cart Integration",
      description: "Integrate shopping cart with payment gateway",
      status: "In Progress",
      priority: "Critical",
      assignedTo: "Mike Johnson",
      dueDate: "2024-02-25",
      completedDate: null,
      progress: 40,
    },
    {
      id: 4,
      title: "User Authentication System",
      description: "Implement secure login and registration system",
      status: "Not Started",
      priority: "Medium",
      assignedTo: "Emily Davis",
      dueDate: "2024-03-01",
      completedDate: null,
      progress: 0,
    },
    {
      id: 5,
      title: "Mobile Responsive Design",
      description: "Ensure all pages are mobile-friendly",
      status: "Not Started",
      priority: "High",
      assignedTo: "Tom Brown",
      dueDate: "2024-03-10",
      completedDate: null,
      progress: 0,
    },
    ,
    {
      id: 6,
      title: "Mobile Responsive Design",
      description: "Ensure all pages are mobile-friendly",
      status: "Not Started",
      priority: "High",
      assignedTo: "Tom Brown",
      dueDate: "2024-03-10",
      completedDate: null,
      progress: 0,
    },
    ,
    {
      id: 7,
      title: "Mobile Responsive Design",
      description: "Ensure all pages are mobile-friendly",
      status: "Not Started",
      priority: "High",
      assignedTo: "Tom Brown",
      dueDate: "2024-03-10",
      completedDate: null,
      progress: 0,
    },
  ]);

  // Team members
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

  // Dialog state for adding new task
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

  // Handle add task
  const handleAddTask = (e) => {
    e.preventDefault();
    const task = {
      id: Math.max(...tasks.map((t) => t.id)) + 1,
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

  // Handle delete task
  const handleDeleteTask = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter((task) => task.id !== id));
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      Completed: "bg-green-100 text-green-700 border-green-200",
      "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
      "Not Started": "bg-gray-100 text-gray-700 border-gray-200",
      "On Hold": "bg-yellow-100 text-yellow-700 border-yellow-200",
      Cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return colors[status] || colors["Not Started"];
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      Critical: "bg-red-100 text-red-700 border-red-200",
      High: "bg-orange-100 text-orange-700 border-orange-200",
      Medium: "bg-blue-100 text-blue-700 border-blue-200",
      Low: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[priority] || colors["Medium"];
  };

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    notStarted: tasks.filter((t) => t.status === "Not Started").length,
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Projects</span>
        </button>
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {project.name}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}
                >
                  {project.status}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}
                >
                  {project.priority} Priority
                </span>
              </div>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User size={16} />
                  PM: {project.projectManager}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  Team: {project.teamSize} members
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {project.startDate} - {project.dueDate}
                </span>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Edit2 size={18} />
              Edit Project
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <UserRoundPlus size={18} />
              Add Members
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Overall Progress
              </span>
              <span className="text-sm font-bold text-gray-900">
                {project.progress}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <Target className="text-blue-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {taskStats.total}
              </p>
              <p className="text-xs text-gray-600">Total Tasks</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="text-green-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {taskStats.completed}
              </p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="text-orange-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {taskStats.inProgress}
              </p>
              <p className="text-xs text-gray-600">In Progress</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="text-purple-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {project.spent}
              </p>
              <p className="text-xs text-gray-600">of {project.budget}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Section (2 columns) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {taskStats.total} total tasks • {taskStats.completed}{" "}
                      completed
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddTaskOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={18} />
                    Add Task
                  </button>
                </div>
              </div>
              {/*all task value*/}
              <div className="divide-y divide-gray-200 max-h-160 overflow-auto">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-6 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {task.title}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}
                          >
                            {task.status}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {task.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {task.assignedTo}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            Due: {task.dueDate}
                          </span>
                          {task.completedDate && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 size={14} />
                              Completed: {task.completedDate}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-row gap-2">
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-blue-600 hover:bg-blue-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-green-600 hover:bg-green-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-red-600 hover:bg-red-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {/*<div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Progress</span>
                        <span className="text-xs font-semibold text-gray-900">
                          {task.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            task.progress === 100
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div> */}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Members Section (1 column) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Team Members
              </h2>
              <div className="space-y-3 max-h-160 overflow-auto">
                {teamMembers.map((member) => {
                  const assignedTasks = tasks.filter(
                    (t) => t.assignedTo === member.name,
                  );
                  const completedTasks = assignedTasks.filter(
                    (t) => t.status === "Completed",
                  );

                  return (
                    <div
                      key={member.id}
                      className=" flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {member.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-600">{member.role}</p>
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
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            className="py-3 px-3 text-red-600 hover:text-white hover:bg-red-700 rounded transition-colors cursor-pointer"
                            title="Delete row"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Add Task Dialog */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add New Task</h2>
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Initial Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newTask.progress}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        progress: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
    </div>
  );
};

export default ProjectDetailsPage;