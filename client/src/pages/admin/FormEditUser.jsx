import { useId, useState } from "react";
import { Eye, EyeOff, Pen } from "lucide-react";
import logo from "@/assets/logo.png";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";

/* ===========================
   QUERIES & MUTATION
=========================== */

const GET_DEPARTMENTS = gql`
  query GetDepartments {
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
        id
        name
      }
    }
  }
`;

const GET_USER = gql`
  query GetUser($userId: ID!) {
    user(id: $userId) {
      id
      fullname
      email
      position
      role
      status
      department {
        id
      }
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser(
    $updateUserId: ID!
    $fullname: String
    $email: String
    $password: String
    $position: String
    $username: String
    $status: Boolean
    $department: ID
    $role: String
  ) {
    updateUser(
      id: $updateUserId
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
    }
  }
`;

/* ===========================
   COMPONENT
=========================== */

export default function FormEditUser({ userId }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    fullname: "",
    department: "",
    role: "",
    position: "",
    email: "",
    username: "", // intentionally blank
    password: "", // intentionally blank
    status: true,
  });

  /* ===========================
     INPUT HANDLER
  =========================== */
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ===========================
     GET USER — always mounted so
     refetch() is always available
  =========================== */
  const { loading: loadingUser, refetch } = useQuery(GET_USER, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: "network-only",
  });

  const populateForm = (user) => {
    setFormData({
      id: user.id,
      fullname: user.fullname || "",
      department: user.department?.id || "",
      role: user.role || "",
      position: user.position || "",
      email: user.email || "",
      username: "", // intentionally blank
      password: "", // intentionally blank
      status: user.status ?? true,
    });
  };

  /* ===========================
     OPEN — refetch every click
     so values are always fresh
  =========================== */
  const handleOpen = async () => {
    setOpen(true);
    try {
      const { data } = await refetch({ userId });
      if (data?.user) populateForm(data.user);
    } catch {
      toast.error("Failed to load user data");
    }
  };

  /* ===========================
     GET DEPARTMENTS
  =========================== */
  const { data: dataDepartment } = useQuery(GET_DEPARTMENTS);

  /* ===========================
     UPDATE MUTATION
  =========================== */
  const [updateUser, { loading: loadingUpdate }] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      toast.success("Successfully updated account!");
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
    refetchQueries: [{ query: GET_USERS }],
  });

  /* ===========================
     SUBMIT + VALIDATION
     (same rules as FormAddUser)
  =========================== */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Fullname — letters only
    const nameRegex = /^[a-zA-Z\s.'-]+$/;
    if (!nameRegex.test(formData.fullname)) {
      toast.error(
        "Fullname can only contain letters, spaces, dots, apostrophes, and hyphens",
      );
      return;
    }

    // Username — only validate if user typed something
    if (formData.username && formData.username.length < 5) {
      toast.error("Username must be at least 5 characters");
      return;
    }

    // Password — only validate if user typed something
    if (formData.password && formData.password.length < 5) {
      toast.error("Password must be at least 5 characters");
      return;
    }

    // Capitalize each word in fullname (same as FormAddUser)
    const formatFullname = (name) =>
      name
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");

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

  /* ===========================
     RENDER
  =========================== */
  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        title="Update User"
        className="flex items-center hover:cursor-pointer gap-2 bg-blue-600 text-white px-3 py-3 rounded-md text-sm font-medium hover:bg-blue-700"
      >
        <Pen size={18} />
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            {/* Header */}
            <div className="flex justify-center mb-4">
              <img src={logo} alt="logo" className="h-10 w-auto" />
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800">
              Edit User
            </h2>
            <p className="text-sm text-center text-gray-500 mb-6">
              Update the user's information below. Leave username and password
              blank to keep them unchanged.
            </p>

            {loadingUser ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-xl"></span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Row 1: Fullname + Position */}
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
                      htmlFor={`${id}-position`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Position
                    </label>
                    <input
                      id={`${id}-position`}
                      type="text"
                      placeholder="e.g. Network Engineer"
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
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
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
                      onChange={(e) =>
                        handleInputChange("role", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
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
                      placeholder="Leave blank to keep current"
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Row 4: Password */}
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
                      placeholder="Leave blank to keep current"
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
                  disabled={loadingUpdate}
                  className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
