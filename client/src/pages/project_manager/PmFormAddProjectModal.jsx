import { useState, useEffect, useRef } from "react";
import { X, Plus, Loader } from "lucide-react";
import logo from "@/assets/logo.png";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-toastify";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  GET_PROJECTS_BY_PROJECTMGNT,
  GET_THE_PROJECTMGNT,
} from "./ProjectmgntDetails";

const GET_DEPARTMENTS = gql`
  query ProjectMgnt($projectMgntId: ID!) {
    projectMgnt(id: $projectMgntId) {
      departments {
        id
        name
      }
      managers {
        id
        fullname
      }
    }
  }
`;

const GET_USER_MANAGER = gql`
  query UserRoleManager {
    userRoleManager {
      id
      fullname
      position
      department {
        id
      }
    }
  }
`;

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
      project {
        id
        title
        projectManager {
          id
        }
        users {
          id
        }
      }
    }
  }
`;

const UPDATE_PROJECTMGNT_PROJECTS = gql`
  mutation Mutation($updateProjectMgntId: ID!, $addProjects: [ID!]) {
    updateProjectMgnt(id: $updateProjectMgntId, addProjects: $addProjects) {
      message
      projectMgnt {
        _id
      }
    }
  }
`;

const CREATE_NOTIF_FOR_ADMIN = gql`
  mutation CreateNotif($input: AddNotifInput!) {
    createNotif(input: $input) {
      id
      isRead
      title
    }
  }
