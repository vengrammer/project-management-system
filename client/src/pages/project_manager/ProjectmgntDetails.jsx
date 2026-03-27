import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader,
  Pen,
  Plus,
  Target,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from "react-router-dom";

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
      }
    }
  }
`;

function ProjectmgntDetails() {
  const { id } = useParams();

  const { data: dataProjectMgnt, loading: loadingProjectMgnt } = useQuery(
    GET_THE_PROJECTMGNT,
    {
      variables: { projectMgntId: id },
    },
  );
  const projectmgnt = dataProjectMgnt?.projectMgnt || null;

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

  if (loadingProjectMgnt) {
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
    <div className="h-screen flex flex-col w-flow sm:overflow-hidden overflow-auto bg-gray-200 dark:bg-[#181d28] p-3 lg:px-10 lg:py-5">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="flex flex-col  h-full min-h-0 "
      >
        <div
          key={projectmgnt?.id}
          className="flex flex-col flex-1 w-full h-full"
        >
          <button className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-[#31f64b] mb-6 transition-colors duration-150">
            <ArrowLeft size={20} />
            <span>Back to Projects</span>
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
                      key={item._id}
                      className=" bg-[rgb(29,122,1)] px-5 flex items-center justify-center  rounded-2xl "
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <User size={16} />
                    M:{" "}
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
                <div className="flex lg:justify-end gap-3">
                  <button
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
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 text-sm font-semibold text-white
                      ${
                        projectmgnt?.status === "completed"
                          ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500/90 dark:hover:bg-amber-500"
                          : "bg-green-600 hover:bg-green-700 dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940] dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]"
                      }`}
                      >
                        {projectmgnt?.status}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* for the progress*/}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Overall Progress
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-slate-100">
                  100%
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-[#2a3040] rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-blue-600 dark:from-[#31f64b] dark:to-[#28d940] transition-all duration-500"
                  style={{
                    width: `50%`,
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
                  {projectmgnt?.projects?.length || 0}
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
                  0
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
                  0
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
                  0
                </p>
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  Completed
                </p>
              </div>
            </div>
          </header>
        </div>
        <main className="flex flex-col rounded-lg shadow-sm  p-2 sm:p-0 h-full">
          <div className="flex flex-col md:flex-row gap-5 w-full h-full overflow-auto">
            <div
              className="flex-1 min-h-0 bg-white dark:bg-[#222732] rounded-lg shadow-sm flex flex-col"
            >
           
                <header className="flex justify-between w-full min-w-0 p-4 rounded-t-xl border-b-2 ">
                  <div className="flex flex-col gap-1">
                    <h1 className="font-bold text-xl">Projects</h1>
                    <p className="text-gray-400 text-sm">2 total projects</p>
                  </div>
                  <div>
                    <div className="flex gap-3 flex-wrap">
                      <div className="">
                        <button
                          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 text-sm font-semibold text-white
                           bg-green-600 hover:bg-green-700 dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940] dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]
                      "
                        >
                          <Plus/> Add Project
                        </button>
                      </div>
                    </div>
                  </div>
                </header>
                <main className="bg-amber-400 flex flex-col h-full min-h-0 w-full">
                  
                </main>
            </div>
            <div
              className="flex-1 min-h-100 bg-white max-w-150  dark:bg-[#222732] rounded-lg shadow-sm 
                    max-h-80 md:max-h-none"
            ></div>
          </div>
        </main>
      </motion.div>
    </div>
  );
}
export default ProjectmgntDetails;
