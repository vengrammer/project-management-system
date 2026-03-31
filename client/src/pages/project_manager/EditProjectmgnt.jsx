import { useState, useEffect } from "react";
import { X, Loader } from "lucide-react";
import logo from "@/assets/logo.png";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { GET_THE_PROJECTMGNT } from "./ProjectmgntDetails";

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

const inputCls =
  "w-full px-3 py-2 rounded-lg text-sm transition-all " +
  "border border-gray-300 dark:border-[#2a3040] " +
  "bg-white dark:bg-[#1a1f2b] " +
  "text-gray-800 dark:text-slate-200 " +
  "placeholder-gray-400 dark:placeholder-slate-600 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

// Fix: use local date parts to avoid UTC off-by-one in UTC+8 timezone
const toInputDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day   = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function EditProjectmgnt({
  onProjectUpdated,
  isOpen,
  setIsOpen,
}) {
  // ── All hooks must come BEFORE any early return ──────────────────────────
  const { id } = useParams();

  const auth = useSelector((state) => state.auth);
  const userId = auth.user?.id;

  const [initialized, setInitialized] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    priority: "",
    startDate: "",
    endDate: "",
    pm: "",
  });

  const [createNotif] = useMutation(CREATE_NOTIF_FOR_ADMIN);

  const { data: dataProjectMgnt, loading: loadingProjectMgnt } = useQuery(
    GET_THE_PROJECTMGNT,
    {
      variables: { projectMgntId: id },
      skip: !isOpen,
    },
  );

  // Reset + re-populate whenever modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setInitialized(false);
      setFormData({ title: "", priority: "", startDate: "", endDate: "", pm: "" });
      return;
    }
  }, [isOpen]);

  // Pre-populate form once data arrives
  useEffect(() => {
    if (!isOpen || initialized || !dataProjectMgnt?.projectMgnt) return;

    const pm = dataProjectMgnt.projectMgnt;
    setFormData({
      title:     pm.title     || "",
      priority:  pm.priority  || "",
      startDate: toInputDate(pm.startDate),
      endDate:   toInputDate(pm.endDate),
      pm:        pm.pm?.id    || "",
    });
    setInitialized(true);
  }, [isOpen, initialized, dataProjectMgnt]);

  const [updateProjectMgnt, { loading: loadingUpdate }] = useMutation(
    UPDATE_PROJECTMGNT,
    {
      onCompleted: async (data) => {
        toast.success("Project management updated successfully");

        const projectMgntID = data?.updateProjectMgnt?.projectMgnt?._id;
        const pmUser        = data?.updateProjectMgnt?.projectMgnt?.pm;
        const title         = data?.updateProjectMgnt?.projectMgnt?.title;

        createNotif({
          variables: {
            input: {
              entity:     { id: projectMgntID, type: "ProjectMgnt" },
              isRead:     false,
              message:    `Project management "${title}" has been updated.`,
              recipients: pmUser?.id,
              sender:     userId,
              title:      "Project Management Updated",
              type:       "Project Management Updated",
            },
          },
        });

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
          variables: { projectMgntId: id },
        },
      ],
      awaitRefetchQueries: true,
    },
  );

  const handleInputChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleClose = () => setIsOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error("Title is required.");      return; }
    if (!formData.priority)     { toast.error("Priority is required.");   return; }
    if (!formData.startDate)    { toast.error("Start date is required."); return; }
    if (!formData.endDate)      { toast.error("End date is required.");   return; }

    updateProjectMgnt({
      variables: {
        updateProjectMgntId: id,
        title:     formData.title,
        priority:  formData.priority,
        startDate: formData.startDate,
        endDate:   formData.endDate,
        pm:        formData.pm || userId,
      },
    });
  };

  const sectionHeading =
    "text-sm font-semibold text-gray-700 dark:text-[#31f64b]/70 border-b border-gray-200 dark:border-[#2a3040] pb-2";
  const labelCls =
    "block text-sm font-medium text-gray-700 dark:text-slate-300";

  // ── Early returns AFTER all hooks ────────────────────────────────────────
  if (!isOpen) return null;

  if (loadingProjectMgnt || loadingUpdate) {
    return (
      <div className="fixed h-screen inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
        <Loader size={70} className="animate-spin text-blue-500 dark:text-[#31f64b]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 dark:bg-black/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#222732] rounded-lg shadow-xl dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* ── Header ── */}
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
              Edit Project Management
            </h2>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-slate-500 mt-1">
            Update the information below to edit this project management.
          </p>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col overflow-auto">
          <div className="overflow-auto">

            {/* Basic Information */}
            <div className="space-y-4 p-6">
              <h3 className={sectionHeading}>Basic Information</h3>
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

        {/* ── Footer ── */}
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