`;

const GET_ALL_ADMIN = gql`
  query UserRoleAdmin {
    userRoleAdmin {
      id
    }
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

export default function PmFormAddProjectModal({
  onProjectAdded,
  projectMgntId,
}) {
  const { id } = useParams();
  const auth = useSelector((state) => state.auth);
  const managerId = auth.user?.id;
  const currentManagerData = auth.user;
  const location = useLocation();
  const isManagerRoute = location.pathname.includes("manager");
  const userId = auth.user?.id;

  const [selectedEmployees, setSelectedEmployees] = useState([]);
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

  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState("");

  const handleClose = () => setIsOpen(false);
  const [createNotif] = useMutation(CREATE_NOTIF_FOR_ADMIN);
  const { data: AdminData } = useQuery(GET_ALL_ADMIN);

  console.log("Current Manager Data:", currentManagerData);

  const {
    loading: loadindDepartments,
    error: errorDepartments,
    data: dataDepartments,
    refetch: refetchDepartments,
  } = useQuery(GET_DEPARTMENTS, {
    variables: { projectMgntId: id },
    notifyOnNetworkStatusChange: true,
  });

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
  }, [refetchUserManager, refetchDepartments]);

  useEffect(() => {
    if (isManagerRoute && currentManagerData) {
      setFormData((prev) => ({
        ...prev,
        department: currentManagerData.department?.id || "",
        projectManager: currentManagerData.id || "",
      }));

      setDepartmentSearch(currentManagerData.department?.name || "");
    }
  }, [isManagerRoute, currentManagerData]);

  const [updateProjectMgnt, { loading: loadingUpdateProjectMgnt }] =
    useMutation(UPDATE_PROJECTMGNT_PROJECTS, {
      onError: () => toast.error("Failed to add the project in projectMgnt"),
      refetchQueries: [
        {
          query: GET_THE_PROJECTMGNT,
          variables: { projectMgntId: projectMgntId || id },
        },
      ],
      awaitRefetchQueries: true,
    });

  const [createProject, { loading: loadingCreateProject }] = useMutation(
    CREATE_PROJECT,
    {
      onCompleted: async (data) => {
        toast.success("Project created successfully");
        const projectId = data?.createProject?.project?.id;
        if (!projectId) return;

        if (!id) throw new Error("Project Management ID is missing");

        await updateProjectMgnt({
          variables: {
            updateProjectMgntId: projectMgntId || id,
            addProjects: [projectId],
          },
        });
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
        if (onProjectAdded) {
          await onProjectAdded();
        }
        setSelectedEmployees([]);
        setDepartmentSearch("");
        setIsOpen(false);

        if (projectId && AdminData?.userRoleAdmin) {
          createNotif({
            variables: {
              input: {
                entity: { id: projectId, type: "Project" },
                isRead: false,
                message: `A new project management "${data?.createProject?.project?.title}" has been created.`,
                recipients: AdminData.userRoleAdmin.map((admin) => admin.id),
                sender: userId,
                title: "New Project Management Created",
                type: "New Project management",
              },
            },
          });
        }

        const selectedManagerId =
          formData.projectManager ||
          data.createProject?.project.projectManager?.id;

        if (selectedManagerId) {
          createNotif({
            variables: {
              input: {
                entity: { id: projectId, type: "Project" },
                isRead: false,
                message: `You have been assigned as the manager for "${data?.createProject?.project?.title}".`,
                recipients: selectedManagerId,
                sender: userId,
                title: "You've Been Assigned as Manager",
                type: "Project Assigned",
              },
            },
          });
        }

        const allEmployee = data.createProject?.project.users.map(
          (user) => user.id,
        );
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
    },
  );

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.projectManager &&
      formData.projectManager.trim() !== "" &&
      !isValidObjectId(formData.projectManager)
    ) {
      toast.error("Invalid Project Manager ID.");
      return;
    }
    const projectManager =
      formData.projectManager && formData.projectManager.trim() !== ""
        ? formData.projectManager
        : null;

    const hasDeptManagers = filteredManagersByDept.length > 0;
    if (hasDeptManagers && !projectManager) {
      toast.error("Please select a project manager for this department.");
      return;
    }

    if (isNaN(formData.budget)) {
      toast.error("Budget must be a number.");
      return;
    }

    const validDepartment = availableDepartments.find(
      (dept) =>
        dept.id === formData.department || dept.name === formData.department,
    );
    if (!validDepartment) {
      toast.error("Please choose a valid department from the list.");
      return;
    }

    const projectManagerId = hasDeptManagers
      ? projectManager
      : managerId || projectManager;

    createProject({
      variables: {
        title: formData.projectName,
        description: formData.description,
        client: formData.client,
        department: validDepartment.id,
        status: formData.status,
        priority: formData.priority,
        projectManager: projectManagerId,
        budget: parseInt(formData.budget, 10) || 0,
        users: selectedEmployees,
        startDate: formData.startDate,
        endDate: formData.endDate,
      },
    });
  };

  //all the loading
  if (loadindDepartments || loadingUserManager || loadingUpdateProjectMgnt) {
    return (
      <div className="fixed h-screen   inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader
            size={70}
            className="animate-spin text-blue-500 dark:text-[#31f64b]"
          />
        </div>
      </div>
    );
  }
  if (errorDepartments)
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]">
        <div className="text-red-600">Failed to load projects</div>
      </div>
    );
  if (errorUserManager)
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]">
        <div className="text-red-600">Failed to load User Manager</div>
      </div>
    );

  const filteredDepartments = (
    dataDepartments?.projectMgnt?.departments || []
  ).filter((dept) =>
    dept.name?.toLowerCase().includes((departmentSearch || "").toLowerCase()),
  );

  // const availableDepartments =  dataDepartments?.projectMgnt?.departments || [];

  const availableDepartments = isManagerRoute
    ? currentManagerData?.department
      ? [currentManagerData.department]  // wrap object in array
      : []
    : dataDepartments?.projectMgnt?.departments || [];

  const selectedDept = availableDepartments.find(
    (d) => d.id === formData.department || d.name === formData.department,
  );

  const managers = dataUserManager?.userRoleManager || [];

  const filteredManagersByDept = selectedDept?.id
    ? managers.filter((m) => m?.department?.id === selectedDept.id)
    : [];

  const handleInputChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  // Shared section heading class
  const sectionHeading =
    "text-sm font-semibold text-gray-700 dark:text-[#31f64b]/70 border-b border-gray-200 dark:border-[#2a3040] pb-2";
  const labelCls =
    "block text-sm font-medium text-gray-700 dark:text-slate-300";

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
                  <img
                    src={logo}
                    alt="Logo"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">
                  Add New Project
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
                        onChange={(e) =>
                          handleInputChange("projectName", e.target.value)
                        }
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
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
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
                          onChange={(e) =>
                            handleInputChange("client", e.target.value)
                          }
                          className={inputCls}
                        />
                      </div>

                      {/* Department searchable dropdown */}
                      <div className="space-y-2 relative" ref={departmentRef}>
                        <label className={labelCls}>Department</label>
                        <div className="relative">
                          <input
                            disabled={isManagerRoute}
                            type="text"
                            placeholder="Search department..."
                            value={departmentSearch}
                            onChange={(e) => {
                              setDepartmentSearch(e.target.value);
                              setShowDepartmentDropdown(true);
                              handleInputChange("department", "");
                            }}

                            onFocus={() => setShowDepartmentDropdown(true)}
                            onBlur={() => {
                              const exact = availableDepartments.find(
                                (dept) =>
                                  dept.name.toLowerCase() ===
                                  departmentSearch.trim().toLowerCase(),
                              );
                              if (exact) {
                                handleInputChange("department", exact.id);
                                setDepartmentSearch(exact.name);
                              } else if (departmentSearch) {
                                handleInputChange("department", "");
                              }
                            }}
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

                      {/* Manager */}
                      <div className="space-y-2">
                        <label className={labelCls}>
                          Manager{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        {/* No department selected */}
                        {!selectedDept?.id ? (
                          <div className="text-sm text-gray-500 dark:text-slate-400">
                            No department selected
                          </div>
                        ) : filteredManagersByDept.length === 0 ? (
                          <div className="text-sm text-gray-500 dark:text-slate-400">
                            No managers in this department
                          </div>
                        ) : (
                          /* Radio list */
                          <div className="space-y-2 max-h-48 overflow-auto border border-gray-300 dark:border-[#2a3040] rounded-lg p-2">
                            {isManagerRoute ? (
                              <label className="flex items-center gap-2 px-2 py-1">
                                <input
                                  type="radio"
                                  checked
                                 
                                  value={currentManagerData.id}
                                />
                                <span className="text-sm text-gray-800 dark:text-slate-200">
                                  {currentManagerData.fullname}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-slate-500 lowercase">
                                  ({currentManagerData.position})
                                </span>
                              </label>
                            ) : (
                              filteredManagersByDept.map((manager) => (
                                <label
                                  key={manager.id}
                                  className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-[#252d3d]"
                                >
                                  <input
                                    type="radio"
                                    name="projectManager"
                                    value={manager.id}
                                    checked={formData.projectManager === manager.id}
                                    onChange={() =>
                                      handleInputChange("projectManager", manager.id)
                                  }
                                  />
                                  <span className="text-sm text-gray-800 dark:text-slate-200">
                                    {manager.fullname}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-slate-500 lowercase">
                                    ({manager.position})
                                  </span>
                                </label>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-4 p-6">
                    <h3 className={sectionHeading}>Project Details</h3>

                    <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Priority */}
                      <div className="space-y-2">
                        <label className={labelCls}>
                          Priority <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) =>
                            handleInputChange("priority", e.target.value)
                          }
                          required
                          className={inputCls + " appearance-none"}
                        >
                          <option value="">Select priority</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      {/*timeline*/}
                      <div className="space-y-2">
                        <label className={labelCls}>
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            handleInputChange("startDate", e.target.value)
                          }
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
                          onChange={(e) =>
                            handleInputChange("endDate", e.target.value)
                          }
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
                    ${loadingCreateProject
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                  }`}
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