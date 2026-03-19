import { useId, useState } from "react";
import { Eye, EyeOff, Pen, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";

const GET_DEPARTMENTS = gql`
  query GetDepartments {
    departments { id name }
  }
`;

const GET_USERS = gql`
  query Users {
    users {
      id fullname role position email status
      department { id name }
    }
  }
`;

const GET_USER = gql`
  query GetUser($userId: ID!) {
    user(id: $userId) {
      id fullname email position role status
      department { id }
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser(
    $updateUserId: ID! $fullname: String $email: String $password: String
    $position: String $username: String $status: Boolean $department: ID $role: String
  ) {
    updateUser(
      id: $updateUserId fullname: $fullname email: $email password: $password
      position: $position username: $username status: $status department: $department role: $role
    ) {
      message
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

export default function FormEditUser({ userId }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    id: "", fullname: "", department: "", role: "", position: "",
    email: "", username: "", password: "", status: true,
  });

  const handleInputChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const { loading: loadingUser, refetch } = useQuery(GET_USER, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: "network-only",
  });

  const populateForm = (user) => {
    setFormData({
      id: user.id, fullname: user.fullname || "", department: user.department?.id || "",
      role: user.role || "", position: user.position || "", email: user.email || "",
      username: "", password: "", status: user.status ?? true,
    });
  };

  const handleOpen = async () => {
    setOpen(true);
    try {
      const { data } = await refetch({ userId });
      if (data?.user) populateForm(data.user);
    } catch {
      toast.error("Failed to load user data");
    }
  };

  const { data: dataDepartment } = useQuery(GET_DEPARTMENTS);

  const [updateUser, { loading: loadingUpdate }] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      toast.success("Successfully updated account!");
      setOpen(false);
    },
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: GET_USERS }],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const nameRegex = /^[a-zA-Z\s.'-]+$/;
    if (!nameRegex.test(formData.fullname)) {
      toast.error("Fullname can only contain letters, spaces, dots, apostrophes, and hyphens");
      return;
    }
    if (formData.username && formData.username.length < 5) {
      toast.error("Username must be at least 5 characters"); return;
    }
    if (formData.password && formData.password.length < 5) {
      toast.error("Password must be at least 5 characters"); return;
    }
    const formatFullname = (name) =>
      name.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");

    updateUser({
      variables: {
        updateUserId: formData.id,
        fullname: formatFullname(formData.fullname),
        department: formData.department,
        role: formData.role,
        position: formData.position,
        email: formData.email,
        username: formData.username || undefined,
        password: formData.password || undefined,
        status: formData.status,
      },
    });
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        title="Update User"
        className="flex items-center hover:cursor-pointer gap-2 px-3 py-3 rounded-md text-sm font-medium transition-all duration-150
          bg-blue-600 hover:bg-blue-700 text-white
          dark:bg-blue-600/90 dark:hover:bg-blue-500
          dark:hover:shadow-[0_0_8px_rgba(59,130,246,0.4)]"
      >
        <Pen size={18} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 dark:bg-black/60 p-4">
          <div className="bg-white dark:bg-[#222732] rounded-xl shadow-xl dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)] w-full max-w-md max-h-[90vh] overflow-y-auto p-6">

            {/* Header */}
            <div className="grid col-3 mb-4">
              <div className="col-2 flex justify-center">
                <img src={logo} alt="logo" className="h-10 flex justify-center align-middle col-2 w-auto rounded-4xl" />
              </div>
              <div className="col-3 flex justify-end">
                <X
                  className="cursor-pointer rounded-2xl text-gray-600 dark:text-slate-400 hover:bg-gray-300 dark:hover:bg-[#252d3d] transition-colors"
                  onClick={() => setOpen(false)}
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-center text-gray-800 dark:text-slate-100">
              Edit User
            </h2>
            <p className="text-sm text-center text-gray-500 dark:text-slate-500 mb-6">
              Update the user's information below. Leave username and password blank to keep them unchanged.
            </p>

            {loadingUser ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-xl dark:text-[#31f64b]"></span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* Row 1: Fullname + Position */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor={`${id}-fullname`} className={labelCls}>Fullname</label>
                    <input
                      id={`${id}-fullname`} type="text" placeholder="Enter full name"
                      value={formData.fullname}
                      onChange={(e) => handleInputChange("fullname", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor={`${id}-position`} className={labelCls}>Position</label>
                    <input
                      id={`${id}-position`} type="text" placeholder="e.g. Network Engineer"
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
                      id={`${id}-department`} value={formData.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      required className={inputCls + " appearance-none"}
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
                      id={`${id}-role`} value={formData.role}
                      onChange={(e) => handleInputChange("role", e.target.value)}
                      required className={inputCls + " appearance-none"}
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
                      id={`${id}-email`} type="email" placeholder="Enter email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor={`${id}-username`} className={labelCls}>Username</label>
                    <input
                      id={`${id}-username`} type="text" placeholder="Leave blank to keep current"
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
                      placeholder="Leave blank to keep current"
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
                  disabled={loadingUpdate}
                  className="w-full py-2 rounded-md text-sm font-semibold mt-2 transition-all duration-150
                    bg-blue-600 hover:bg-blue-700 text-white
                    dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
                    dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingUpdate ? "Updating..." : "Update Account"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
