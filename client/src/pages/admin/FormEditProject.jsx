import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { X, Pen } from "lucide-react";
import logo from "@/assets/logo.png";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-toastify";
import { useLocation, useParams } from "react-router-dom";

const GET_PROJECT = gql`
  query Project($projectId: ID!) {
    project(id: $projectId) {
      title client budget description priority startDate endDate id
      department { id name }
      projectManager { id fullname }
      users { id fullname position }
    }
  }
`;

const GET_DEPARTMENTS = gql`
  query Departments {
    departments { id name }
  }
`;

const GET_USER_MANAGER = gql`
  query UserRoleManager {
    userRoleManager { id fullname position }
  }
`;

const UPDATE_PROJECT = gql`
  mutation UpdateProject(
    $id: ID! $title: String $priority: String $department: ID
    $description: String $client: String $budget: Int $projectManager: ID
    $startDate: String $endDate: String
  ) {
    updateProject(
      id: $id title: $title priority: $priority department: $department
      description: $description client: $client budget: $budget
      projectManager: $projectManager startDate: $startDate endDate: $endDate
    ) {
      message
      project {
        id title description client priority budget startDate endDate
        department { id name }
        projectManager { id fullname }
      }
    }
  }
`;

const CREATE_NOTIF = gql`
  mutation CreateNotif($input: AddNotifInput!) {
    createNotif(input: $input) { id isRead title }
  }
`;

// Shared styles
const inputCls =
  "w-full px-3 py-2 rounded-lg text-sm transition-all " +
  "border border-gray-300 dark:border-[#2a3040] " +
  "bg-white dark:bg-[#1a1f2b] " +
  "text-gray-800 dark:text-slate-200 " +
  "placeholder-gray-400 dark:placeholder-slate-600 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const labelCls = "block text-sm font-medium text-gray-700 dark:text-slate-300";
const sectionHeading = "text-sm font-semibold text-gray-700 dark:text-[#31f64b]/70 border-b border-gray-200 dark:border-[#2a3040] pb-2";

