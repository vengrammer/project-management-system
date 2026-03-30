import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { Loader, Plus, XCircle } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

//query to get the departments
const GET_DEPARTMENTS = gql`
  query Departments {
    departments {
      id
      name
      users {
        id
        fullname
        position
        role
      }
    }
  }
`;
const GET_PROJECTS = gql`
  query Project($projectId: ID!) {
    project(id: $projectId) {
      title
      client
      budget
      description
      priority
      startDate
      status
      endDate
      id
      department {
        id
        name
      }
      projectManager {
        id
        fullname
      }
      users {
        id
        fullname
        position
      }
    }
  }
`;

// query to get the current project details
const GET_PROJECT = gql`
  query Project($projectId: ID!) {
    project(id: $projectId) {
      id
      department {
        id
        name
      }
      users {
        id
        role
      }
    }
  }
`;

const ADD_MEMBER = gql`
  mutation Mutation($id: ID!, $addUsers: [ID]) {
    updateProject(id: $id, addUsers: $addUsers) {
      message
    }
  }
`;

// Shared input class — mirrors FormAddUser
const inputCls =
  "w-full px-3 py-2 rounded-md text-sm transition-all " +
  "border border-gray-300 dark:border-[#2a3040] " +
  "bg-white dark:bg-[#1a1f2b] " +
  "text-gray-800 dark:text-slate-200 " +
  "placeholder-gray-400 dark:placeholder-slate-600 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40";

const labelCls = "block text-sm font-medium text-gray-700 dark:text-slate-300";

function AddMembersForm() {
  const { id } = useParams();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  ///query to get the department
  const {
    loading: loadindDepartments,
    error: errorDepartments,
    data: dataDepartments,
  } = useQuery(GET_DEPARTMENTS);

  // query to get current project details (to get existing users)
  const {
    loading: loadingProject,
    error: errorProject,
    data: projectData,
  } = useQuery(GET_PROJECT, { variables: { projectId: id } });

  //query to insert/ user
  const [updateProject, { loading: loadingAddMember }] = useMutation(
    ADD_MEMBER,
    {
      onCompleted: () => {
        toast.success("Member add successfully!");
        setSelectedEmployees([]);
      },
      onError: () => {
        toast.error("Failed to add member");
      },
      refetchQueries: [
        { query: GET_PROJECTS, variables: { projectId: id } },
        { query: GET_PROJECT, variables: { projectId: id } },
      ],
      awaitRefetchQueries: true,
    },
  );

  const [formData, setFormData] = useState({
    department: "",
  });

  useEffect(() => {
    if (projectData?.project?.department?.id) {
      setFormData({ department: projectData.project.department.id });
    }
  }, [projectData]);

  const selectedDept = dataDepartments?.departments?.find(
    (d) => d.id === formData.department,
  );

  const teamUsers = selectedDept?.users || [];
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [teamMemberSearch, setTeamMemberSearch] = useState("");

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (selectedEmployees.length === 0) {
      toast.error("Please select member");
      return;
    }
    setIsAddMemberOpen(false);
    updateProject({
      variables: {
        id: id,
        addUsers: selectedEmployees,
      },
    });
  };

  // Get existing user IDs from the project
  const existingUserIds = new Set(
    projectData?.project?.users?.map((user) => user.id) || [],
  );

  const filteredTeamMembers = teamUsers.filter(
    (emp) =>
      emp.role === "user" && // show only users
      !existingUserIds.has(emp.id) && // exclude already added
      (emp.fullname || "")
        .toLowerCase()
        .includes((teamMemberSearch || "").toLowerCase()),
  );

  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id],
    );
  };

  //show the error and loading
  if (errorDepartments) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Failed to load projects</div>
      </div>
    );
  }

  if (loadingProject || loadingAddMember || loadindDepartments) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center dark:bg-zinc-950">
        <Loader size={50} className="animate-spin text-violet-400" />
      </div>
    );
  }
  if (errorProject) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Failed to load Project</div>
      </div>
    );
  }

  return (
    <>
      {/* Button to open modal */}
      <button
        onClick={() => setIsAddMemberOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-150
          bg-blue-600 hover:bg-blue-700 text-white
          dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
          dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]"
      >
        <Plus size={16} />
        Member
      </button>

      {/* Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#222732] rounded-xl shadow-xl dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2a3040]">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                Add New Member
              </h2>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#252d3d] rounded-lg transition-colors"
              >
                <XCircle size={24} className="text-gray-500 dark:text-slate-400 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-4">

                  {/* Department (Fixed to Project's Department) */}
                  <div className="space-y-2">
                    <label className={labelCls}>
                      Department
                    </label>
                    <input
                      type="text"
                      value={projectData?.project?.department?.name || "No Department"}
                      disabled
                      className={inputCls + " bg-gray-100 dark:bg-gray-700 cursor-not-allowed"}
                    />
                  </div>

                  {/* Team Members */}
                  <div className="space-y-2">
                    <label className={labelCls}>
                      Team Members
                    </label>
                    <input
                      type="text"
                      placeholder="Search team members..."
                      value={teamMemberSearch}
                      onChange={(e) => setTeamMemberSearch(e.target.value)}
                      className={inputCls + " mb-2"}
                    />
                    <div className="w-full bg-gray-50 dark:bg-[#1a1f2b] max-h-48 overflow-auto rounded-lg border border-gray-300 dark:border-[#2a3040] py-3 px-4">
                      {filteredTeamMembers.length > 0 ? (
                        filteredTeamMembers.map((emp) => (
                          <label
                            key={emp.id}
                            className="flex items-center justify-between gap-3 py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-[#252d3d] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedEmployees?.includes(emp.id)}
                                onChange={() => toggleEmployee(emp.id)}
                                className="w-4 h-4 accent-blue-600 dark:accent-[#31f64b] cursor-pointer"
                              />
                              <div className="text-sm">
                                <div className="font-medium text-gray-800 dark:text-slate-200">
                                  {emp.fullname}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-slate-500">
                                  {emp.position}
                                </div>
                              </div>
                            </div>
                          </label>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-slate-500 text-center py-2">
                          No team members found
                        </div>
                      )}
                    </div>
                    {selectedEmployees?.length > 0 && (
                      <p className="text-xs text-gray-500 dark:text-slate-500">
                        {selectedEmployees.length} member(s) selected
                      </p>
                    )}
                  </div>

                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-[#2a3040]">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-6 py-2 cursor-pointer border border-gray-300 dark:border-[#2a3040] rounded-lg
                    text-gray-700 dark:text-slate-300
                    hover:bg-gray-100 dark:hover:bg-[#252d3d]
                    transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 cursor-pointer rounded-lg text-sm font-semibold transition-all duration-150
                    bg-blue-600 hover:bg-blue-700 text-white
                    dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
                    dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]"
                >
                  <Plus size={20} />
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AddMembersForm;
