import { useId, useState } from "react";
import { Eye, EyeOff, Plus, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";

const GET_DEPARTMENTS = gql`
  query Query {
    departments { id name }
  }
`;

const GET_USERS = gql`
  query Users {
    users {
      id fullname role position email status
      department { name }
    }
  }
`;

const INSERT_USER = gql`
  mutation CreateUser(
    $fullname: String! $email: String! $password: String!
    $position: String! $username: String! $status: Boolean!
    $department: ID! $role: String
  ) {
    createUser(
      fullname: $fullname email: $email password: $password
      position: $position username: $username status: $status
      department: $department role: $role
    ) {
      message
      user { id fullname }
    }
  }
`;

// Shared input / select class
const inputCls =
  "w-full px-3 py-2 rounded-md text-sm transition-all " +
  "border border-gray-300 dark:border-[#2a3040] " +
  "bg-white dark:bg-[#1a1f2b] " +
  "text-gray-800 dark:text-slate-200 " +
  "placeholder-gray-400 dark:placeholder-slate-600 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40";

const labelCls = "text-sm font-medium text-gray-700 dark:text-slate-300";

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

  const handleInputChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const {
    loading: loadingDepartment,
    error: errorDepartment,
    data: dataDepartment,
  } = useQuery(GET_DEPARTMENTS);

  const [createUser, { loading: loadingCreateUser }] = useMutation(INSERT_USER, {
    onCompleted: async () => {
      toast.success("Successfully created account!");
      setFormData({
        fullname: "", department: "", role: "", position: "",
        email: "", username: "", password: "", status: true,
      });
      setOpen(false);
    },
    onError: (error) => {
      toast.error(`Error in creating account: ${error.message}`);
    },
    refetchQueries: [{ query: GET_USERS }],
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    const regex = /^[a-zA-Z\s.'-]+$/;
    if (!regex.test(formData.fullname)) {
      toast.error("Fullname can only contain letters, spaces, dots, apostrophes, and hyphens");
      return;
    }
    if (formData.username.length < 5) {
      toast.error("Username must be at least 8 characters");
      return;
    }
    if (formData.password.length < 5) {
      toast.error("Password must be at least 8 characters");
      return;
    }
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

    const formatFullname = (name) =>
      name.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");

    const formattedFullname = formatFullname(formData.fullname);

    createUser({
      variables: {
        fullname: formattedFullname,
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
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-150
          bg-blue-600 hover:bg-blue-700 text-white
          dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
          dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]"
      >
        <Plus size={16} />
        Add New User
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#222732] rounded-xl shadow-xl dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)] w-full max-w-md max-h-[90vh] overflow-y-auto p-6">

            {/* Logo + close */}
            <div className="relative flex justify-center mb-4">
              <img src={logo} alt="logo" className="h-10 w-auto" />
              <button
                onClick={() => setOpen(false)}
                className="absolute p-2 right-0 hover:bg-gray-200 dark:hover:bg-[#252d3d] rounded-full cursor-pointer transition-colors"
              >
                <X className="text-gray-600 dark:text-slate-400" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-center text-gray-800 dark:text-slate-100">
              Add New User
            </h2>
            <p className="text-sm text-center text-gray-500 dark:text-slate-500 mb-6">
              Welcome to the Project Management System. Enter your credentials to create an account.
            </p>

            <form onSubmit={handleAddUser} className="flex flex-col gap-4">

              {/* Row 1: Fullname + Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${id}-fullname`} className={labelCls}>Fullname</label>
                  <input
                    id={`${id}-fullname`}
                    type="text"
                    placeholder="Enter full name"
                    value={formData.fullname}
                    onChange={(e) => handleInputChange("fullname", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${id}-category`} className={labelCls}>Position</label>
                  <input
                    id={`${id}-category`}
                    type="text"
                    placeholder="Eg: Network engineer"
                    value={formData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Row 2: Department + Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${id}-department`} className={labelCls}>Department *</label>
                  <select
                    id={`${id}-department`}
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    required
                    className={inputCls + " appearance-none"}
                  >
                    <option value="" disabled>Select department</option>
                    {dataDepartment?.departments?.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${id}-role`} className={labelCls}>Role *</label>
                  <select
                    id={`${id}-role`}
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    required
                    className={inputCls + " appearance-none"}
                  >
                    <option value="" disabled>Select role</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">Employee</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Email + Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${id}-email`} className={labelCls}>Email address</label>
                  <input
                    id={`${id}-email`}
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor={`${id}-username`} className={labelCls}>Username</label>
                  <input
                    id={`${id}-username`}
                    type="text"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Row 4: Password */}
              <div className="flex flex-col gap-1">
                <label htmlFor={`${id}-password`} className={labelCls}>Password</label>
                <div className="relative">
                  <input
                    id={`${id}-password`}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={inputCls + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2 rounded-md text-sm font-semibold mt-2 transition-all duration-150
                  bg-blue-600 hover:bg-blue-700 text-white
                  dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
                  dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]"
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
