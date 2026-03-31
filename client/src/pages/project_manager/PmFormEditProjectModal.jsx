import { useState, useEffect, useRef, Fragment } from "react";
import { X, Loader } from "lucide-react";
import logo from "@/assets/logo.png";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-toastify";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { GET_THE_PROJECTMGNT } from "./ProjectmgntDetails";

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

const UPDATE_PROJECTMGNT = gql`
    mutation UpdateProjectMgnt(
      $updateProjectMgntId: ID!
      $title: String
      $priority: String
      $startDate: String
      $endDate: String
      $pm: ID
    ) {
      updateProjectMgnt(
        id: $updateProjectMgntId
        title: $title
        priority: $priority
        startDate: $startDate
        endDate: $endDate
        pm: $pm
      ) {
        message
        projectMgnt {
          _id
          title
          priority
          startDate
          endDate
          pm {
            id
            fullname
          }
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

// Shared input class
const inputCls =
  "w-full px-3 py-2 rounded-lg text-sm transition-all " +
  "border border-gray-300 dark:border-[#2a3040] " +
  "bg-white dark:bg-[#1a1f2b] " +
  "text-gray-800 dark:text-slate-200 " +
  "placeholder-gray-400 dark:placeholder-slate-600 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

// Helper: convert "April 1, 2025" → "2025-04-01" for <input type="date">
const toInputDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toISOString().split("T")[0];
};

export default function PmFormEditProjectModal({
  isOpen,
  setIsOpen,
  projectToEdit,
}) {

  console.log("project to edit in modal:", projectToEdit);

  if(!isOpen) return null;

  const { id } = useParams();


  const auth = useSelector((state) => state.auth);
  const currentManagerData = auth.user;
  const location = useLocation();
  const isManagerRoute = location.pathname.includes("/manager");
  const userId = auth.user?.id;

  const departmentRef = useRef(null);
  const [initialized, setInitialized] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    priority: "",
    startDate: "",
    endDate: "",
    pm: "",
    department: "",
  });

  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [departmentSearch, setDepartmentSearch] = useState("");

  const handleClose = () => setIsOpen(false);
  const [createNotif] = useMutation(CREATE_NOTIF_FOR_ADMIN);

  // ── Fetch current ProjectMgnt data ──────────────────────────────────────
  const {
    data: dataProjectMgnt,
    loading: loadingProjectMgnt,
  } = useQuery(GET_THE_PROJECTMGNT, {
    variables: { projectMgntId: resolvedId },
    skip: !resolvedId,
  });

  // ── Fetch departments list ───────────────────────────────────────────────
  const {
    loading: loadingDepartments,
    error: errorDepartments,
    data: dataDepartments,
    refetch: refetchDepartments,
  } = useQuery(GET_DEPARTMENTS, {
    variables: { projectMgntId: resolvedId },
    notifyOnNetworkStatusChange: true,
    skip: !resolvedId,
  });

  // ── Fetch managers list ──────────────────────────────────────────────────
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
    //  
  }, [refetchUserManager, refetchDepartments]);

  // ── Pre-populate form when data arrives ────────────────────────────────
  useEffect(() => {
    if (!initialized && dataProjectMgnt?.projectMgnt) {
      const pm = dataProjectMgnt.projectMgnt;

      if (isManagerRoute && currentManagerData) {
        // Manager route: lock dept + manager to current user's data
        setFormData({
          title: pm.title || "",
          priority: pm.priority || "",
          startDate: toInputDate(pm.startDate),
          endDate: toInputDate(pm.endDate),
          pm: currentManagerData.id || "",
          department: currentManagerData.department?.id || "",
        });
        setDepartmentSearch(currentManagerData.department?.name || "");
      } else {
        // Admin / PM route: pre-fill everything from existing data
        const deptId = pm.departments?.[0]?.id || "";
        const deptName = pm.departments?.[0]?.name || "";

        setFormData({
          title: pm.title || "",
          priority: pm.priority || "",
          startDate: toInputDate(pm.startDate),
          endDate: toInputDate(pm.endDate),
          pm: pm.pm?.id || "",
          department: deptId,
        });
        setDepartmentSearch(deptName);
      }

      setInitialized(true);
    }
  }, [dataProjectMgnt, initialized, isManagerRoute, currentManagerData]);

  // ── Update mutation ──────────────────────────────────────────────────────
  const [updateProjectMgnt, { loading: loadingUpdate }] = useMutation(
    UPDATE_PROJECTMGNT,
    {
      onCompleted: async (data) => {
        toast.success("Project management updated successfully");

        if (isManagerRoute && currentManagerData) {
          const projectMgntID = data?.updateProjectMgnt?.projectMgnt?._id;
          const pmUser = data?.updateProjectMgnt?.projectMgnt?.pm;
          const title = data?.updateProjectMgnt?.projectMgnt?.title;

          createNotif({
            variables: {
              input: {
                entity: { id: projectMgntID, type: "ProjectMgnt" },
                isRead: false,
                message: `Project management "${title}" has been updated by "${currentManagerData?.fullname}".`,
                recipients: pmUser?.id,
                sender: currentManagerData?.id,
                title: "Project Management Updated",
                type: "Project Management Updated",
              },
            },
          });
        }

        if (onProjectUpdated) await onProjectUpdated();
        setIsOpen(false);
      },
      onError: (err) => {
        console.error(err);
        toast.error("Failed to update project management");
      },
      refetchQueries: [
        {
          query: GET_THE_PROJECTMGNT,
          variables: { projectMgntId: resolvedId },
        },
      ],
      awaitRefetchQueries: true,
    },
  );

  const handleInputChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!formData.priority) {
      toast.error("Priority is required.");
      return;
    }
    if (!formData.startDate) {
      toast.error("Start date is required.");
      return;
    }
    if (!formData.endDate) {
      toast.error("End date is required.");
      return;
    }

    updateProjectMgnt({
      variables: {
        updateProjectMgntId: resolvedId,
        title: formData.title,
        priority: formData.priority,
        startDate: formData.startDate,
        endDate: formData.endDate,
        pm: formData.pm || userId,
      },
    });
  };

  // ── Derived lists ────────────────────────────────────────────────────────
  const availableDepartments = isManagerRoute
    ? currentManagerData?.department
      ? [currentManagerData.department]
      : []
    : dataDepartments?.projectMgnt?.departments || [];

  const filteredDepartments = availableDepartments.filter((dept) =>
    dept.name?.toLowerCase().includes((departmentSearch || "").toLowerCase()),
  );

  const selectedDept = availableDepartments.find(
    (d) => d.id === formData.department || d.name === formData.department,
  );

  const managers = dataUserManager?.userRoleManager || [];

  const filteredManagersByDept = selectedDept?.id
    ? managers.filter((m) => m?.department?.id === selectedDept.id)
    : [];

  // ── Styling helpers ──────────────────────────────────────────────────────
  const sectionHeading =
    "text-sm font-semibold text-gray-700 dark:text-[#31f64b]/70 border-b border-gray-200 dark:border-[#2a3040] pb-2";
  const labelCls =
    "block text-sm font-medium text-gray-700 dark:text-slate-300";

  // ── Loading / error states ───────────────────────────────────────────────
  if (loadingDepartments || loadingUserManager || loadingProjectMgnt || loadingUpdate) {
    return (
      <div className="fixed h-screen inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader size={70} className="animate-spin text-blue-500 dark:text-[#31f64b]" />
        </div>
      </div>
    );
  }

  if (errorDepartments)
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]">
        <div className="text-red-600">Failed to load departments</div>
      </div>
    );

  if (errorUserManager)
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-[#181d28]">
        <div className="text-red-600">Failed to load managers</div>
      </div>
    );

  


  return (


    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 dark:bg-black/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#222732] rounded-lg shadow-xl dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* ── Modal Header ── */}
        <div className="flex flex-col items-center p-4 border-b border-gray-200 dark:border-[#2a3040]">
          <div className="w-full flex justify-end">
            <button
              type="button"
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
              Edit Project
            </h2>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-slate-500 mt-1">
            Update the information below to update this project.
          </p>
        </div>

        {/* ── Modal Body ── */}
        <div className="flex flex-col overflow-auto">
          <div className="overflow-auto">

            {/* Basic Information */}
            <div className="space-y-4 p-6">
              <h3 className={sectionHeading}>Basic Information</h3>

              {/* Title */}
              <div className="space-y-2">
                <label className={labelCls}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter project management title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                  className={inputCls}
                />
              </div>

              {/* Department + Manager */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

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
                        setTimeout(() => setShowDepartmentDropdown(false), 150);
                      }}
                      className={inputCls}
                    />
                    {showDepartmentDropdown && !isManagerRoute && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1a1f2b] border border-gray-300 dark:border-[#2a3040] rounded-lg shadow-lg dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] max-h-48 overflow-auto">
                        {filteredDepartments.length > 0 ? (
                          filteredDepartments.map((dept) => (
                            <div
                              key={dept.id}
                              onMouseDown={() => {
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
                    Manager <span className="text-red-500">*</span>
                  </label>
                  {!selectedDept?.id ? (
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      No department selected
                    </div>
                  ) : filteredManagersByDept.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      No managers in this department
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-auto border border-gray-300 dark:border-[#2a3040] rounded-lg p-2">
                      {isManagerRoute ? (
                        <label className="flex items-center gap-2 px-2 py-1">
                          <input type="radio" checked readOnly value={currentManagerData.id} />
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
                              checked={formData.pm === manager.id}
                              onChange={() => handleInputChange("pm", manager.id)}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                {/* Start Date */}
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

                {/* End Date */}
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
            disabled={loadingUpdate}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-150
                  bg-blue-600 hover:bg-blue-700 text-white
                  dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
                  dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]
                  ${loadingUpdate ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loadingUpdate ? "Updating..." : "Update Project Management"}
          </button>
        </div>
      </form>
    </div>
  );
}