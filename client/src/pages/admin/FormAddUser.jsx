import { useId, useState } from "react";
import { Eye, EyeOff, Plus, Variable } from "lucide-react";
import logo from "@/assets/logo.png";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";

const GET_DEPARTMENTS = gql`
  query Query {
    departments {
      id
      name
    }
  }
`;
const GET_USERS = gql`
  query Users {
    users {
      id
      fullname
      role
      position
      email
      status
      department {
        name
      }
    }
  }
`;
const INSERT_USER = gql`
  mutation CreateUser(
    $fullname: String!
    $email: String!
    $password: String!
    $position: String!
    $username: String!
    $status: Boolean!
    $department: ID!
    $role: String
  ) {
    createUser(
      fullname: $fullname
      email: $email
      password: $password
      position: $position
      username: $username
      status: $status
      department: $department
      role: $role
    ) {
      message
      user {
        id
        fullname
      }
    }
  }
`;

export default function FormAddUser() {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    department: "",
    role: "",
    position: "",
    email: "",
    username: "",
    password: "",
    status: true,
  });

  const id = useId();

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const {
    loading: loadingDepartment,
    error: errorDepartment,
    data: dataDepartment,
  } = useQuery(GET_DEPARTMENTS);

  const [createUser, { loading: loadingCreateUser }] = useMutation(
    INSERT_USER,
    {
      onCompleted: () => {
        toast.success("Successfully created account!");
        setOpen(false);
        // Reset form
        setFormData({
          fullname: "",
          department: "",
          role: "",
          position: "",
          email: "",
          username: "",
          password: "",
          status: true,
        });
      },
      onError: (error) => {
        toast.error(`Error in creating account: ${error.message}`);
      },
      refetchQueries: [{ query: GET_USERS }],
    },
  );

  if (loadingDepartment || loadingCreateUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }
  if (errorDepartment) {
    toast.error("Error in returning department");
  }

  console.log(dataDepartment.departments);

  const handleAddUser = (e) => {
    e.preventDefault();
    createUser({
      variables: {
        fullname: formData.fullname,
        department: formData.department,
        role: formData.role,
        position: formData.position,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        status: formData.status,
      },
    });
  };
  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
      >
        <Plus size={16} />
        Add New User
      </button>

      {/* Modal Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            {/* Header */}
            <div className="flex justify-center mb-4">
              <img src={logo} alt="logo" className="h-10 w-auto" />
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800">
              Add New User
            </h2>
            <p className="text-sm text-center text-gray-500 mb-6">
              Welcome to the Project Management System. Enter your credentials
              to create an account.
            </p>

            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
              {/* Row 1: Fullname + Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`${id}-fullname`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Fullname
                  </label>
                  <input
                    id={`${id}-fullname`}
                    type="text"
                    placeholder="Enter full name"
                    value={formData.fullname}
                    onChange={(e) =>
                      handleInputChange("fullname", e.target.value)
                    }
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`${id}-category`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Position
                  </label>
                  <input
                    id={`${id}-category`}
                    type="text"
                    placeholder="Eg: Network engineer"
                    value={formData.position}
                    onChange={(e) =>
                      handleInputChange("position", e.target.value)
                    }
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: Department + Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`${id}-department`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Department *
                  </label>
                  <select
                    id={`${id}-department`}
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    required
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="" disabled>
                      Select department
                    </option>

                    {dataDepartment?.departments?.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`${id}-role`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Role *
                  </label>
                  <select
                    id={`${id}-role`}
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    required
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="" disabled>
                      Select role
                    </option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">Employee</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Email + Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`${id}-email`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <input
                    id={`${id}-email`}
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`${id}-username`}
                    className="text-sm font-medium text-gray-700"
                  >
                    Username
                  </label>
                  <input
                    id={`${id}-username`}
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 4: Password (full width) */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`${id}-password`}
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id={`${id}-password`}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 mt-2"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}