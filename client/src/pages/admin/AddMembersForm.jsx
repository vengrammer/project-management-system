import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { Plus, XCircle } from "lucide-react";
import { useRef, useState } from "react";
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
      users {
        id
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

function AddMembers() {
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

  const selectedDept = dataDepartments?.departments?.find(
    (d) => d.id === formData.department || d.name === formData.department,
  );

  const teamUsers = selectedDept?.users || [];

  /////
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const departmentRef = useRef(null);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [teamMemberSearch, setTeamMemberSearch] = useState("");

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //query

  const filteredDepartments = (dataDepartments?.departments || []).filter(
    (dept) =>
      (dept.name || "")
        .toLowerCase()
        .includes((departmentSearch || "").toLowerCase()),
  );

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

  // Filter team members: exclude existing users and match search
  const filteredTeamMembers = teamUsers.filter(
    (emp) =>
      !existingUserIds.has(emp.id) &&
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
  if (loadindDepartments) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }

  if (loadingAddMember) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }
  if (errorDepartments) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Failed to load projects</div>
      </div>
    );
  }

  if (loadingProject) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-xl"></span>
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
        className="px-2 py-2 bg-blue-600 text-white rounded-lg flex"
      >
        <Plus />
        Member
      </button>

      {/* Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Add New Member
              </h2>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={24} className="text-gray-500 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="space-y-2 relative" ref={departmentRef}>
                    <label className="block text-sm font-medium text-gray-700">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search department..."
                        value={departmentSearch}
                        onChange={(e) => {
                          const v = e.target.value;
                          setDepartmentSearch(v);
                          setShowDepartmentDropdown(true);
                        }}
                        onFocus={() => setShowDepartmentDropdown(true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {showDepartmentDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
                          {filteredDepartments.length > 0 ? (
                            filteredDepartments.map((dept) => (
                              <div
                                key={dept.id}
                                onClick={() => {
                                  // store department id for form submission, but keep name visible in the input
                                  handleInputChange("department", dept.id);
                                  setDepartmentSearch(dept.name);
                                  setShowDepartmentDropdown(false);
                                }}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                              >
                                {dept.name}
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No departments found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Team Members <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Search team members..."
                      value={teamMemberSearch}
                      onChange={(e) => setTeamMemberSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    />
                    <div className="w-full bg-gray-50 max-h-48 overflow-auto rounded-lg border border-gray-300 py-3 px-4">
                      {filteredTeamMembers.length > 0 ? (
                        filteredTeamMembers.map((emp) => (
                          <label
                            key={emp.id}
                            className="flex items-center justify-between gap-3 py-2 px-2 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedEmployees?.includes(emp.id)}
                                onChange={() => toggleEmployee(emp.id)}
                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                                required
                              />
                              <div className="text-sm">
                                <div className="font-medium text-gray-800">
                                  {emp.fullname}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {emp.position}
                                </div>
                              </div>
                            </div>
                          </label>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 text-center py-2">
                          No team members found
                        </div>
                      )}
                    </div>
                    {selectedEmployees?.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {selectedEmployees.length} member(s) selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-6 py-2 cursor-pointer border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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

export default AddMembers;
