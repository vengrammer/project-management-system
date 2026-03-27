import { Loader, X } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { GET_THE_PROJECTMGNT } from "./Projectmgnt";

const GET_ALL_DEPARTMENTS = gql`
  query Departments {
    departments {
      id
      name
    }
  }
`;

const GET_THE_MANAGERS = gql`
  query ManagersWithDepartments($managersWithDepartmentsId: [ID!]) {
    managersWithDepartments(ids: $managersWithDepartmentsId) {
      id
      fullname
      position
    }
  }
`;

const CREATE_PROJECTMGNT = gql`
  mutation Mutation(
    $title: String!
    $pm: ID!
    $priority: String
    $departments: [ID]
    $managers: [ID]
    $projects: [ID]
    $startDate: String
    $endDate: String
  ) {
    createProjectMgnt(
      title: $title
      pm: $pm
      priority: $priority
      departments: $departments
      managers: $managers
      projects: $projects
      startDate: $startDate
      endDate: $endDate
    ) {
      message
      projectMgnt {
        _id
        title
      }
    }
  }
`;

function AddNewProgram({ open, setOpen}) {
  const auth = useSelector((state) => state.auth);
  const pmId = auth.user?.id;

  //data to insert
  const [checkDept, setCheckDept] = useState([]);
  const [allManagers, setAllManagers] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [title, setTitle] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("");
  const [searchDept, setSearchDept] = useState("");

  //create new projectmgnt
  const [createProjectMgnt, { loading: loadingProjectMgnt }] = useMutation(
    CREATE_PROJECTMGNT,
    {
      onCompleted: () => {
        toast.success("Project management created successfully!");
        setTitle("");
        setStartDate("");
        setEndDate("");
        setPriority("");
        setCheckDept([]);
        setAllManagers([]);
        setOpen(false);
      },
      onError: () => {
        toast.error("Failed to add member");
      },
      awaitRefetchQueries: true,
      refetchQueries: [{ query: GET_THE_PROJECTMGNT }]
    },
  );

  const handleAddProjectmgnt = (e) => {
    e.preventDefault();
    const managersSelected = allManagers?.map((item) => {return item.id})
    createProjectMgnt({
      variables: {
        title: title,
        pm: pmId || null,
        priority: priority,
        departments: checkDept,
        managers: managersSelected,
        startDate: startDate,
        endDate: endDate,
      },
    });
  };

  // departments
  const { data: dataDeft, loading: loadingDept } = useQuery(
    GET_ALL_DEPARTMENTS,
    {
      fetchPolicy: "cache-first",
    },
  );
  const departments = dataDeft?.departments || [];

  // console.log(departments )

  const filteredDepartment = departments.filter((department) => {
    if (!searchDept) return true;
    return department.name?.toLowerCase().includes(searchDept.toLowerCase());
  });

  // Fetch managers based on selected departments
  const { data: dataManager, refetch } = useQuery(GET_THE_MANAGERS, {
    variables: { managersWithDepartmentsId: checkDept },
    skip: checkDept.length === 0,
  });

  // Update allManagers whenever dataManager changes
  useEffect(() => {
    function callMe() {
      if (dataManager?.managersWithDepartments) {
        setAllManagers(dataManager.managersWithDepartments);
      } else {
        setAllManagers([]);
      }
    }
    callMe();
  }, [dataManager]);

  const handleToggleDept = (id) => {
    setCheckDept((prev) => {
      const newCheck = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      refetch({ managersWithDepartmentsId: newCheck });
      return newCheck;
    });
  };
  if (!open) return null;

  // Shared input class
  const inputCls =
    "w-full px-3 py-2 rounded-lg text-sm transition-all " +
    "border border-gray-300 dark:border-[#2a3040] " +
    "bg-white dark:bg-[#1a1f2b] " +
    "text-gray-800 dark:text-slate-200 " +
    "placeholder-gray-400 dark:placeholder-slate-600 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40 " +
    "disabled:opacity-50 disabled:cursor-not-allowed ";

  const sectionHeading =
    "text-sm font-semibold text-gray-700 dark:text-[#31f64b]/70 border-b border-gray-200 dark:border-[#2a3040] pb-2";
  const labelCls =
    "block text-sm font-medium text-gray-700 dark:text-slate-300";

  //all the loading
  if (loadingDept || loadingProjectMgnt) {
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
    <>
      {open && (
        <div className="fixed h-screen   inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleAddProjectmgnt} className=" bg-white dark:bg-[#222732] flex flex-1 flex-col max-w-280 rounded-xl h-full overflow-auto">
            {/* ── Modal Header ── */}
            <div className="flex flex-col items-center pt-2 px-2 pb-1 border-b-2 border-gray-200 dark:border-[#2a3040]">
              <div className="w-full flex justify-end">
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-800 dark:text-slate-300 pr-2 cursor-pointer hover:text-gray-300 dark:hover:text-slate-200 transition-colors"
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
                  Create Program
                </h2>
              </div>
              <p className="text-center text-sm text-gray-500 dark:text-slate-500 mt-1">
                Please fill in the information below to create a new program.
              </p>
            </div>
            <main className="flex flex-1 flex-col px-5 min-h-0 h-full  overflow-auto">
              <div className="space-y-4 py-4   ">
                <h3 className={sectionHeading}>Basic Information </h3>
              </div>
              <div className="space-y-4 px-6">
                <p className={labelCls}>
                  title{" "}
                  <span className="text-red-600 text-xl font-bold">*</span>
                </p>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  placeholder="enter program title...."
                  className={inputCls}
                  required
                />
              </div>

              {/* Timeline  and status*/}
              <div className="space-y-4 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className={labelCls}>
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={inputCls}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelCls}>
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      disabled={!startDate}
                      min={startDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className={inputCls}
                    />
                  </div>
                  {/* Priority */}
                  <div className="space-y-2">
                    <label className={labelCls}>
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className={inputCls + " appearance-none"}
                    >
                      <option value="">Select priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className=" flex  h-full w-full min-h-0 overflow-auto   flex-1 px-10">
                <div className="flex flex-col flex-1 lg:flex-row gap-20">
                  {/*Departments*/}
                  <div className="flex h-full flex-col w-full gap-2 min-h-0">
                    <label className={labelCls}>Departments</label>
                    <input
                      type="text"
                      className={inputCls}
                      onChange={(e) => setSearchDept(e.target.value)}
                      value={searchDept}
                      placeholder="search department..."
                    />

                    <div className="dark:bg-[#3b404b] border-blue-500 border-2 focus:dark:border-green-600 rounded m-2 flex flex-col min-h-0 h-full overflow-auto">
                      {filteredDepartment.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleDept(item.id)}
                          className="flex h-12 dark:bg-[#545859] dark:hover:bg-[#079aab] bg-gray-200 hover:bg-gray-300 cursor-pointer border-gray-300 gap-2 px-4 border-b-2 "
                        >
                          <input
                            type="checkbox"
                            id={`check-${item.id}`}
                            checked={checkDept.includes(item.id)}
                            onChange={() => handleToggleDept(item.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 cursor-pointer"
                          />{" "}
                          <label
                            htmlFor={`check-${item.id}`}
                            className="flex justify-center items-center cursor-pointer "
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/*Managers*/}
                  <div className="flex h-full flex-col w-full gap-2 min-h-0">
                    <label className={labelCls}>Managers Selected</label>
                    {/* <input type="text" className={inputCls} placeholder="search managers..." /> */}
                    <div className="dark:bg-[#3b404b] border-blue-500 border-2 focus:dark:border-green-600 rounded m-2 flex flex-col min-h-0 h-full overflow-auto">
                      {allManagers.length > 0 ? (
                        allManagers.map((item) => (
                          <div
                            key={item.id}
                            className="flex h-12 dark:bg-[#545859] dark:hover:bg-[#079aab] bg-gray-200 hover:bg-gray-300 cursor-pointer border-gray-300 gap-2 px-4 border-b-2"
                          >
                            <label
                              htmlFor="check"
                              className="flex justify-center items-center gap-2"
                            >
                              {item.fullname}{" "}
                              <span className="dark:text-[#00fc22]">
                                ({item.position})
                              </span>
                            </label>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400 flex  w-full items-center justify-center py-5">
                          no selected department
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </main>
            <footer className="flex w-full justify-end items-center border-t-2 ">
              <div className="flex gap-3 px-10 rounded-b-xl my-5">
                <button className="bg-[#0362f0] text-white  hover:scale-110 duration-200 dark:bg-[#02eb21] py-1 font-bold dark:text-black px-6 rounded-xl border-2">
                  Create Program
                </button>
              </div>
            </footer>
          </form>
        </div>
      )}
    </>
  );
}

export default AddNewProgram;
