import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  Activity,
  Target,
  ArrowUpRight,
  MoreVertical,
  Filter,
  FolderKanban,
  Download,
  Clock,
} from "lucide-react";

const DashboardContent = () => {
  const [timeRange, setTimeRange] = useState("week");

  // Dashboard data
  const stats = {
    totalProjects: 47,
    projectsChange: "+12%",
    activeProjects: 23,
    activeChange: "+8%",
    completedProjects: 18,
    completedChange: "+23%",
    teamMembers: 34,
    membersChange: "+3",
    totalBudget: "$847,000",
    budgetChange: "+15%",
    onTrack: 15,
    atRisk: 6,
    delayed: 2,
  };

  const recentProjects = [
    {
      id: 1,
      name: "E-Commerce Platform Redesign",
      status: "In Progress",
      progress: 67,
      priority: "High",
      team: 8,
      deadline: "2024-02-28",
      budget: "$125,000",
      color: "bg-violet-500",
    },
    {
      id: 2,
      name: "Mobile Banking App",
      status: "Planning",
      progress: 25,
      priority: "Critical",
      team: 12,
      deadline: "2024-03-15",
      budget: "$200,000",
      color: "bg-rose-500",
    },
    {
      id: 3,
      name: "AI Chatbot Integration",
      status: "In Progress",
      progress: 89,
      priority: "Medium",
      team: 5,
      deadline: "2024-02-10",
      budget: "$75,000",
      color: "bg-cyan-500",
    },
    {
      id: 4,
      name: "Cloud Infrastructure Migration",
      status: "At Risk",
      progress: 42,
      priority: "High",
      team: 10,
      deadline: "2024-04-01",
      budget: "$180,000",
      color: "bg-amber-500",
    },
    {
      id: 5,
      name: "Security Audit & Compliance",
      status: "Completed",
      progress: 100,
      priority: "Critical",
      team: 6,
      deadline: "2024-01-30",
      budget: "$90,000",
      color: "bg-emerald-500",
    },
  ];

  const teamActivity = [
    {
      user: "Sarah Chen",
      action: 'Completed task "API Integration"',
      time: "5 min ago",
      avatar: "SC",
      color: "bg-violet-500",
    },
    {
      user: "Marcus Rodriguez",
      action: "Updated project timeline",
      time: "12 min ago",
      avatar: "MR",
      color: "bg-blue-500",
    },
    {
      user: "Emily Thompson",
      action: "Added new milestone",
      time: "1 hour ago",
      avatar: "ET",
      color: "bg-pink-500",
    },
    {
      user: "James Wilson",
      action: "Commented on design review",
      time: "2 hours ago",
      avatar: "JW",
      color: "bg-green-500",
    },
    {
      user: "Olivia Martinez",
      action: "Uploaded documentation",
      time: "3 hours ago",
      avatar: "OM",
      color: "bg-orange-500",
    },
    {
      user: "Olivia Martinez",
      action: "Uploaded documentation",
      time: "3 hours ago",
      avatar: "OM",
      color: "bg-orange-500",
    },
    {
      user: "Olivia Martinez",
      action: "Uploaded documentation",
      time: "3 hours ago",
      avatar: "OM",
      color: "bg-orange-500",
    },
  ];

  const upcomingDeadlines = [
    {
      project: "AI Chatbot Integration",
      date: "Feb 10",
      days: 12,
      status: "on-track",
    },
    {
      project: "E-Commerce Platform Redesign",
      date: "Feb 28",
      days: 30,
      status: "on-track",
    },
    {
      project: "Mobile Banking App",
      date: "Mar 15",
      days: 45,
      status: "warning",
    },
    {
      project: "Cloud Infrastructure Migration",
      date: "Apr 01",
      days: 62,
      status: "critical",
    },
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      Critical: "bg-red-50 text-red-700 border-red-200",
      High: "bg-orange-50 text-orange-700 border-orange-200",
      Medium: "bg-blue-50 text-blue-700 border-blue-200",
      Low: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[priority] || colors["Low"];
  };

  return (
    <div className="md:p-6 bg-gray-200 min-h-screen rounded-2xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 p-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 p-2">
          Track and manage all your projects in one place
        </p>
      </div>

      {/* Top Stats Grid */}
      <div className="p-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Total Projects */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 md:p-3 rounded-lg bg-violet-50">
              <FolderKanban className="text-violet-600" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {stats.totalProjects}
          </h3>
          <p className="text-sm text-gray-600">Total Projects</p>
        </div>

        {/* Active Projects */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <Activity className="text-blue-600" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {stats.activeProjects}
          </h3>
          <p className="text-sm text-gray-600">Active Projects</p>
        </div>

        {/* Completed */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {stats.completedProjects}
          </h3>
          <p className="text-sm text-gray-600">Completed</p>
        </div>

        {/* Team Members */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-cyan-50">
              <Users className="text-cyan-600" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {stats.teamMembers}
          </h3>
          <p className="text-sm text-gray-600">Team Members</p>
        </div>

        {/* Budget */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-amber-50">
              <DollarSign className="text-amber-600" size={24} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {stats.totalBudget}
          </h3>
          <p className="text-sm text-gray-600">Total Budget</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Active Projects
                </h2>
                <p className="text-sm text-gray-600">
                  Track project progress and status
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <Filter size={16} />
                  Filter
                </button>
                <button className="px-4 py-2 bg-violet-600 rounded-lg text-sm text-white hover:bg-violet-700 transition-colors flex items-center gap-2">
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
          </div>
          {/*recent project */}
          <div className="p-2 md:p-6 space-y-4 max-h-150 overflow-y-auto">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white border border-gray-200 rounded-lg p-5 hover:border-violet-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {project.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}
                      >
                        {project.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {project.team} members
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Due {project.deadline}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign size={14} />
                        {project.budget}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical size={18} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900 font-semibold">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 ${project.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Team Activity */}
          <div className="bg-white border border-gray-200 p-3 md:p-6 ">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4 max-h-70 overflow-auto">
              {teamActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 p-3 rounded-full ${activity.color} flex items-center justify-center text-white text-xs font-semibold flex-0`}
                  >
                    {activity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">
                      {activity.user}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Takes 1 column */}
        <div className="space-y-6">
          {/* Project Status Overview */}
          <div className="bg-white border border-gray-200 rounded-lg p-2 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Project Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Target className="text-green-600" size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">On Track</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.onTrack}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <AlertCircle className="text-orange-600" size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">At Risk</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.atRisk}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="text-red-600" size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delayed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.delayed}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white border border-gray-200 rounded-lg p-2 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Upcoming Deadlines
            </h2>
            <div className="space-y-3">
              {upcomingDeadlines.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {item.project}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar size={12} />
                      <span>{item.date}</span>
                      <span>•</span>
                      <Clock size={12} />
                      <span>{item.days} days</span>
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.status === "on-track"
                        ? "bg-green-500"
                        : item.status === "warning"
                          ? "bg-orange-500"
                          : "bg-red-500"
                    }`}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardContent;