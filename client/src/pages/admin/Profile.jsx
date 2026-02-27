import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Loader,
  User,
  Mail,
  Briefcase,
  Building2,
  Shield,
  KeyRound,
  AtSign,
  Save,
} from "lucide-react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

/* =========================== QUERIES & MUTATION =========================== */
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

/* =========================== SHARED STYLES =========================== */
const inputCls =
  "w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all";

/* =========================== FIELD WRAPPER =========================== */
function Field({ label, htmlFor, icon: Icon, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
          />
        )}
        {children}
      </div>
      {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
    </div>
  );
}

/* =========================== MAIN COMPONENT =========================== */
function Profile() {
  const id = "6992d115b034bbfbac83b8fb";
  const [showPassword, setShowPassword] = useState(false);

  const [isEditing, setEditing] = useState(false);
  const isEmployee = useLocation().pathname.includes("/employee/profile");

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

  const handleInputChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleEditClick = () => setEditing(!isEditing);

  const populateForm = (user) => {
    setFormData({
      id: user.id,
      fullname: user.fullname || "",
      department: user.department?.id || "",
      role: user.role || "",
      position: user.position || "",
      email: user.email || "",
      username: "",
      password: "",
      status: user.status ?? true,
    });
  };

  /* GET USER */
  const { loading: loadingUser, data: userAccount } = useQuery(GET_USER, {
    variables: { userId: id },
    skip: !id,
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.user) populateForm(data.user);
    },
    onError: () => toast.error("Failed to load user data"),
  });

  /* GET DEPARTMENTS */

  // when query result changes, populate form (guarded to avoid loops)
  useEffect(() => {
    if (
      userAccount?.user &&
      formData.id !== userAccount.user.id // only update if not already set
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      populateForm(userAccount.user);
    }
  }, [formData.id, userAccount]);
  const { data: dataDepartment } = useQuery(GET_DEPARTMENTS);

  /* UPDATE MUTATION */
  const [updateUser, { loading: loadingUpdate }] = useMutation(UPDATE_USER, {
    onCompleted: () => toast.success("Account updated successfully!"),
    onError: (error) => toast.error(error.message),
    refetchQueries: [{ query: GET_USERS }],
  });

  /* SUBMIT */
  const handleSubmit = (e) => {
    e.preventDefault();
    const nameRegex = /^[a-zA-Z\s.'-]+$/;
    if (!nameRegex.test(formData.fullname)) {
      toast.error(
        "Fullname can only contain letters, spaces, dots, apostrophes, and hyphens",
      );
      return;
    }
    if (formData.username && formData.username.length < 5) {
      toast.error("Username must be at least 5 characters");
      return;
    }
    if (formData.password && formData.password.length < 5) {
      toast.error("Password must be at least 5 characters");
      return;
    }
    const formatFullname = (name) =>
      name
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
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
  console.log(userAccount?.user.fullname);

  const initials = formData.fullname
    ? formData.fullname
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  /* LOADING */
  if (loadingUser) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader size={70} className="animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    /* Full viewport fill — flex column */
    <div className="w-full h-full flex flex-col bg-slate-50">
      {/* ── Top Bar ── */}
      <div className="w-full bg-blue-600 px-6 py-4 flex items-center gap-3 shadow-sm shrink-0">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
        <h1 className="text-white font-semibold text-sm tracking-wide">
          My Profile
        </h1>
      </div>

      {/* ── Scrollable content, centered ── */}
      <div className="flex-1 overflow-y-auto flex justify-center py-8 px-4">
        <div className="w-full max-w-2xl flex flex-col gap-4">
          {/* ── Avatar / Identity Card ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 flex items-center gap-5">
            {/* Avatar */}
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200">
              <span className="text-xl font-bold text-white tracking-tight">
                {initials}
              </span>
            </div>
            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-slate-800 truncate leading-tight">
                {userAccount?.user?.fullname || "—"}
              </p>
              <p className="text-sm text-slate-400 truncate mt-0.5">
                {userAccount?.user?.email || "No email set"}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.role && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 capitalize">
                    {formData.role}
                  </span>
                )}
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    formData.status
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-slate-100 text-slate-400 border-slate-200"
                  }`}
                >
                  {formData.status ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div>
              <button
                onClick={handleEditClick}
                className={`${isEditing ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"} py-2 px-7 rounded-2xl cursor-pointer text-white font-medium`}
              >
               { isEditing ? "Cancel" : "Edit"}
              </button>
            </div>
          </div>

          {/* ── Form Card ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-6">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">
              Edit Information
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" htmlFor={`${id}-fullname`} icon={User}>
                  <input
                    id={`${id}-fullname`}
                    type="text"
                    placeholder="Enter full name"
                    value={formData.fullname}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handleInputChange("fullname", e.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
                <Field
                  label="Position"
                  htmlFor={`${id}-position`}
                  icon={Briefcase}
                >
                  <input
                    id={`${id}-position`}
                    type="text"
                    placeholder="e.g. Network Engineer"
                    value={formData.position}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handleInputChange("position", e.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Department *"
                  htmlFor={`${id}-department`}
                  icon={Building2}
                >
                  <select
                    id={`${id}-department`}
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    required
                    disabled={isEmployee}
                    className={inputCls + " appearance-none cursor-pointer"}
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
                </Field>
                <Field label="Role *" htmlFor={`${id}-role`} icon={Shield}>
                  <select
                    id={`${id}-role`}
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    required
                    disabled={isEmployee}
                    className={inputCls + " appearance-none cursor-pointer"}
                  >
                    <option value="" disabled>
                      Select role
                    </option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">Employee</option>
                  </select>
                </Field>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Email Address"
                  htmlFor={`${id}-email`}
                  icon={Mail}
                >
                  <input
                    id={`${id}-email`}
                    type="email"
                    placeholder="Enter email"
                    disabled={!isEditing}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field
                  label="Username"
                  htmlFor={`${id}-username`}
                  icon={AtSign}
                  hint="Min. 5 characters if changing"
                >
                  <input
                    id={`${id}-username`}
                    type="text"
                    placeholder="Leave blank to keep current"
                    value={formData.username}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Row 4: Password */}
              <Field
                label="Password"
                htmlFor={`${id}-password`}
                icon={KeyRound}
                hint="Min. 5 characters if changing"
              >
                <div className="relative">
                  <KeyRound
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                  />
                  <input
                    id={`${id}-password`}
                    type={showPassword ? "text" : "password"}
                    placeholder="Leave blank to keep current"
                    value={formData.password}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={inputCls + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>

              <div className="border-t border-slate-100" />

              {/* Submit */}
              <button
                type="submit"
                disabled={loadingUpdate || !isEditing}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-semibold shadow-md shadow-blue-100 transition-all active:scale-[0.98]"
              >
                {loadingUpdate ? (
                  <>
                    <Loader size={15} className="animate-spin" /> Updating…
                  </>
                ) : (
                  <>
                    <Save size={15} /> Update Account
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
