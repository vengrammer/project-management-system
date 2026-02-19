import { useState, useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";
import logo from "@/assets/logo.png";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-toastify";

//to refresh the table of projects
const GET_PROJECTS = gql`
  query Projects {
    projects {
      id
      title
      description
      priority
      status
      department {
        name
      }
      budget
      startDate
      endDate
    }
  }
`;

//query to get the departments
const GET_DEPARTMENTS = gql`
  query Departments {
    departments {
      id
      name
      users {
        id
        fullname
        position
      }
    }
  }
`;
//query to get the user manager
const GET_USER_MANAGER = gql`
  query UserRoleManager {
    userRoleManager {
      id
      fullname
      position
    }
  }
`;
//query to CREATE the project
const CREATE_PROJECT = gql`
  mutation CreateProject(
    $title: String!
    $priority: String!
    $status: String!
    $department: ID!
    $description: String
    $client: String
    $budget: Int
    $projectManager: ID
    $users: [ID]
    $startDate: String
    $endDate: String
  ) {
    createProject(
      title: $title
      priority: $priority
      status: $status
      department: $department
      description: $description
      client: $client
      budget: $budget
      projectManager: $projectManager
      users: $users
      startDate: $startDate
      endDate: $endDate
    ) {
      message
    }
  }
`;

//query to DELETE the project
const DELETE_PROJECT = gql`
  mutation DeleteProject($projectId: ID!) {
    deleteProject(projectId: $projectId) {
      message
      project {
        id
        title
      }
    }
  }
`;

export default function FormAddProjectModal() {
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

  // Dropdown states
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

  // Search states
  const [managerSearch, setManagerSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [teamMemberSearch, setTeamMemberSearch] = useState("");

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (managerRef.current && !managerRef.current.contains(event.target)) {
        setShowManagerDropdown(false);
      }
      if (
        departmentRef.current &&
        !departmentRef.current.contains(event.target)
      ) {
        setShowDepartmentDropdown(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  //HERE IS THE ALL QUERRY------------#######################################

  //GET THE DEPARTMENT AND THERE USERS
  const {
    loading: loadindDepartments,
    error: errorDepartments,
    data: dataDepartments,
  } = useQuery(GET_DEPARTMENTS);

  //GET THE USER WITH A ROLE OF MANAGER
  const {
    loading: loadingUserManager,
    error: errorUserManager,
    data: dataUserManager,
  } = useQuery(GET_USER_MANAGER);

  // CREATE PROJECT
  const [createProject, { loading: loadingCreateProject }] = useMutation(
    CREATE_PROJECT,
    {
      onCompleted: () => {
        toast.success("Project created successfully");
        // reset form and selection
        setFormData({
          projectName: "",
          description: "",
          client: "",
          department: "",
          status: "",
          priority: "",
          projectManager: "",
          budget: "",
          startDate: "",
          endDate: "",
        });
        setSelectedEmployees([]);
        setManagerSearch("");
        setDepartmentSearch("");
        setIsOpen(false);
      },
      onError: () => {
        toast.error("Failed to create project");
      },
      // refresh project list (server query name)
      refetchQueries: [{ query: GET_PROJECTS }],
      awaitRefetchQueries: true,
    },
  );

  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ If projectManager is provided, validate it
    if (
      formData.projectManager &&
      formData.projectManager.trim() !== "" &&
      !isValidObjectId(formData.projectManager)
    ) {
      toast.error("Invalid Project Manager ID.");
      return;
    }

    // ✅ If projectManager is empty string, set it to null
    const projectManager =
      formData.projectManager && formData.projectManager.trim() !== ""
        ? formData.projectManager
        : null;

    if (isNaN(formData.budget)) {
      toast.error("Budget must be a number.");
      return;
    }

    // ensure numeric budget and send correct values
    createProject({
      variables: {
        title: formData.projectName,
        description: formData.description,
        client: formData.client,
        department: formData.department,
        status: formData.status,
        priority: formData.priority,
        projectManager: projectManager,
        budget: parseInt(formData.budget, 10) || 0,
        users: selectedEmployees,
        startDate: formData.startDate,
        endDate: formData.endDate,
      },
    });
  };

  //show the error and loading when getting the department
  if (loadindDepartments) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }
  if (errorDepartments) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Failed to load projects</div>
      </div>
    );
  }

  //show the error and loading when getting the user manager
  if (loadingUserManager) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }
  if (errorUserManager) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Failed to load User Manager</div>
      </div>
    );
  }

  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id],
    );
  };

  const filteredManagers = (dataUserManager?.userRoleManager || []).filter(
    (manager) =>
      manager.fullname
        ?.toLowerCase()
        .includes((managerSearch || "").toLowerCase()),
  );

  const filteredDepartments = (dataDepartments?.departments || []).filter(
    (dept) =>
      dept.name?.toLowerCase().includes((departmentSearch || "").toLowerCase()),
  );

  // build team-member list from the selected department
  const selectedDept = (dataDepartments?.departments || []).find(
    (d) => d.id === formData.department || d.name === formData.department,
  );
  const teamUsers = selectedDept?.users || [];
  const filteredTeamMembers = teamUsers.filter((emp) =>
    emp.fullname
      ?.toLowerCase()
      .includes((teamMemberSearch || "").toLowerCase()),
  );

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus size={20} />
        Add New Project
      </button>

      {/* Modal Backdrop & Content */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          onClick={handleBackdropClick}
        >
          {/* Modal Container */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex flex-col items-center p-4 border-b border-gray-200">
              {/* Top row: Close button */}
              <div className="w-full flex justify-end">
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Logo + Title row */}
              <div className="flex items-center gap-3 mt-2">
                <div className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 overflow-hidden">
                  <img
                    src={logo}
                    alt="Logo"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Create Project
                </h2>
              </div>

              {/* Subtitle */}
              <p className="text-center text-sm text-gray-500 mt-1">
                Please fill in the information below to create a new project.
              </p>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col overflow-auto">
              <div className="flex flex-col ">
                <div className=" overflow-auto ">
                  <div className="space-y-4 p-6">
                    <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                      Basic Information
                    </h3>

                    {/* Project Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Project Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter project name"
                        value={formData.projectName}
                        onChange={(e) =>
                          handleInputChange("projectName", e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Project Description{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        placeholder="Enter project description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows={3}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    {/* Client, Status, Department */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Client <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter client name"
                          value={formData.client}
                          onChange={(e) =>
                            handleInputChange("client", e.target.value)
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2 relative" ref={departmentRef}>
                        <label className="block text-sm font-medium text-gray-700">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {showDepartmentDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
                              {filteredDepartments.length > 0 ? (
                                filteredDepartments.map((dept) => (
                                  <div
                                    key={dept.id}
                                    onClick={() => {
                                      // store department id for form submission, but keep name visible in the input
                                      handleInputChange("department", dept.id);
                                      setDepartmentSearch(dept.name);
                                      setShowDepartmentDropdown(false);
                                    }}
                                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                  >
                                    {dept.name}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500">
                                  No departments found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Team Members Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Team Members <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Search team members..."
                        value={teamMemberSearch}
                        onChange={(e) => setTeamMemberSearch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      />
                      <div className="w-full bg-gray-50 max-h-48 overflow-auto rounded-lg border border-gray-300 py-3 px-4">
                        {filteredTeamMembers.length > 0 ? (
                          filteredTeamMembers.map((emp) => (
                            <label
                              key={emp.id}
                              className="flex items-center justify-between gap-3 py-2 px-2 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedEmployees?.includes(emp.id)}
                                  onChange={() => toggleEmployee(emp.id)}
                                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                                />
                                <div className="text-sm">
                                  <div className="font-medium text-gray-800">
                                    {emp.fullname}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {emp.position}
                                  </div>
                                </div>
                              </div>
                            </label>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 text-center py-2">
                            No team members found
                          </div>
                        )}
                      </div>
                      {selectedEmployees?.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {selectedEmployees.length} member(s) selected
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Project Details Section */}
                  <div className="space-y-4 p-6">
                    <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                      Project Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Budget <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., $50,000"
                          value={formData.budget}
                          onChange={(e) =>
                            handleInputChange("budget", e.target.value)
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Priority <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) =>
                            handleInputChange("priority", e.target.value)
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Select priority</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      {/* project manager dropdown */}
                      <div className="space-y-2 relative" ref={managerRef}>
                        <label className="block text-sm font-medium text-gray-700">
                          Project Manager{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search project manager..."
                            value={managerSearch}
                            onChange={(e) => {
                              setManagerSearch(e.target.value);
                              setShowManagerDropdown(true);
                            }}
                            onFocus={() => setShowManagerDropdown(true)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {showManagerDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
                              {filteredManagers.length > 0 ? (
                                filteredManagers.map((manager) => (
                                  <div
                                    key={manager.id}
                                    onClick={() => {
                                      handleInputChange(
                                        "projectManager",
                                        manager?.id,
                                      );
                                      setManagerSearch(manager?.fullname);
                                      setShowManagerDropdown(false);
                                    }}
                                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                  >
                                    {manager?.fullname}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500">
                                  No managers found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Timeline Section */}
                  <div className="space-y-4 p-6">
                    <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                      Timeline
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            handleInputChange("startDate", e.target.value)
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          End Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) =>
                            handleInputChange("endDate", e.target.value)
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loadingCreateProject}
                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${
                  loadingCreateProject ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loadingCreateProject ? "Creating..." : "Create Project"}
              </button>
            </div>

            {/* Modal Footer */}
          </form>
        </div>
      )}
    </>
  );
}