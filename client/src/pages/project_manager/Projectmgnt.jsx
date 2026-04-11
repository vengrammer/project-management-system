import { motion } from "framer-motion";
import { Archive, Eye, Trash2, CalendarArrowUp, CalendarArrowDown, Plus, ChevronDown, Loader } from "lucide-react";
import { useState } from "react";
import AddNewProgram from "./AddNewProgram";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

export const GET_THE_PROJECTMGNT = gql`
    query ProjectMgnts {
        projectMgnts {
            _id
            title
            status
            startDate
            priority
            isArchive
            endDate
            departments {
                id
                name
            }
            managers {
                id
                fullname
            }
            pm {
                id
                fullname    
            }
        }
    }
`

export const GET_PROJECTMGNT_BYMANAGER = gql`
    query Query($projectsMgntByManagerId: ID) {
        projectsMgntByManager(id: $projectsMgntByManagerId) {
             _id
            title
            status
            startDate
            priority
            isArchive
            endDate
            departments {
                id
                name
            }
            managers {
                id
                fullname
            }
            pm {
                id
                fullname    
            }
        }
    }
`

export const GET_PROJECTMGNT_BYPM = gql`
    query ProjectMgntByPm($projectMgntByPmId: ID) {
         projectMgntByPm(id: $projectMgntByPmId) {
            _id
            title
            status
            startDate
            priority
            isArchive
            endDate
            departments {
                id
                name
            }
            managers {
                id
                fullname
            }
            pm {
                id
                fullname    
        }
    }
}
`

const DELETE_PROJECTMGNT = gql`
    mutation DeleteProjectMgnt($deleteProjectMgntId: ID!) {
        deleteProjectMgnt(id: $deleteProjectMgntId) {
            message
            projectMgnt {
            _id
            title
            }
        }
    }
`

const UPDATE_PROJECTMGNT = gql`
    mutation Mutation($updateProjectMgntId: ID!, $isArchive: Boolean) {
        updateProjectMgnt(id: $updateProjectMgntId, isArchive: $isArchive) {
            message
            projectMgnt {
            _id
            title
            }
        }
    }
`