export default function FormEditProject() {
  const auth = useSelector((state) => state.auth);
  const userId = auth.user?.id;
  const location = useLocation();
  const isManager = location.pathname.includes("manager");
  const { id } = useParams();

  const managerRef = useRef(null);
  const departmentRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "", description: "", client: "", department: "",
    priority: "", projectManager: "", budget: "", startDate: "", endDate: "",
  });

  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [originalManagerId, setOriginalManagerId] = useState("");
  const [managerSearch, setManagerSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");

  const resetForm = () => {
    setFormData({ projectName: "", description: "", client: "", department: "", priority: "", projectManager: "", budget: "", startDate: "", endDate: "" });
    setManagerSearch(""); setDepartmentSearch("");
    setShowManagerDropdown(false); setShowDepartmentDropdown(false);
  };

  const handleClose = () => { setIsOpen(false); resetForm(); };
  const handleBackdropClick = (e) => { if (e.target === e.currentTarget) handleClose(); };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (managerRef.current && !managerRef.current.contains(event.target)) setShowManagerDropdown(false);
      if (departmentRef.current && !departmentRef.current.contains(event.target)) setShowDepartmentDropdown(false);
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const { loading: loadindDepartments, error: errorDepartments, data: dataDepartments } = useQuery(GET_DEPARTMENTS);
  const { loading: loadingUserManager, error: errorUserManager, data: dataUserManager } = useQuery(GET_USER_MANAGER);
  const [createNotif] = useMutation(CREATE_NOTIF);

  const [updateProject, { loading: loadingUpdateProject }] = useMutation(UPDATE_PROJECT, {
    onCompleted: (data) => {
      toast.success("Project updated successfully");
      setIsOpen(false);
      const newManagerId = data?.updateProject?.project?.projectManager?.id;
      const projectTitle = data?.updateProject?.project?.title;
      if (originalManagerId && newManagerId && originalManagerId !== newManagerId) {
        createNotif({ variables: { input: { entity: { id, type: "Project" }, isRead: false, message: `You have been assigned as the project manager for "${projectTitle}".`, recipients: [newManagerId], sender: userId, title: "Assigned as Project Manager", type: "info" } } });
        createNotif({ variables: { input: { entity: { id, type: "Project" }, isRead: false, message: `You have been removed as the project manager for "${projectTitle}".`, recipients: [originalManagerId], sender: userId, title: "Removed as Project Manager", type: "info" } } });
      }
    },
    onError: () => toast.error("Failed to update project"),
    refetchQueries: [{ query: GET_PROJECT, variables: { projectId: id } }],
    awaitRefetchQueries: true,
  });

  const { loading: loadingProject, data: dataProject, errorProject } = useQuery(GET_PROJECT, { variables: { projectId: id } });

  const toDateInputValue = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  const prefillFromProject = (p) => {
    setFormData({
      projectName: p?.title ?? "", description: p?.description ?? "", client: p?.client ?? "",
      department: p?.department?.id ?? "", priority: p?.priority ?? "", projectManager: p?.projectManager?.id ?? "",
      budget: p?.budget === 0 ? "0" : p?.budget !== undefined ? String(p?.budget) : "",
      startDate: toDateInputValue(p?.startDate), endDate: toDateInputValue(p?.endDate),
    });
    setDepartmentSearch(p?.department?.name ?? "");
    setManagerSearch(p?.projectManager?.fullname ?? "");
  };

  const handleOpen = () => {
    const p = dataProject?.project;
    if (p) { prefillFromProject(p); setOriginalManagerId(p?.projectManager?.id ?? ""); }
    setIsOpen(true);
  };

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.projectManager && formData.projectManager.trim() !== "" && !isValidObjectId(formData.projectManager)) {
      toast.error("Invalid Project Manager ID."); return;
    }
    const projectManager = formData.projectManager && formData.projectManager.trim() !== "" ? formData.projectManager : null;
    if (formData.budget !== "" && Number.isNaN(Number(formData.budget))) { toast.error("Budget must be a number."); return; }
    updateProject({
      variables: {
        id, title: formData.projectName, description: formData.description, client: formData.client,
        department: formData.department === "" ? null : formData.department,
        priority: formData.priority === "" ? null : formData.priority,
        projectManager,
        budget: formData.budget === "" ? null : parseInt(formData.budget, 10) || 0,
        startDate: formData.startDate === "" ? null : formData.startDate,
        endDate: formData.endDate === "" ? null : formData.endDate,
      },
    });
  };

  if (loadindDepartments) return <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]"><span className="loading loading-spinner loading-xl"></span></div>;
  if (errorDepartments) return <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]"><div className="text-red-600">Failed to load projects</div></div>;
  if (loadingUserManager) return <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]"><span className="loading loading-spinner loading-xl"></span></div>;
  if (errorUserManager) return <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]"><div className="text-red-600">Failed to load User Manager</div></div>;
  if (loadingProject) return <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]"><span className="loading loading-spinner loading-xl"></span></div>;
  if (errorProject) return <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]"><div className="text-red-600">Failed to load project</div></div>;

  const filteredManagers = (dataUserManager?.userRoleManager || []).filter((manager) =>
    manager.fullname?.toLowerCase().includes((managerSearch || "").toLowerCase()),
  );
  const filteredDepartments = (dataDepartments?.departments || []).filter((dept) =>
    dept.name?.toLowerCase().includes((departmentSearch || "").toLowerCase()),
  );
  const handleInputChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        disabled={loadingProject}
        className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-semibold transition-all duration-150
          bg-blue-600 hover:bg-blue-700 text-white
          dark:bg-blue-600/90 dark:hover:bg-blue-500
          dark:hover:shadow-[0_0_8px_rgba(59,130,246,0.4)]
          disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Pen size={18} />
        Edit Project
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4"
          onClick={handleBackdropClick}
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#222732] rounded-lg shadow-xl dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* ── Header ── */}
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
                <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Edit Project</h2>
              </div>
              <p className="text-center text-sm text-gray-500 dark:text-slate-500 mt-1">
                Please change in the information below to update a project.
              </p>
            </div>

            {/* ── Body ── */}
            <div className="flex flex-col overflow-auto">
              <div className="flex flex-col">
                <div className="overflow-auto">

                  {/* Basic Information */}
                  <div className="space-y-4 p-6">
                    <h3 className={sectionHeading}>Basic Information</h3>

                    <div className="space-y-2">
                      <label className={labelCls}>Project Name <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="Enter project name" value={formData.projectName}
                        onChange={(e) => handleInputChange("projectName", e.target.value)} required className={inputCls} />
                    </div>

                    <div className="space-y-2">
                      <label className={labelCls}>Project Description</label>
                      <textarea placeholder="Enter project description" value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        rows={3} className={inputCls + " resize-none"} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className={labelCls}>Client</label>
                        <input type="text" placeholder="Enter client name" value={formData.client}
                          onChange={(e) => handleInputChange("client", e.target.value)} className={inputCls} />
                      </div>

                      {/* Department searchable dropdown */}
                      <div className="space-y-2 relative" ref={departmentRef}>
                        <label className={labelCls}>Department  (Not Editable)</label>
                        <div className="relative">
                         
                          <input  disabled={true} type="text" placeholder="Search department..." value={departmentSearch}
                            onChange={(e) => { setDepartmentSearch(e.target.value); setShowDepartmentDropdown(true); handleInputChange("department", ""); }}
                            onFocus={() => setShowDepartmentDropdown(true)} required className={inputCls} />
                          {showDepartmentDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1a1f2b] border border-gray-300 dark:border-[#2a3040] rounded-lg shadow-lg dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] max-h-48 overflow-auto">
                              {filteredDepartments.length > 0 ? (
                                filteredDepartments.map((dept) => (
                                  <div key={dept.id}
                                    onClick={() => { handleInputChange("department", dept.id); setDepartmentSearch(dept.name); setShowDepartmentDropdown(false); }}
                                    className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-[#252d3d] cursor-pointer text-sm text-gray-800 dark:text-slate-200 transition-colors">
                                    {dept.name}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500 dark:text-slate-500">No departments found</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-4 p-6">
                    <h3 className={sectionHeading}>Project Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className={labelCls}>Budget</label>
                        <input type="text" placeholder="e.g., $50,000" value={formData.budget}
                          onChange={(e) => handleInputChange("budget", e.target.value)} className={inputCls} />
                      </div>

                      <div className="space-y-2">
                        <label className={labelCls}>Priority <span className="text-red-500">*</span></label>
                        <select value={formData.priority} onChange={(e) => handleInputChange("priority", e.target.value)}
                          required className={inputCls + " appearance-none"}>
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
                            <input type="text" placeholder="Search project manager..." value={managerSearch}
                              onChange={(e) => { setManagerSearch(e.target.value); setShowManagerDropdown(true); handleInputChange("projectManager", ""); }}
                              onFocus={() => setShowManagerDropdown(true)} className={inputCls} />
                            {showManagerDropdown && (
                              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1a1f2b] border border-gray-300 dark:border-[#2a3040] rounded-lg shadow-lg dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] max-h-48 overflow-auto">
                                {filteredManagers.length > 0 ? (
                                  filteredManagers.map((manager) => (
                                    <div key={manager.id}
                                      onClick={() => { handleInputChange("projectManager", manager?.id); setManagerSearch(manager?.fullname); setShowManagerDropdown(false); }}
                                      className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-[#252d3d] cursor-pointer text-sm text-gray-800 dark:text-slate-200 transition-colors">
                                      {manager?.fullname}{" "}
                                      <span className="text-gray-500 dark:text-slate-500 lowercase">({manager?.position})</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-slate-500">No managers found</div>
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
                        <label className={labelCls}>Start Date <span className="text-red-500">*</span></label>
                        <input type="date" value={formData.startDate}
                          onChange={(e) => handleInputChange("startDate", e.target.value)} className={inputCls} />
                      </div>
                      <div className="space-y-2">
                        <label className={labelCls}>End Date <span className="text-red-500">*</span></label>
                        <input type="date" value={formData.endDate}
                          onChange={(e) => handleInputChange("endDate", e.target.value)} className={inputCls} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-[#2a3040] bg-gray-50 dark:bg-[#1a1f2b]">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                  border border-gray-300 dark:border-[#2a3040]
                  bg-white dark:bg-[#222732]
                  text-gray-700 dark:text-slate-300
                  hover:bg-gray-100 dark:hover:bg-[#252d3d]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loadingUpdateProject}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150
                  bg-blue-600 hover:bg-blue-700 text-white
                  dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
                  dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]
                  ${loadingUpdateProject ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {loadingUpdateProject ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
