import { motion } from "framer-motion";
import { Archive, Eye, Trash2, CalendarArrowUp, CalendarArrowDown, Plus } from "lucide-react";
import { useState } from "react";
import AddNewProgram from "./AddNewProgram";

function Projectmgnt() {
    const [openAddProgram, setOpenAddProgram] = useState(false)

    const projects = [
        {
            id: 1,
            title: "Website Redesign",
            department: { name: "IT Department" },
            status: "In Progress",
            priority: "High",
            projectManager: { fullname: "Juan Dela Cruz" },

            startDate: "2026-01-10",
            endDate: "2026-04-15",
        },
        {
            id: 2,
            title: "Mobile App Development",
            department: { name: "Software Team" },
            status: "Pending",
            priority: "Medium",
            projectManager: { fullname: "Maria Santos" },

            startDate: "2026-02-01",
            endDate: "2026-06-30",
        },
        {
            id: 3,
            title: "Marketing Campaign",
            department: { name: "Marketing" },
            status: "Completed",
            priority: "Low",
            projectManager: { fullname: "Carlos Reyes" },

            startDate: "2025-11-01",
            endDate: "2026-01-15",
        },
        {
            id: 4,
            title: "Inventory System",
            department: { name: "Operations" },
            status: "In Progress",
            priority: "High",
            projectManager: { fullname: "Ana Lopez" },

            startDate: "2026-03-01",
            endDate: "2026-07-20",
        },
        {
            id: 5,
            title: "",
            department: null,
            status: "",
            priority: "",
            projectManager: null,

            startDate: "2026-02-15",
            endDate: "2026-03-10",
        },
        {
            id: 6,
            title: "CRM Implementation",
            department: { name: "Business Development" },
            status: "Overdue",
            priority: "High",
            projectManager: { fullname: "Luis Garcia" },

            startDate: "2025-12-01",
            endDate: "2026-02-28",
        },
    ];
    const currentProjects = projects;
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

    return (
        <>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="bg-white border-2 dark:bg-[#222732] rounded-lg shadow dark:shadow-[0_2px_20px_rgba(0,0,0,0.5)] w-full h-full flex flex-col">
                    {/*This is the add new program model*/}
                <AddNewProgram open={openAddProgram} setOpen={setOpenAddProgram}/>

                <div className="flex flex-col flex-1 gap-3">
                    <header className="flex flex-row justify-between py-4 px-4">
                        <div className="p-3  dark:text-green-400 text-blue-600 text-2xl font-extrabold rounded-4xl">| <span className="dark:text-white text-black">Project management</span></div>
                        <div className="flex justify-center items-center  pr-8">
                            <button
                            onClick={() => setOpenAddProgram(true)}
                             className="bg-[#03c01c] text-white cursor-pointer hover:scale-120 duration-200 px-4 p-2 rounded-lg flex gap-2"><Plus/> Project/mgnt</button>
                        </div>
                    </header>
                    <div className="flex mx-4">
                        <input
                            type="text"
                            placeholder="Search by title or department..."
                            className="w-full px-4 py-2 rounded-lg text-sm
                            border border-gray-300 dark:border-[#2a3040]
                            bg-white dark:bg-[#1a1f2b]
                            text-gray-800 dark:text-slate-200
                            placeholder-gray-400 dark:placeholder-slate-600
                            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40
                            transition-colors duration-150"
                        />
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
                            <div className="flex flex-col flex-1 items-start justify-center">Project Managers</div>
                            <div className="flex flex-col flex-1 items-start justify-center">Start Date</div>
                            <div className="flex flex-col flex-1 items-start justify-center">End Date</div>
                            <div className="flex flex-col flex-1 items-start justify-center">Actions</div>
                        </div>
                        {/* ── Rows ── */}
                        <div className="divide-y divide-gray-200 dark:divide-[#2a3040] max-h-full overflow-auto">
                            {projects.length === 0 ? (
                                <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-500">
                                    No projects found
                                </div>
                            ) : currentProjects.length === 0 ? (
                                <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-500">
                                    No results for "{searchTerm}"
                                </div>
                            ) : (
                                currentProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className={`transition-colors p-4 lg:px-6 lg:py-4 border
                  hover:bg-gray-50 dark:hover:bg-[#252d3d]
                  ${overdue(project)
                                                ? "border-red-500 border-2 dark:border-red-500/60"
                                                : "border-transparent"
                                            }`}
                                    >
                                        <div className="lg:grid lg:grid-cols-8 lg:gap-4 lg:items-center space-y-3 lg:space-y-0">

                                            {/* Title */}
                                            <div className="flex flex-row items-start justify-between lg:justify-start lg:block">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-900 dark:text-slate-100 wrap-break-word">
                                                        {project.title ? project.title : "No project title"}
                                                    </div>
                                                    {overdue(project) && (
                                                        <span className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wide">
                                                            ⚠ Overdue
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Department */}
                                            <div className="text-sm text-gray-700 dark:text-slate-300 lg:block">
                                                <span className="text-gray-500 dark:text-slate-500 lg:hidden">Department: </span>
                                                <span className="font-medium lg:font-normal">
                                                    {project.department?.name ? project.department?.name : "No department"}
                                                </span>
                                            </div>

                                            {/* Status — desktop */}
                                            <div className="hidden lg:block">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(project.status)}`}>
                                                    {project.status ? project.status : "No status"}
                                                </span>
                                            </div>

                                            {/* Priority — desktop */}
                                            <div className="hidden lg:block">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                                                    {project.priority ? project.priority : "No Priority"}
                                                </span>
                                            </div>

                                            {/* Status + Priority — mobile */}
                                            <div className="flex gap-2 lg:hidden">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                                                    {project.status}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                                                    {project.priority || "No priority"}
                                                </span>
                                            </div>

                                            {/* PM */}
                                            <div className="text-sm text-gray-700 dark:text-slate-300">
                                                <span className="text-gray-500 dark:text-slate-500 lg:hidden">PM: </span>
                                                <span className="font-medium lg:font-normal">
                                                    {project?.projectManager?.fullname ? project?.projectManager.fullname : "No PM"}
                                                </span>
                                            </div>



                                            {/* Dates — mobile */}
                                            <div className="flex gap-4 text-sm lg:hidden">
                                                <div className="flex items-center gap-1">
                                                    <CalendarArrowUp size={15} className="text-gray-500 dark:text-slate-500" />
                                                    <span className="text-gray-900 dark:text-slate-300 font-medium">{project.startDate}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <CalendarArrowDown size={15} className="text-gray-500 dark:text-slate-500" />
                                                    <span className="text-gray-900 dark:text-slate-300 font-medium">{project.endDate}</span>
                                                </div>
                                            </div>

                                            {/* Start Date — desktop */}
                                            <div className="hidden lg:block text-sm text-gray-700 dark:text-slate-400">
                                                {project.startDate}
                                            </div>

                                            {/* End Date — desktop */}
                                            <div className="hidden lg:block text-sm text-gray-700 dark:text-slate-400">
                                                {project.endDate}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-[#2a3040] lg:border-t-0 lg:pt-0 lg:gap-1">

                                                {/* View */}
                                                <button
                                                    onClick={() => handleView(project)}
                                                    title="View"
                                                    className="flex-1 lg:flex-none cursor-pointer
                        bg-blue-600 hover:bg-blue-700
                        dark:bg-blue-600/90 dark:hover:bg-blue-500
                        dark:hover:shadow-[0_0_8px_rgba(59,130,246,0.4)]
                        text-white py-2 lg:py-1.5 lg:px-1.5 rounded-md
                        text-sm font-medium transition-all duration-150"
                                                >
                                                    <span className="lg:hidden">View</span>
                                                    <Eye size={18} className="hidden lg:inline" />
                                                </button>

                                                {/* Archive — green in dark mode */}
                                                <button
                                                    title="Archive"
                                                    onClick={() => handleArchive(project.id)}
                                                    className="flex-1 lg:flex-none cursor-pointer
                        bg-gray-500 hover:bg-gray-600 text-white
                        dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
                        dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]
                        py-2 lg:py-1.5 lg:px-1.5 rounded-md
                        text-sm font-medium transition-all duration-150"
                                                >
                                                    <span className="lg:hidden">Archive</span>
                                                    <Archive size={18} className="hidden lg:inline" />
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    title="Delete"
                                                    className="flex-1 lg:flex-none cursor-pointer
                        bg-red-600 hover:bg-red-700
                        dark:bg-red-600/90 dark:hover:bg-red-500
                        dark:hover:shadow-[0_0_8px_rgba(239,68,68,0.35)]
                        text-white py-2 lg:py-1.5 lg:px-1.5 rounded-md
                        text-sm font-medium transition-all duration-150"
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