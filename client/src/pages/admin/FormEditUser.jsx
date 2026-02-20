import { useState, useEffect } from "react";
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
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    fullname: "",
    department: "",
    role: "",
    position: "",
    email: "",
    username: "",
    password: "",
    status: true,
  });

  /* ===========================
     GET USER DATA
     — fetch when modal opens using useEffect
  =========================== */
  const { loading: loadingUser, refetch } = useQuery(GET_USER, {
    skip: true, // Always skip, we'll call refetch when modal opens
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.user) {
        setFormData({
          id: data.user.id,
          fullname: data.user.fullname || "",
          department: data.user.department?.id || "",
          role: data.user.role || "",
          position: data.user.position || "",
          email: data.user.email || "",
          username: "",
          password: "",
          status: data.user.status ?? true,
        });
      }
    },
  });

  // Trigger query when modal opens
  useEffect(() => {
    if (open && userId) {
      refetch({ userId });
    }
  }, [open, userId, refetch]);

  /* ===========================
     INPUT HANDLER
  =========================== */
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ===========================
     GET DEPARTMENTS
  =========================== */
  const { data: dataDepartment } = useQuery(GET_DEPARTMENTS);

  /* ===========================
     UPDATE MUTATION
  =========================== */
  const [updateUser] = useMutation(UPDATE_USER, {
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
     SUBMIT
  =========================== */
  const handleSubmit = (e) => {
    e.preventDefault();

    updateUser({
      variables: {
        updateUserId: formData.id,
        fullname: formData.fullname,
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
        onClick={() => setOpen(true)}
        title="Update User"
        className="flex items-center hover:cursor-pointer gap-2 bg-blue-600 text-white px-3 py-3 rounded-md text-sm font-medium hover:bg-blue-700"
      >
        <Pen size={18} />
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          {loadingUser ? (
            <div className="flex justify-center items-center bg-white rounded-xl p-8">
              <span className="loading loading-spinner loading-xl"></span>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex justify-center mb-4">
                <img src={logo} alt="logo" className="h-10 w-auto" />
              </div>

              <h2 className="text-xl font-bold text-center">Edit User</h2>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 mt-4"
              >
                {/* Fullname — pre-filled */}
                <input
                  type="text"
                  placeholder="Fullname"
                  value={formData.fullname}
                  onChange={(e) =>
                    handleInputChange("fullname", e.target.value)
                  }
                  className="border px-3 py-2 rounded-md"
                />

                {/* Department — pre-selected */}
                <select
                  value={formData.department}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  className="border px-3 py-2 rounded-md"
                >
                  <option value="">Select Department</option>
                  {dataDepartment?.departments?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                {/* Role — pre-selected */}
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className="border px-3 py-2 rounded-md"
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">Employee</option>
                </select>

                {/* Position — pre-filled */}
                <input
                  type="text"
                  placeholder="Position"
                  value={formData.position}
                  onChange={(e) =>
                    handleInputChange("position", e.target.value)
                  }
                  className="border px-3 py-2 rounded-md"
                />

                {/* Email — pre-filled */}
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="border px-3 py-2 rounded-md"
                />

                {/* Username — intentionally blank */}
                <input
                  type="text"
                  placeholder="Username (leave blank to keep current)"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  className="border px-3 py-2 rounded-md"
                />

                {/* Password — intentionally blank */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (leave blank to keep current)"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="border px-3 py-2 rounded-md w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={25} /> : <Eye size={25} />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Update Account
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
