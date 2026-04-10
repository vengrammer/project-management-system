import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader,
  Pen,
  Plus,
  Eye,
  Trash2,
  Target,
  TrendingUp,
  User,
  Users,
  Users2,
  UserPlus,
  Check,
} from "lucide-react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PmFormAddProjectModal from "./PmFormAddProjectModal";
import AddTheManagerFromDepartment from "./AddTheManagerFromDepartment";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ViewCurrentManager from "./ViewCurrentManager";
import { Fragment, useState } from "react";
import { motion } from "framer-motion";
import PmFormEditProjectModal from "./PmFormEditProjectModal";
import EditProjectmgnt from "./EditProjectmgnt";
import { useSelector } from "react-redux";
import AddNewProjectMgntDepartment from "./AddNewProjectMgntDepartment";

export const GET_THE_PROJECTMGNT = gql`
  query ProjectMgnt($projectMgntId: ID!) {
    projectMgnt(id: $projectMgntId) {
      _id
      title
      status
      startDate
      priority
      isArchive
      endDate
      projects {
        id
        department {
          id
        }
      }
      departments {
        id
        name
      }
      pm {
        id
        fullname
      }
      managers {
        id
        fullname
        department {
          id
        }
      }
    }
  }
`;
export const GET_PROJECTS_BY_PROJECTMGNT = gql`
  query ProjectsByProjectMgnt($projectsByProjectMgntId: [ID]) {
    projectsByProjectMgnt(id: $projectsByProjectMgntId) {
      id
      title
      status
      startDate
      projectManager {
        id
        fullname
      }
      priority
      isArchive
      users {
        id
      }
      endDate
      description
      department {
        id
        name
      }
      client
      budget
    }
  }
`;

export const GET_TASKS = gql`
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
      completedDate
      createdAt
    }
  }
`;

export const GET_TASKS_BY_PROJECTS = gql`
  query TasksByProjects($projectIds: [ID!]!) {
    tasksByProjects(ids: $projectIds) {
      id
      status
      project {
        id
      }
    }
  }
`;

export const GET_ALL_MANAGERS = gql`
  query UserRoleManager {
    userRoleManager {
      id
      fullname
      position
      role
      department {
        id
        name
      }
    }
  }
`;

export const UPDATE_PROJECTMGNT_MANAGERS = gql`
  mutation UpdateProjectMgnt($updateProjectMgntId: ID!, $addManagers: [ID!]) {
    updateProjectMgnt(id: $updateProjectMgntId, addManagers: $addManagers) {
      message
      projectMgnt {
        _id
      }
    }
  }
`;

const UPDATE_STATUS_PROJECTMGNT = gql`
mutation Mutation($updateProjectMgntId: ID!, $status: String) {
  updateProjectMgnt(id: $updateProjectMgntId, status: $status) {
    message
  }
}`;

export const DELETE_DEPARTMENT_AND_MANAGER = gql`
  mutation UpdateProjectMgnt($updateProjectMgntId: ID!, $removeDepartments: [ID!]) {
  updateProjectMgnt(id: $updateProjectMgntId, removeDepartments: $removeDepartments) {
    message
    projectMgnt {
      _id
    }
  }
}
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      message
      project {
        id
      }
    }
  }
  `;

