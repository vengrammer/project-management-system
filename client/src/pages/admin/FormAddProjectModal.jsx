import { useState, useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";
import logo from "@/assets/logo.png";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const GET_DEPARTMENTS = gql`
  query Departments {
    departments {
      id name
      users { id fullname position role }
    }
  }
`;

const GET_USER_MANAGER = gql`
  query UserRoleManager {
    userRoleManager { id fullname position }
  }
`;

const CREATE_PROJECT = gql`
  mutation CreateProject(
    $title: String! $priority: String! $status: String! $department: ID!
    $description: String $client: String $budget: Int $projectManager: ID
    $users: [ID] $startDate: String $endDate: String
  ) {
    createProject(
      title: $title priority: $priority status: $status department: $department
      description: $description client: $client budget: $budget
      projectManager: $projectManager users: $users startDate: $startDate endDate: $endDate
    ) {
      message
      project {
        id title
        projectManager { id }
        users { id }
      }
    }
  }
`;

const CREATE_NOTIF_FOR_ADMIN = gql`
  mutation CreateNotif($input: AddNotifInput!) {
    createNotif(input: $input) { id isRead title }
  }
`;

const GET_ALL_ADMIN = gql`
  query UserRoleAdmin {
    userRoleAdmin { id }
  }
`;

// Shared input class
const inputCls =
  "w-full px-3 py-2 rounded-lg text-sm transition-all " +
  "border border-gray-300 dark:border-[#2a3040] " +
  "bg-white dark:bg-[#1a1f2b] " +
  "text-gray-800 dark:text-slate-200 " +
  "placeholder-gray-400 dark:placeholder-slate-600 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export default function FormAddProjectModal({ refechProjects }) {
  const location = useLocation();
  const isManager = location.pathname.includes("manager");

  const auth = useSelector((state) => state.auth);
  const managerId = auth.user?.id;
  const userId = auth.user?.id;

  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const managerRef = useRef(null);
  const departmentRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    client: "",
    department: "",
    status: "not started",
    priority: "",
    projectManager: "",
    budget: "",
    startDate: "",
    endDate: "",
  });

  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [managerSearch, setManagerSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [teamMemberSearch, setTeamMemberSearch] = useState("");

  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (managerRef.current && !managerRef.current.contains(event.target))
        setShowManagerDropdown(false);
      if (departmentRef.current && !departmentRef.current.contains(event.target))
        setShowDepartmentDropdown(false);
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const [createNotif] = useMutation(CREATE_NOTIF_FOR_ADMIN);
  const { data: AdminData } = useQuery(GET_ALL_ADMIN);

  const {
    loading: loadindDepartments,
    error: errorDepartments,
    data: dataDepartments,
    refetch: refetchDepartments,
  } = useQuery(GET_DEPARTMENTS, { notifyOnNetworkStatusChange: true });

  const {
    loading: loadingUserManager,
    error: errorUserManager,
    data: dataUserManager,
    refetch: refetchUserManager,
  } = useQuery(GET_USER_MANAGER, { notifyOnNetworkStatusChange: true });

  useEffect(() => {
    const refetching = async () => {
      await refetchUserManager();
      await refetchDepartments();
    };
    refetching();
  }, []);

  const [createProject, { loading: loadingCreateProject }] = useMutation(CREATE_PROJECT, {
    onCompleted: async (data) => {
      toast.success("Project created successfully");
      setFormData({
        projectName: "", description: "", client: "", department: "",
        status: "", priority: "", projectManager: "", budget: "", startDate: "", endDate: "",
      });
      await refechProjects();
      setSelectedEmployees([]);
      setManagerSearch("");
      setDepartmentSearch("");
      setIsOpen(false);

      const projectId = data?.createProject?.project?.id;
      if (projectId && AdminData?.userRoleAdmin) {
        createNotif({
          variables: {
            input: {
              entity: { id: projectId, type: "Project" },
              isRead: false,
              message: `A new project "${data?.createProject?.project?.title}" has been created.`,
              recipients: AdminData.userRoleAdmin.map((admin) => admin.id),
              sender: userId,
              title: "New Project Created",
              type: "New Project",
            },
          },
        });
      }

      const managerAssigned = data.createProject?.project.projectManager.id;
      if (managerAssigned) {
        createNotif({
          variables: {
            input: {
              entity: { id: projectId, type: "Project" },
              isRead: false,
              message: `You have been assigned as the project manager for "${data?.createProject?.project?.title}".`,
              recipients: managerAssigned,
              sender: userId,
              title: "You've Been Assigned to a Project as Manager",
              type: "Project Assigned",
            },
          },
        });
      }

      const allEmployee = data.createProject?.project.users.map((user) => user.id);
      if (allEmployee) {
        createNotif({
          variables: {
            input: {
              entity: { id: projectId, type: "Project" },
              isRead: false,
              message: `You have been assigned to the project "${data?.createProject?.project?.title}" as a team member.`,
              recipients: allEmployee,
              sender: userId,
              title: "You've Been Assigned to a Project as Member",
              type: "Project Assigned",
            },
          },
        });
      }
    },
    onError: () => toast.error("Failed to create project"),
  });

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.projectManager && formData.projectManager.trim() !== "" && !isValidObjectId(formData.projectManager)) {
      toast.error("Invalid Project Manager ID.");
      return;
    }
    const projectManager =
      formData.projectManager && formData.projectManager.trim() !== "" ? formData.projectManager : null;
    if (isNaN(formData.budget)) { toast.error("Budget must be a number."); return; }
    createProject({
      variables: {
        title: formData.projectName,
        description: formData.description,
        client: formData.client,
        department: formData.department,
        status: formData.status,
        priority: formData.priority,
        projectManager: isManager ? managerId : projectManager,
        budget: parseInt(formData.budget, 10) || 0,
        users: selectedEmployees,
        startDate: formData.startDate,
        endDate: formData.endDate,
      },
    });
  };

  if (loadindDepartments) return <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]"><span className="loading loading-spinner loading-xl"></span></div>;
  if (errorDepartments) return <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]"><div className="text-red-600">Failed to load projects</div></div>;
  if (loadingUserManager) return <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]"><span className="loading loading-spinner loading-xl"></span></div>;
  if (errorUserManager) return <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]"><div className="text-red-600">Failed to load User Manager</div></div>;

  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id],
    );
  };

  const filteredManagers = (dataUserManager?.userRoleManager || []).filter((manager) =>
    manager.fullname?.toLowerCase().includes((managerSearch || "").toLowerCase()),
  );

  const filteredDepartments = (dataDepartments?.departments || []).filter((dept) =>
    dept.name?.toLowerCase().includes((departmentSearch || "").toLowerCase()),
  );

  const selectedDept = (dataDepartments?.departments || []).find(
    (d) => d.id === formData.department || d.name === formData.department,
  );

  const teamUsers = selectedDept?.users?.filter((u) => u.role === "user") || [];
  const filteredTeamMembers = teamUsers.filter((emp) =>
    emp.fullname?.toLowerCase().includes((teamMemberSearch || "").toLowerCase()),
  );

  const handleInputChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  // Shared section heading class
  const sectionHeading = "text-sm font-semibold text-gray-700 dark:text-[#31f64b]/70 border-b border-gray-200 dark:border-[#2a3040] pb-2";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-slate-300";

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150
          bg-blue-600 hover:bg-blue-700 text-white
          dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
          dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]"
      >
        <Plus size={18} />
        Add New Project
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 dark:bg-black/60 p-4">

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#222732] rounded-lg shadow-xl dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* ── Modal Header ── */}
            <div className="flex flex-col items-center p-4 border-b border-gray-200 dark:border-[#2a3040]">
              <div className="w-full flex justify-end">
                <button
                  onClick={handleClose}
                  className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 dark:border-[#2a3040] overflow-hidden bg-white dark:bg-[#1a1f2b]">
                  <img src={logo} alt="Logo" className="object-cover w-full h-full" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">
                  Create Project
                </h2>
              </div>
              <p className="text-center text-sm text-gray-500 dark:text-slate-500 mt-1">
                Please fill in the information below to create a new project.
              </p>
            </div>

            {/* ── Modal Body ── */}
            <div className="flex flex-col overflow-auto">
              <div className="flex flex-col">
                <div className="overflow-auto">

                  {/* Basic Information */}
                  <div className="space-y-4 p-6">
                    <h3 className={sectionHeading}>Basic Information</h3>

                    {/* Project Name */}
                    <div className="space-y-2">
                      <label className={labelCls}>
                        Project Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter project name"
                        value={formData.projectName}
                        onChange={(e) => handleInputChange("projectName", e.target.value)}
                        required
                        className={inputCls}
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className={labelCls}>Project Description</label>
                      <textarea
                        placeholder="Enter project description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        rows={3}
                        className={inputCls + " resize-none"}
                      />
                    </div>

                    {/* Client + Department */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className={labelCls}>Client</label>
                        <input
                          type="text"
                          placeholder="Enter client name"
                          value={formData.client}
                          onChange={(e) => handleInputChange("client", e.target.value)}
                          className={inputCls}
                        />
                      </div>

                      {/* Department searchable dropdown */}
                      <div className="space-y-2 relative" ref={departmentRef}>
                        <label className={labelCls}>
                          Department <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search department..."
                            value={departmentSearch}
                            onChange={(e) => {
                              if (departmentSearch) {
                                setDepartmentSearch(e.target.value);
                                setShowDepartmentDropdown(true);
                              }
                              setDepartmentSearch(e.target.value);
                              setShowDepartmentDropdown(true);
                            }}
                            onFocus={() => setShowDepartmentDropdown(true)}
                            required
                            className={inputCls}
                          />
                          {showDepartmentDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1a1f2b] border border-gray-300 dark:border-[#2a3040] rounded-lg shadow-lg dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] max-h-48 overflow-auto">
                              {filteredDepartments.length > 0 ? (
                                filteredDepartments.map((dept) => (
                                  <div
                                    key={dept.id}
                                    onClick={() => {
                                      handleInputChange("department", dept.id);
                                      setDepartmentSearch(dept.name);
                                      setShowDepartmentDropdown(false);
                                    }}
                                    className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-[#252d3d] cursor-pointer text-sm text-gray-800 dark:text-slate-200 transition-colors"
                                  >
                                    {dept.name}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500 dark:text-slate-500">
                                  No departments found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Team Members */}
                    <div className="space-y-2">
                      <label className={labelCls}>Team Members</label>
                      <input
                        type="text"
                        placeholder="Search team members..."
                        value={teamMemberSearch}
                        onChange={(e) => setTeamMemberSearch(e.target.value)}
                        className={inputCls + " mb-2"}
                      />
                      <div className="w-full bg-gray-50 dark:bg-[#1a1f2b] max-h-48 overflow-auto rounded-lg border border-gray-300 dark:border-[#2a3040] py-3 px-4">
                        {filteredTeamMembers.length > 0 ? (
                          filteredTeamMembers.map((emp) => (
                            <label
                              key={emp.id}
                              className="flex items-center justify-between gap-3 py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-[#252d3d] cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedEmployees?.includes(emp.id)}
                                  onChange={() => toggleEmployee(emp.id)}
                                  className="w-4 h-4 accent-blue-600 dark:accent-[#31f64b] cursor-pointer"
                                />
                                <div className="text-sm">
                                  <div className="font-medium text-gray-800 dark:text-slate-200">
                                    {emp.fullname}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-slate-500">
                                    {emp.position}
                                  </div>
                                </div>
                              </div>
                            </label>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-slate-500 text-center py-2">
                            No team members found
                          </div>
                        )}
                      </div>
                      {selectedEmployees?.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-slate-500">
                          {selectedEmployees.length} member(s) selected
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-4 p-6">
                    <h3 className={sectionHeading}>Project Details</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Budget */}
                      <div className="space-y-2">
                        <label className={labelCls}>Budget</label>
                        <input
                          type="text"
                          placeholder="e.g., $50,000"
                          value={formData.budget}
                          onChange={(e) => handleInputChange("budget", e.target.value)}
                          className={inputCls}
                        />
                      </div>

                      {/* Priority */}
                      <div className="space-y-2">
                        <label className={labelCls}>
                          Priority <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => handleInputChange("priority", e.target.value)}
                          required
                          className={inputCls + " appearance-none"}
                        >
                          <option value="">Select priority</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      {/* Project Manager searchable dropdown */}
                      {!isManager && (
                        <div className="space-y-2 relative" ref={managerRef}>
                          <label className={labelCls}>Project Manager</label>
                          <div className="relative">
                            <input
                              disabled={isManager}
                              type="text"
                              placeholder="Search project manager..."
                              value={managerSearch}
                              onChange={(e) => {
                                setManagerSearch(e.target.value);
                                setShowManagerDropdown(true);
                              }}
                              onFocus={() => setShowManagerDropdown(true)}
                              className={inputCls}
                            />
                            {showManagerDropdown && (
                              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1a1f2b] border border-gray-300 dark:border-[#2a3040] rounded-lg shadow-lg dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] max-h-48 overflow-auto">
                                {filteredManagers.length > 0 ? (
                                  filteredManagers.map((manager) => (
                                    <div
                                      key={manager.id}
                                      onClick={() => {
                                        handleInputChange("projectManager", manager?.id);
                                        setManagerSearch(manager?.fullname);
                                        setShowManagerDropdown(false);
                                      }}
                                      className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-[#252d3d] cursor-pointer text-sm text-gray-800 dark:text-slate-200 transition-colors"
                                    >
                                      {manager?.fullname}{" "}
                                      <span className="text-gray-500 dark:text-slate-500 lowercase">
                                        ({manager?.position})
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-slate-500">
                                    No managers found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4 p-6">
                    <h3 className={sectionHeading}>Timeline</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className={labelCls}>
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange("startDate", e.target.value)}
                          required
                          className={inputCls}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={labelCls}>
                          End Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          min={formData.startDate}
                          disabled={!formData.startDate}
                          onChange={(e) => handleInputChange("endDate", e.target.value)}
                          required
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Modal Footer ── */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-[#2a3040] bg-gray-50 dark:bg-[#1a1f2b]">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150
                  border border-gray-300 dark:border-[#2a3040]
                  bg-white dark:bg-[#222732]
                  text-gray-700 dark:text-slate-300
                  hover:bg-gray-100 dark:hover:bg-[#252d3d]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loadingCreateProject}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-150
                  bg-blue-600 hover:bg-blue-700 text-white
                  dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
                  dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]
                  ${loadingCreateProject ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {loadingCreateProject ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