function Projectmgnt() {
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    const auth = useSelector((state) => state.auth);
    const userId = auth.user?.id;

    const [openAddProgram, setOpenAddProgram] = useState(false)
    const navigate = useNavigate();
    const location = useLocation();

    const manager = location.pathname.includes("/manager")
    const pm = location.pathname.includes("/projectmanager")

    // for the admin
    const {
        loading: loadingAdminProjectMgnt,
        error: errorAdminProjectMgnt,
        data: dataAdminProjectMgnt,
        refetch: refetchAdminProjectMgnt,
    } = useQuery(GET_THE_PROJECTMGNT, {
        skip: manager || pm,

    });
    //for the manager
    const {
        loading: loadingMProjectMgnt,
        error: errorMProjectMgnt,
        data: dataMProjectMgnt,
        refetch: refetchMProjectMgnt,
    } = useQuery(GET_PROJECTMGNT_BYMANAGER, {
        variables: { projectsMgntByManagerId: userId },
        skip: !manager,
    });
    //for pm
    const {
        loading: loadingPmProjectMgnt,
        error: errorPmProjectMgnt,
        data: dataPmProjectMgnt,
        refetch: refetchPmProjectMgnt,
    } = useQuery(GET_PROJECTMGNT_BYPM, {
        variables: { projectMgntByPmId: userId },
        skip: !pm,
    });

    const querryloading = loadingAdminProjectMgnt || loadingMProjectMgnt || loadingPmProjectMgnt
    const querryerror = errorAdminProjectMgnt || errorMProjectMgnt || errorPmProjectMgnt

    //data of the projectmgnt 
    let projectMgnts = [];
    if (manager) {
        projectMgnts = dataMProjectMgnt?.projectsMgntByManager || [];
    } else if (pm) {
        projectMgnts = dataPmProjectMgnt?.projectMgntByPm || [];
    } else {
        projectMgnts = dataAdminProjectMgnt?.projectMgnts || [];
    }



    const [deleteProjectMgnt] = useMutation(DELETE_PROJECTMGNT, {
        onCompleted: async () => {
            toast.success('Successfully deleted project management');

            if (!manager && !pm) {
                await refetchAdminProjectMgnt();
            } else if (manager) {
                await refetchMProjectMgnt();
            } else if (pm) {
                await refetchPmProjectMgnt();
            }
        },
        onError: (error) => {
            toast.error('Failed to delete project management. Please try again.');
        },
        refetchAdminProjectMgnt,
        refetchMProjectMgnt,
        refetchPmProjectMgnt,
    })

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { data } = await deleteProjectMgnt({
                        variables: { deleteProjectMgntId: id },
                    });
                } catch (error) {
                    console.error("Error deleting project:", error);
                }
            }
        })
    }

    const [updateProjectMgnt] = useMutation(UPDATE_PROJECTMGNT, {
        onCompleted: async () => {
            toast.success('Successfully archived project management');
            if (!manager && !pm) {
                await refetchAdminProjectMgnt();
            } else if (manager) {
                await refetchMProjectMgnt();
            } else if (pm) {
                await refetchPmProjectMgnt();
            }
        },
        onError: (error) => {
            toast.error('Failed to archive project management. Please try again.');
        }
    })

    const handleArchive = async (id) => {
        Swal.fire({
            title: 'Are you sure you want to archive?',
            text: "Archive project!",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Archive it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { data } = await updateProjectMgnt({
                        variables: { updateProjectMgntId: id, isArchive: true },
                    });
                } catch (error) {
                    console.error("Error archiving project:");
                }
            }
        })
    }


    const overdue = (project) => {
        if (!project.endDate) return false;
        return new Date(project.endDate) < new Date();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed":
                return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
            case "In Progress":
                return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
            case "Pending":
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400";
            case "Overdue":
                return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400";
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "High":
                return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
            case "Medium":
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400";
            case "Low":
                return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
            default:
                return "bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400";
        }
    };

    const filteredProjects = projectMgnts.filter((project) => {
        const search = searchText.toLowerCase();
        const matchesSearch =
            project.title?.toLowerCase().includes(search) ||
            project.departments?.some((d) => d.name?.toLowerCase().includes(search));
        const matchesStatus =
            filterStatus === "All" ||
            project.status?.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    //dropdown for the managers and departments
    function Dropdown({ items, defaultLabel }) {
        const [open, setOpen] = useState(false);
        const toggle = () => setOpen(!open);

        return (
            <div className="relative w-full flex flex-col">
                <button
                    onClick={toggle}
                    className="inline-flex justify-between rounded-md border py-1 px-2 border-gray-300 dark:border-[#3a3f50] shadow-sm text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-[#1e2233] hover:bg-gray-50 dark:hover:bg-[#2a3040] focus:outline-none"
                >
                    {defaultLabel}
                    <ChevronDown size={16} className="ml-2" />
                </button>

                {open && (
                    <div className="absolute z-10 mt-8 w-full bg-white dark:bg-[#1e2233]  border border-gray-200 dark:border-[#3a3f50] shadow-lg rounded-md max-h-60 overflow-auto">
                        {items.map((item) => (
                            <div
                                key={item.id || item.fullname || item.name}
                                className="cursor-pointer px-3 py-2 text-sm text-gray-700 w-full dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#252d3d] rounded-md"
                            >
                                {item.name || item.fullname}
                            </div>
                        ))}
                    </div>
                )}
            </div>)
    }

    if (querryerror) {
        toast.error("Something went wrong on the server. Try again.")
    }

    if (querryloading) {
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

    //handel view 
    function handleView(projectmgnt) {
        if (pm) {
            navigate(`/projectmanager/projectmgntdetails/${projectmgnt}`);
        } else if (manager) {
            navigate(`/manager/projectmgntdetails/${projectmgnt}`);
        }

    }

    return (
        <>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="bg-white border-2 dark:bg-[#222732] rounded-lg shadow dark:shadow-[0_2px_20px_rgba(0,0,0,0.5)] w-full h-full flex flex-col">
                {/*This is the add new program model*/}

                {openAddProgram && <AddNewProgram open={openAddProgram} setOpen={setOpenAddProgram} />}



                <div className="flex flex-col flex-1 gap-3">
                    <header className="flex flex-row justify-between py-4 px-4">
                        <div className="p-3  dark:text-green-400 text-blue-600 text-2xl font-extrabold rounded-4xl">| <span className="dark:text-white text-black">Project management</span></div>
                        <div className="flex justify-center items-center  pr-8">
                            {pm && <button
                                onClick={() => setOpenAddProgram(true)}
                                className="bg-[#03c01c] text-black cursor-pointer hover:scale-120 duration-200 px-4 p-2 rounded-lg flex gap-2"><Plus /> Project/mgnt</button>}
                        </div>
                    </header>
                    <div className="flex flex-col sm:flex-row gap-2 mx-4">
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search by title or department..."
                            className="flex-1 px-4 py-2 rounded-lg text-sm
        border border-gray-300 dark:border-[#2a3040]
        bg-white dark:bg-[#1a1f2b]
        text-gray-800 dark:text-slate-200
        placeholder-gray-400 dark:placeholder-slate-600
        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40
        transition-colors duration-150"
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 rounded-lg text-sm
        border border-gray-300 dark:border-[#2a3040]
        bg-white dark:bg-[#1a1f2b]
        text-gray-800 dark:text-slate-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40
        transition-colors duration-150 cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="not started">Not Started</option>
                            <option value="in progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    {/*Main */}
                    <main className="flex flex-col flex-1 min-h-0">
                        {/* ── Column Headers ── */}
                        <div className="hidden lg:grid lg:grid-cols-8 gap-4 px-6 py-3 
                                    bg-gray-50 dark:bg-[#1a1f2b]
                                    border-b border-gray-200 dark:border-[#2a3040]
                                    text-xs font-bold text-gray-600 dark:text-[#31f64b]/60 uppercase tracking-wider">
                            <div className="flex flex-col flex-1 items-start justify-center ">Title</div>
                            <div className="flex flex-col flex-1 items-start justify-center">Departments</div>
                            <div className="flex flex-col flex-1 items-start justify-center">Status</div>
                            <div className="flex flex-col flex-1 items-start justify-center">Priority</div>
                            <div className="flex flex-col flex-1 items-start justify-center">Managers</div>
                            <div className="flex flex-col flex-1 items-start justify-center">Start Date</div>
                            <div className="flex flex-col flex-1 items-start justify-center">End Date</div>
                            <div className="flex flex-col flex-1 items-start justify-center">Actions</div>
                        </div>

                        {/* ── Rows ── */}
                        <div className="divide-y divide-gray-200 dark:divide-[#2a3040] max-h-full overflow-hidde">
                            {filteredProjects === 0 ? (
                                <div className="px-6 py-8 text-center  text-gray-500 dark:text-slate-500">
                                    No projects found
                                </div>
                            ) : (
                                filteredProjects.map((project) => (
                                    <div
                                        key={project._id}
                                        className={`transition-colors p-4 lg:px-6 lg:py-4 border
          hover:bg-gray-50 dark:hover:bg-[#252d3d]
          ${overdue(project) ? "border-red-500 border-2 dark:border-red-500/60" : "border-transparent"}
        `}
                                    >
                                        <div className="lg:grid lg:grid-cols-8 lg:gap-4 lg:items-center space-y-3 lg:space-y-0">

                                            {/* Title */}
                                            <div className="flex flex-row items-start justify-between lg:justify-start lg:block">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-900 dark:text-slate-100 wrap-break-word">
                                                        {project?.title || "No project title"}
                                                    </div>
                                                    {overdue(project) && (
                                                        <span className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wide">
                                                            ⚠ Overdue
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Departments Dropdown */}
                                            <div className="relative text-sm text-gray-700 dark:text-slate-300">
                                                <span className="text-gray-500 dark:text-slate-500 lg:hidden">Department: </span>
                                                <Dropdown
                                                    items={project.departments || []}
                                                    defaultLabel={project.departments?.[0]?.name || "No department"}
                                                />
                                            </div>

                                            {/* Status — desktop */}
                                            <div className="hidden lg:block">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(
                                                    project.status
                                                        ? project.status.toLowerCase() === "completed"
                                                            ? "Completed"
                                                            : project.status.toLowerCase() === "in progress"
                                                                ? "In Progress"
                                                                : project.status.toLowerCase() === "not started"
                                                                    ? "Pending"
                                                                    : project.status
                                                        : ""
                                                )}`}>
                                                    {project.status || "No status"}
                                                </span>
                                            </div>

                                            {/* Priority — desktop */}
                                            <div className="hidden lg:block">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                                                    project.priority
                                                        ? project.priority.charAt(0).toUpperCase() + project.priority.slice(1)
                                                        : ""
                                                )}`}>
                                                    {project.priority || "No priority"}
                                                </span>
                                            </div>

                                            {/* Status + Priority — mobile */}
                                            <div className="flex gap-2 lg:hidden">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status || "")}`}>
                                                    {project.status || "No status"}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority || "")}`}>
                                                    {project.priority || "No priority"}
                                                </span>
                                            </div>

                                            {/* Managers Dropdown */}
                                            <div className="text-sm text-gray-700 w-full dark:text-slate-300">
                                                <span className="text-gray-500 dark:text-slate-500 lg:hidden">Manager: </span>
                                                <Dropdown
                                                    items={project.managers || []}
                                                    defaultLabel={project.managers?.[0]?.fullname || "No manager"}
                                                />
                                            </div>

                                            {/* Start Date — desktop */}
                                            <div className="hidden lg:block text-sm text-gray-700 dark:text-slate-400">
                                                {project?.startDate || "No start date"}
                                            </div>

                                            {/* End Date — desktop */}
                                            <div className="hidden lg:block text-sm text-gray-700 dark:text-slate-400">
                                                {project?.endDate || "No end date"}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-[#2a3040] lg:border-t-0 lg:pt-0 lg:gap-1">
                                                <button
                                                    onClick={() => handleView(project?._id)}
                                                    title="View"
                                                    className="flex-1 lg:flex-none cursor-pointer bg-blue-600 hover:bg-blue-700 dark:bg-blue-600/90 dark:hover:bg-blue-500 text-white py-2 lg:py-1.5 lg:px-1.5 rounded-md text-sm font-medium transition-all duration-150"
                                                >
                                                    <span className="lg:hidden">View</span>
                                                    <Eye size={18} className="hidden lg:inline" />
                                                </button>

                                                <button
                                                    title="Archive"
                                                    onClick={() => handleArchive(project?._id)}
                                                    className="flex-1 lg:flex-none cursor-pointer bg-gray-500 hover:bg-gray-600 text-white dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940] py-2 lg:py-1.5 lg:px-1.5 rounded-md text-sm font-medium transition-all duration-150"
                                                >
                                                    <span className="lg:hidden">Archive</span>
                                                    <Archive size={18} className="hidden lg:inline" />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(project?._id)}
                                                    title="Delete"
                                                    className="flex-1 lg:flex-none cursor-pointer bg-red-600 hover:bg-red-700 dark:bg-red-600/90 dark:hover:bg-red-500 text-white py-2 lg:py-1.5 lg:px-1.5 rounded-md text-sm font-medium transition-all duration-150"
                                                >
                                                    <span className="lg:hidden">Delete</span>
                                                    <Trash2 size={17} className="hidden lg:inline" />
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </main>

                </div>
            </motion.div>
        </>
    )
}
export default Projectmgnt;