function ProjectmgntDetails() {

  const auth = useSelector((state) => state.auth);
  const userId = auth.user?.id;

  const [openCurrentManager, setOpenCurrentManager] = useState(false);
  const { id } = useParams();

  const navigate = useNavigate();
  const location = useLocation();
  const userRoute = location.pathname.includes("/manager") ? "/manager" : "/projectmanager";
  const isManagerRoute = location.pathname.includes("/manager");
  const isPm = location.pathname.includes("/projectmanager");

  const handelBack = () => {
    navigate(`${userRoute}/projectmgnt`)
  }
  //get the project management details
  const {
    data: dataProjectMgnt,
    loading: loadingProjectMgnt,
    refetch: refetchProjectMgnt,
  } = useQuery(GET_THE_PROJECTMGNT, {
    variables: { projectMgntId: id },
  });
  const projectmgnt = dataProjectMgnt?.projectMgnt || null;

  const projectMgntProjectIds =
    projectmgnt?.projects?.map((p) => p?.id).filter(Boolean) || [];

  const { data: allManagersData } = useQuery(GET_ALL_MANAGERS);

  const [updateProjectMgntManagers] = useMutation(UPDATE_PROJECTMGNT_MANAGERS, {
    onError: (error) => toast.error(`Could not add manager: ${error.message}`),
    onCompleted: () => toast.success("Manager added to this project management"),
    refetchQueries: [
      {
        query: GET_THE_PROJECTMGNT,
        variables: { projectMgntId: id },
      },
    ],
    awaitRefetchQueries: true,
  });

  // get the projects by project management id
  const {
    data: dataProjectsByProjectMgnt,
  } = useQuery(GET_PROJECTS_BY_PROJECTMGNT, {
    variables: { projectsByProjectMgntId: projectMgntProjectIds },
    skip: projectMgntProjectIds.length === 0,
  });
  const projectsByProjectMgnt =
    dataProjectsByProjectMgnt?.projectsByProjectMgnt || [];


  const [deleteDepartmentAndManager] = useMutation(DELETE_DEPARTMENT_AND_MANAGER)

  const handleDeleteDepartment = async (departmentId, departmentName) => {
    // Check if department is used by any project in this projectmgnt
    const projectsInDept = projectsByProjectMgnt.filter(
      (project) => project.department?.id === departmentId
    );
    if (projectsInDept.length > 0) {
      Swal.fire({
        title: "Cannot Delete Department",
        text: `This department "${departmentName}" is currently enrolled in ${projectsInDept.length} project(s) within this project management. Please delete the projects first.`,
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Confirm deletion
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete this department in project management "${departmentName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteDepartmentAndManager({
          variables: { updateProjectMgntId: id, removeDepartments: [departmentId] },
        });
        Swal.fire("Deleted!", "The department has been deleted.", "success");
        refetchProjectMgnt(); // Refetch to update the list
      } catch (error) {
        Swal.fire("Error!", error.message, "error");
      }
    }
  };


  const [deleteProject] = useMutation(DELETE_PROJECT, {
    onError: () => toast.error(`Could not delete project`),
    onCompleted: () => toast.success("Project deleted successfully"),
    refetchQueries: [
      {
        query: GET_THE_PROJECTMGNT,
        variables: { projectMgntId: id },
      },
      {
        query: GET_PROJECTS_BY_PROJECTMGNT,
        variables: { projectsByProjectMgntId: projectMgntProjectIds },
      },
      {
        query: GET_TASKS_BY_PROJECTS,
        variables: { projectIds: projectMgntProjectIds },
      },
    ],
    awaitRefetchQueries: true,
  });
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentManagers, setDepartmentManagers] = useState([]);
  const [openAddManager, setOpenAddManager] = useState(false);
  const [availableManagers, setAvailableManagers] = useState([]);

  const [isOpen, setIsOpen] = useState(false);

  const [projectToEdit, setProjectToEdit] = useState(null);
  const [openEditProjectMgnt, setOpenEditProjectMgnt] = useState(false);

  const [openAddDepartment, setOpenAddDepartment] = useState(false);


  const handleViewManagers = (department) => {
    if (!department) return;
    const managersInDept = projectmgnt?.managers?.filter(
      (m) => m?.department?.id === department.id || m?.department?.id === department._id,
    );
    setSelectedDepartment(department);
    setDepartmentManagers(managersInDept || []);
    setOpenCurrentManager(true);
  };

  const handleOpenAddManagers = (department) => {
    if (!department) return;

    const assignedIds = new Set(projectmgnt?.managers?.map((m) => m.id));
    const allManagers = allManagersData?.userRoleManager || [];

    const eligible = allManagers.filter(
      (m) => !assignedIds.has(m.id) && (m.department?.id === department.id || true),
    );

    setSelectedDepartment(department);
    setAvailableManagers(eligible);
    setOpenAddManager(true);
  };

  const onAddManager = async (managerId) => {
    if (!id || !managerId) return;

    await updateProjectMgntManagers({
      variables: {
        updateProjectMgntId: id,
        addManagers: [managerId],
      },
    });

    setAvailableManagers((prev) => prev.filter((m) => m.id !== managerId));
  };

  const handleDelete = async (projectid) => {
    Swal.fire({
      title: "Are you sure you want to delete this project?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        deleteProject({
          variables: {
            id: projectid,
          }
        });

      }
    });
  };

  const { data: tasksByProjectData } =
    useQuery(GET_TASKS_BY_PROJECTS, {
      variables: { projectIds: projectMgntProjectIds },
      skip: projectMgntProjectIds.length === 0,
      notifyOnNetworkStatusChange: true,
    });

  const tasksByProjects = tasksByProjectData?.tasksByProjects || [];

  // no top-level task query needed here

  const getPriorityColor = (priority) => {
    if (!priority)
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    const p = String(priority).toLowerCase();
    if (p === "high")
      return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800";
    if (p === "medium")
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    if (p === "low")
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
    return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
  };

  const getStatusColor = (status) => {
    if (!status)
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
    const s = String(status).toLowerCase().replace(/[_\s]/g, "");
    if (s === "completed")
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-[#31f64b] dark:border-green-800";
    if (s === "inprogress" || s === "in_progress")
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    if (s === "not_started" || s === "todo")
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
    return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
  };

  const calculateProgressProjectMgnt = (projectLength, projectCompleted) => {
    if (projectLength === 0) return 0;
    return Math.round((projectCompleted / projectLength) * 100);
  };

  const calculateProgressProject = (taskLength, taskComplete, projectStatus) => {
    if (projectStatus === "not started") return 0;
    if (projectStatus === "completed") return 100;
    if (taskLength === 0) return 0;
    return Math.round((taskComplete / taskLength) * 100);
  };

  const totalTaskCount = tasksByProjects.length;
  const completedTaskCount = tasksByProjects.filter(
    (t) => t.status === "completed",
  ).length;

  // Calculate project status counts
  const totalProjects = projectsByProjectMgnt.length;
  const notStartedProjects = projectsByProjectMgnt.filter((p) => {
    const normalized = String(p.status).toLowerCase().replace(/[_\s]/g, "");
    return normalized === "notstarted" || normalized === "todo";
  }).length;
  const inProgressProjects = projectsByProjectMgnt.filter((p) => {
    const normalized = String(p.status).toLowerCase().replace(/[_\s]/g, "");
    return normalized === "inprogress";
  }).length;
  const completedProjects = projectsByProjectMgnt.filter((p) => {
    const normalized = String(p.status).toLowerCase().replace(/[_\s]/g, "");
    return normalized === "completed";
  }).length;

  const [updateStatusProjectMgnt] = useMutation(UPDATE_STATUS_PROJECTMGNT, {
    refetchQueries: [GET_THE_PROJECTMGNT],
    awaitRefetchQueries: true,
    onError: (error) => toast.error(`Could not update status: ${error.message}`),
    onCompleted: (data) => toast.success("Status updated successfully"),
  });

  const handleMarkAsDone = (status) => {
    Swal.fire({
      title: `${status === "completed" ? "Mark this project as in progress?" : "Mark this project as completed?"}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm!",
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatusProjectMgnt({
          variables: {
            updateProjectMgntId: id,
            status: status === "completed" ? "in progress" : "completed",
          },
        });
      }
    });
  };



  function handleMarkAsInProgress() {
    updateStatusProjectMgnt({
      variables: {
        updateProjectMgntId: id,
        status: "in progress",
      },
    });
  }

  function handleMarkAsNotStarted() {
    updateStatusProjectMgnt({
      variables: {
        updateProjectMgntId: id,
        status: "not started",
      },
    });
  }

  if (
    loadingProjectMgnt
  ) {
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



  return (
    <div className="h-screen flex flex-col w-flow  overflow-auto bg-gray-200 dark:bg-[#181d28] p-3 lg:px-10 lg:py-5">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="flex flex-col h-full min-h-0">
        <div
          key={projectmgnt?.id}
          className="flex flex-col flex-1 w-full h-full"
        >
          <button
            onClick={() => handelBack()}
            className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-[#31f64b] mb-6 transition-colors duration-150">
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <header className="bg-white dark:bg-[#222732] flex flex-col rounded-lg shadow-sm border p-6 mb-2">
            <div className="flex flex-col w-full h-full lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
              <div className="flex flex-col flex-1 gap-4">
                <div className="flex flex-col sm:flex-row  justify-start gap-3  md:gap-8">
                  <h1 className="text-3xl font-extrabold">
                    {projectmgnt?.title}
                  </h1>
                  <div className="gap-1 flex items-center">
                    <span
                      className={`whitespace-nowrap first-letter:uppercase px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        projectmgnt?.status,
                      )}`}
                    >
                      {projectmgnt?.status}
                    </span>
                    <span
                      className={`whitespace-nowrap px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                        projectmgnt?.priority,
                      )}`}
                    >
                      {projectmgnt?.priority}
                    </span>
                  </div>
                </div>

                {/*All department*/}
                <div className="w-full flex gap-2 ">
                  {projectmgnt?.departments.map((item) => (
                    <div
                      key={item?.id}
                      className="bg-[rgb(29,122,1)] text-white px-5 flex items-center justify-center  rounded-2xl "
                    >
                      {item.name}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <User size={16} />
                    PM:{" "}
                    {projectmgnt?.pm?.fullname
                      ? projectmgnt?.pm?.fullname
                      : "no pm"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={16} />
                    Team:{" "}
                    {projectmgnt?.managers?.length
                      ? projectmgnt?.managers?.length
                      : "0"}{" "}
                    managers
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    {projectmgnt?.startDate
                      ? projectmgnt?.startDate
                      : "no start date"}{" "}
                    -{" "}
                    {projectmgnt?.endDate
                      ? projectmgnt?.endDate
                      : "no end date"}
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="flex flex-col flex-1  w-full h-full">
                {!isManagerRoute && <div className="flex lg:justify-end gap-3">
                  <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-semibold transition-all duration-150
                            bg-blue-600 hover:bg-blue-700 text-white
                            dark:bg-blue-600/90 dark:hover:bg-blue-500
                            dark:hover:shadow-[0_0_8px_rgba(59,130,246,0.4)]
                            disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Pen size={18} />
                    Edit Project Management
                  </button>
                  <div className="flex gap-3 flex-wrap">
                    <div>
                      <button
                        onClick={() => handleMarkAsDone(projectmgnt.status)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 text-sm font-semibold text-white
                      ${projectmgnt.status === "completed"
                            ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500/90 dark:hover:bg-amber-500"
                            : "bg-green-600 hover:bg-green-700 dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940] dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]"
                          }`}
                      >
                        {projectmgnt.status === "completed" ? <Loader size={18} /> : <Check size={18} />}
                        {projectmgnt.status === "completed" ? "Mark As In Progress" : "Mark As Completed"}
                      </button>
                    </div>
                    <div>
                      {projectmgnt.status === "not started" && (
                        <button
                          onClick={() => handleMarkAsInProgress()}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 text-sm font-semibold text-white
                      bg-blue-600 hover:bg-blue-700 dark:bg-blue-500/90 dark:hover:bg-blue-500
                      dark:hover:shadow-[0_0_8px_rgba(59,130,246,0.35)]"
                        >
                          <TrendingUp size={18} />
                          Mark As In Progress
                        </button>
                      )}
                    </div>
                    <div>
                      {projectmgnt.status === "completed" || projectmgnt.status === "in_progress" || projectmgnt.status === "inprogress" || projectmgnt.status === "in progress" && (
                        <button
                          onClick={() => handleMarkAsNotStarted()}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 text-sm font-semibold text-white
                      bg-gray-600 hover:bg-gray-700 dark:bg-gray-500/90 dark:hover:bg-gray-500
                      dark:hover:shadow-[0_0_8px_rgba(107,114,128,0.35)]"
                        >
                          <ArrowLeft size={18} />
                          Mark As Not Started
                        </button>
                      )}
                    </div>
                  </div>
                </div>}
              </div>
            </div>
            {/* for the progress*/}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Overall Task Progress
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-slate-100">
                  {calculateProgressProject(totalTaskCount, completedTaskCount)}
                  %
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-[#2a3040] rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-blue-600 dark:from-[#31f64b] dark:to-[#28d940] transition-all duration-500"
                  style={{
                    width: `${calculateProgressProjectMgnt(
                      projectsByProjectMgnt.length,
                      projectsByProjectMgnt.filter((p) =>
                        String(p.status).toLowerCase().includes("completed"),
                      ).length,
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/40 hover:scale-105 hover:shadow-xl transition-all duration-150">
                <div className="flex items-center justify-between mb-2">
                  <Target
                    className="text-blue-600 dark:text-blue-400"
                    size={20}
                  />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {totalProjects}
                </p>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  Total Projects
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-900/40 hover:scale-105 hover:shadow-xl transition-all duration-150">
                <div className="flex items-center justify-between mb-2">
                  <Clock
                    className="text-orange-600 dark:text-orange-400"
                    size={20}
                  />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {notStartedProjects}
                </p>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  Not Started
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-900/40 hover:scale-105 hover:shadow-xl transition-all duration-150">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp
                    className="text-orange-600 dark:text-orange-400"
                    size={20}
                  />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {inProgressProjects}
                </p>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  In Progress
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-900/40 hover:scale-105 hover:shadow-xl transition-all duration-150">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2
                    className="text-green-600 dark:text-[#31f64b]"
                    size={20}
                  />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {completedProjects}
                </p>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  Completed
                </p>
              </div>
            </div>
          </header>
        </div>
        <main className="flex flex-col rounded-lg shadow-sm  p-2 sm:p-0 h-full">
          <div className="flex flex-col lg:flex-row gap-5 w-full h-full overflow-hidden">
            <div className="flex-1 border-3 min-h-100 bg-white dark:bg-[#222732] rounded-lg shadow-sm flex flex-col max-h-[64vh] overflow-hidden">
              <header className="flex justify-between w-full min-w-0 p-4 rounded-t-xl border-b-2 ">
                <div className="flex flex-col gap-1">
                  <h1 className="font-bold text-xl">Projects</h1>
                  <p className="text-gray-400 text-sm">
                    {projectsByProjectMgnt?.length || 0} total projects
                  </p>
                </div>
                <div>
                  <div className="flex gap-3 flex-wrap">
                    <div className="">
                      <PmFormAddProjectModal
                        onProjectAdded={refetchProjectMgnt}
                        projectMgntId={id}
                      />
                    </div>
                  </div>
                </div>
              </header>
              {/* Projects list */}
              <main className="flex flex-col   flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200 dark:scrollbar-thumb-[#31f64b] dark:scrollbar-track-[#1a1f2b]">
                {projectsByProjectMgnt?.map((project) => (
                  <div
                    key={project.id}
                    className="w-full border-b border-gray-200 dark:border-gray-600 p-3 sm:p-4 flex flex-col gap-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="min-w-0 flex gap-3">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-slate-100 truncate">
                          {project?.title || "No Title"}
                        </h3>
                        <div className="gap-1 flex items-center">
                          <span
                            className={`whitespace-nowrap first-letter:uppercase px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              project?.status,
                            )}`}
                          >
                            {project?.status}
                          </span>
                          <span
                            className={`whitespace-nowrap px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                              project?.priority,
                            )}`}
                          >
                            {project?.priority}
                          </span>
                        </div>
                      </div>

                      {((project?.projectManager?.id === userId || isPm)) && <div className="flex items-start gap-2">
                        <button
                          type="button"
                          className="p-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"

                          onClick={() => { setOpenEditProjectMgnt(true); setProjectToEdit(project.id); }}
                          className="p-2 rounded-md bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-800"
                          title="Edit"
                        >
                          <Pen size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          type="button"
                          className="p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>}

                    </div>
                    <div className="w-full flex">
                      <p className="bg-[rgb(29,122,1)] text-white   px-5 flex items-center justify-center  rounded-2xl ">{project?.department?.name || "No Department"}</p>
                    </div>
                    <div className="flex gap-2 text-sm text-gray-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1 truncate">
                        <User size={14} />
                        <strong className="min-w-0 truncate">M:</strong>
                        <span className="min-w-0 truncate">
                          {project?.projectManager?.fullname || "No Manager"}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 truncate">
                        <Users size={14} />
                        <strong>Member:</strong>
                        <span>{project?.users?.length || 0} employees</span>
                      </span>

                      <span className="inline-flex items-center gap-1 truncate">
                        <Calendar size={14} />
                        <span>{project?.startDate || "N/A"} -</span>
                      </span>
                      <span className="inline-flex items-center gap-1 truncate">
                        <span>{project?.endDate || "N/A"}</span>
                      </span>
                    </div>
                    {/* for the progress*/}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          Overall Progress
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-slate-100">
                          {(() => {
                            const projectTasks = tasksByProjects.filter(
                              (t) =>
                                t.project?.id === project.id ||
                                t.project?._id === project.id,
                            );
                            const projectCompleted = projectTasks.filter(
                              (t) => t.status === "completed",
                            ).length;
                            return calculateProgressProject(
                              projectTasks.length,
                              projectCompleted,
                              project?.status
                            );
                          })()}
                          %
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 dark:bg-[#2a3040] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-blue-500 to-blue-600 dark:from-[#31f64b] dark:to-[#28d940] transition-all duration-500"
                          style={{
                            width: `${(() => {
                              const projectTasks = tasksByProjects.filter(
                                (t) =>
                                  t.project?.id === project.id ||
                                  t.project?._id === project.id,
                              );
                              const projectCompleted = projectTasks.filter(
                                (t) => t.status === "completed",
                              ).length;
                              return calculateProgressProject(
                                projectTasks.length,
                                projectCompleted,
                                project?.status
                              );
                            })()}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </main>
            </div>
            {/*department*/}
            <div
              className="flex-1 min-h-100 lg:max-w-150 lg:w-full bg-white  border-3 dark:bg-[#222732] rounded-lg shadow-sm 
                    max-h-[58vh] overflow-y-auto"
            >
              <header className="flex justify-between w-full min-w-0 p-4 rounded-t-xl border-b-2 ">
                <div className="flex flex-col gap-1">
                  <h1 className="font-bold text-xl">Departments</h1>
                  <p className="text-gray-400 text-sm">
                    {projectmgnt?.departments?.length || 0} total departments
                  </p>
                </div>
                {!isManagerRoute && <div>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => setOpenAddDepartment(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150
            bg-blue-600 hover:bg-blue-700 text-white
            dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
            dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]"
                    >
                      <Plus size={18} />
                      Add New Department
                    </button>
                  </div>
                </div>}
              </header>
              {projectmgnt?.departments?.map((department) => (
                <div key={department?.id} className="flex flex-col w-full max-w-full border-b border-gray-200 dark:border-gray-600 p-3  gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <p>{department.name}</p>
                    </div>

                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => handleViewManagers(department)}
                        type="button"
                        className="p-2 rounded-md bg-blue-200 text-gray-700 hover:bg-blue-300 dark:bg-[#074ccc] dark:text-green-200 dark:hover:bg-[#144cf3]"
                        title="View Managers"
                      >
                        <Users size={18} />
                      </button>

                      {!isManagerRoute && <Fragment>  <button
                        type="button"
                        onClick={() => handleOpenAddManagers(department)}
                        className="p-2 rounded-md bg-green-200 text-gray-700 hover:bg-green-300 dark:bg-[#0a7f19] dark:text-green-200 dark:hover:bg-[#06a31b]"
                        title="Add Managers"
                      >
                        <UserPlus size={18} />
                      </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDepartment(department.id, department.name)}
                          className="p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button> </Fragment>}


                    </div>
                  </div>
                  {/* for the managers and projects count*/}
                  <div className="flex flex-1 flex-row items-center gap-4">
                    <div className="flex  items-center justify-center gap-1">
                      <Users2 size={15} />
                      <p>{projectmgnt?.managers?.filter(manager => manager.department?.id === department.id).length || 0} <span>managers</span></p>
                    </div>
                    <div className="flex gap-2 items-center ">
                      <Target size={15} />
                      <p>{projectsByProjectMgnt?.filter(project => project.department?.id === department.id).length || 0} <span>projects</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </motion.div>
      <ViewCurrentManager
        open={openCurrentManager}
        setOpen={setOpenCurrentManager}
        department={selectedDepartment}
        managers={departmentManagers}
      />
      <AddTheManagerFromDepartment
        open={openAddManager}
        setOpen={setOpenAddManager}
        department={selectedDepartment}
        managers={availableManagers}
        onAddManager={onAddManager}
      />

      {isOpen && <EditProjectmgnt
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />}

      {openEditProjectMgnt && <PmFormEditProjectModal
        isOpen={openEditProjectMgnt}
        setIsOpen={setOpenEditProjectMgnt}
        projectToEdit={projectToEdit}
      />}

      {openAddDepartment && <AddNewProjectMgntDepartment
        open={openAddDepartment}
        setOpen={setOpenAddDepartment}
        refetchQueries={[{ query: GET_THE_PROJECTMGNT, variables: { projectMgntId: id } }]}
      />}
    </div>
  );
}
export default ProjectmgntDetails;
