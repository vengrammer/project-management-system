import { XCircle } from "lucide-react";
import { Fragment, useState, useMemo } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { GET_THE_PROJECTMGNT } from "./ProjectmgntDetails";

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



const UPDATE_PROJECTMGNT = gql`
  mutation Mutation($updateProjectMgntId: ID!, $addDepartments: [ID!], $addManagers: [ID!]) {
    updateProjectMgnt(id: $updateProjectMgntId, addDepartments: $addDepartments, addManagers: $addManagers) {
      message
      projectMgnt {
        _id
        title
      }
    }
  }
`;

function AddNewProjectMgntDepartment({ open = false, setOpen, refetchQueries }) {
  const [searchDept, setSearchDept] = useState("");
  const [checkDept, setCheckDept] = useState([]);
  const {id} = useParams();
  const projectMgntId = id;
  // Fetch all departments
  const { data: deptData } = useQuery(GET_ALL_DEPARTMENTS, {
    skip: !open,
  });

  // Fetch current project mgnt to compare
  const { data: projectData } = useQuery(GET_THE_PROJECTMGNT, {
    skip: !open || !projectMgntId,
    variables: { projectMgntId },
  });

  // Fetch managers for selected departments
  const { data: managersData } = useQuery(GET_THE_MANAGERS, {
    skip: checkDept.length === 0,
    variables: { managersWithDepartmentsId: checkDept },
  });

  const [updateProjectMgnt, { loading: updating }] = useMutation(UPDATE_PROJECTMGNT, {
    
        onCompleted: () => {
          toast.success("Departments and Managers added successfully!")
        },
        onError: (error) => {
          toast.error(`Failed to add`);
        },
        refetchQueries
          
  });   

  // IDs already in the project
  const projectDeptIds = useMemo(
    () => new Set((projectData?.projectMgnt?.departments ?? []).map((d) => d.id)),
    [projectData]
  );

  const projectManagerIds = useMemo(
    () => new Set((projectData?.projectMgnt?.managers ?? []).map((m) => m.id)),
    [projectData]
  );

  // Only departments NOT already in the project
  const availableDepartments = useMemo(
    () => (deptData?.departments ?? []).filter((d) => !projectDeptIds.has(d.id)),
    [deptData, projectDeptIds]
  );

  // Filter by search
  const filteredDepartment = useMemo(
    () =>
      availableDepartments.filter((d) =>
        d.name.toLowerCase().includes(searchDept.toLowerCase())
      ),
    [availableDepartments, searchDept]
  );

  // Only managers NOT already in the project
  const availableManagers = useMemo(
    () =>
      (managersData?.managersWithDepartments ?? []).filter(
        (m) => !projectManagerIds.has(m.id)
      ),
    [managersData, projectManagerIds]
  );

  const handleToggleDept = (id) => {
    setCheckDept((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (checkDept.length === 0) return;

    const managerIds = availableManagers.map((m) => m.id);

    try {
      const { data } = await updateProjectMgnt({
        variables: {
          updateProjectMgntId: projectMgntId,
          addDepartments: checkDept,
          addManagers: managerIds,
        }
      });
      console.log(data?.updateProjectMgnt?.message);
      setCheckDept([]);
      setSearchDept("");
      setOpen(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleClose = () => {
    setCheckDept([]);
    setSearchDept("");
    setOpen(false);
  };

  const labelCls = "block text-sm font-medium text-gray-700 dark:text-slate-300";
  const inputCls =
    "w-full rounded-lg border border-gray-300 dark:border-[#2a3040] bg-white dark:bg-[#1a2030] text-gray-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <Fragment>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white gap-2 dark:bg-[#222732] rounded-xl shadow-xl dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)] w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2a3040]">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                Add Department & Managers
              </h2>
              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#252d3d] rounded-lg transition-colors"
                onClick={handleClose}
              >
                <XCircle size={24} className="text-gray-500 dark:text-slate-400 cursor-pointer" />
              </button>
            </div>

            {/* Body */}
            <div className="flex h-full w-full min-h-0 overflow-auto flex-1 px-10 py-4">
              <div className="flex flex-col flex-1 lg:flex-row gap-10">

                {/* Departments Column */}
                <div className="flex h-64 lg:h-auto flex-col w-full gap-2 min-h-0">
                  <label className={labelCls}>
                    Available Departments
                    {checkDept.length > 0 && (
                      <span className="ml-2 text-xs text-blue-500 dark:text-[#02eb21] font-semibold">
                        ({checkDept.length} selected)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    className={inputCls}
                    onChange={(e) => setSearchDept(e.target.value)}
                    value={searchDept}
                    placeholder="Search department..."
                  />
                  <div className="dark:bg-[#3b404b] border-blue-500 border-2 rounded m-2 flex flex-col min-h-0 h-full overflow-auto">
                    {filteredDepartment.length > 0 ? (
                      filteredDepartment.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleDept(item.id)}
                          className="flex h-12 dark:bg-[#545859] dark:hover:bg-[#079aab] bg-gray-200 hover:bg-gray-300 cursor-pointer border-gray-300 gap-2 px-4 border-b-2 items-center"
                        >
                          <input
                            type="checkbox"
                            id={`check-${item.id}`}
                            checked={checkDept.includes(item.id)}
                            onChange={() => handleToggleDept(item.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 cursor-pointer"
                          />
                          <label
                            htmlFor={`check-${item.id}`}
                            className="flex justify-center items-center cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 flex w-full items-center justify-center py-5 text-sm">
                        {availableDepartments.length === 0
                          ? "All departments already added"
                          : "No departments found"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Managers Column */}
                <div className="flex h-64 lg:h-auto flex-col w-full gap-2 min-h-0">
                  <label className={labelCls}>
                    Available Managers
                    {availableManagers.length > 0 && (
                      <span className="ml-2 text-xs text-blue-500 dark:text-[#02eb21] font-semibold">
                        ({availableManagers.length} will be added)
                      </span>
                    )}
                  </label>
                  <div className="dark:bg-[#3b404b] border-blue-500 border-2 rounded m-2 flex flex-col min-h-0 h-full overflow-auto mt-[2.15rem]">
                    {availableManagers.length > 0 ? (
                      availableManagers.map((item) => (
                        <div
                          key={item.id}
                          className="flex h-12 dark:bg-[#545859] dark:hover:bg-[#079aab] bg-gray-200 hover:bg-gray-300 cursor-pointer border-gray-300 gap-2 px-4 border-b-2 items-center"
                        >
                          <label className="flex justify-center items-center gap-2">
                            {item.fullname}{" "}
                            <span className="dark:text-[#00fc22] text-green-600 text-sm">
                              ({item.position})
                            </span>
                          </label>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 flex w-full items-center justify-center py-5 text-sm">
                        {checkDept.length === 0
                          ? "Select a department first"
                          : "No new managers available"}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Button */}
            <div className="flex gap-3 px-10 rounded-b-xl my-5">
              <button
                onClick={handleSubmit}
                disabled={checkDept.length === 0 || updating}
                className="bg-[#0362f0] text-white hover:scale-110 duration-200 dark:bg-[#02eb21] py-1 font-bold dark:text-black px-6 rounded-xl border-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {updating ? "Adding..." : "Add to Project"}
              </button>
              <button
                onClick={handleClose}
                className="py-1 font-bold px-6 rounded-xl border-2 border-gray-400 text-gray-600 dark:text-slate-300 hover:scale-110 duration-200"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </Fragment>
  );
}

export default AddNewProjectMgntDepartment;