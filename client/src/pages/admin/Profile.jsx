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
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

////-----------------THIS PAGE IS SHARED BY TYPE OF USERS-----------------////

/*QUERIES & MUTATION */
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

// ── Shared input class DESIGN
const inputCls =
  "w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border transition-all " +
  "border-slate-200 dark:border-[#2a3040] " +
  "bg-slate-50 dark:bg-[#1a1f2b] " +
  "text-slate-800 dark:text-slate-200 " +
  "placeholder-slate-300 dark:placeholder-slate-600 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-[#31f64b]/40 focus:border-transparent " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

function Field({ label, htmlFor, icon: Icon, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10"
          />
        )}
        {children}
      </div>
      {hint && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{hint}</p>}
    </div>
  );
}

function Profile() {
  const auth = useSelector((state) => state.auth);
  const userId = auth.user?.id;
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setEditing] = useState(false);

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

  const { loading: loadingUser, data: userAccount } = useQuery(GET_USER, {
    variables: { userId: userId },
    skip: !userId,
    fetchPolicy: "network-only",
    onCompleted: (data) => { if (data?.user) populateForm(data.user); },
    onError: () => toast.error("Failed to load user data"),
  });

  useEffect(() => {
    if (userAccount?.user && formData.id !== userAccount.user.id) {
      populateForm(userAccount.user);
    }
  }, [formData.id, userAccount]);

  const { data: dataDepartment } = useQuery(GET_DEPARTMENTS);

  const [updateUser, { loading: loadingUpdate }] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      toast.success("Account updated successfully!");
      setFormData({ username: "", password: "" });
      setEditing(false);
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
      toast.error("Username must be at least 5 characters");
      return;
    }
    if (formData.password && formData.password.length < 5) {
      toast.error("Password must be at least 5 characters");
      return;
    }
    const formatFullname = (name) =>
      name.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

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

  const initials = formData.fullname
    ? formData.fullname.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  if (loadingUser) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-[#181d28]">
        <div className="flex flex-col items-center gap-3">
          <Loader size={70} className="animate-spin text-blue-500 dark:text-[#31f64b]" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-[#181d28] overflow-hidden">

      {/* ── Top banner ── */}
      <div className="w-full bg-blue-600 dark:bg-[#222732] dark:border-b dark:border-[#31f64b]/20 rounded-xl px-6 py-4 flex items-center gap-3 shadow-sm shrink-0">
        <div className="w-8 h-8 rounded-full bg-white/20 dark:bg-[#31f64b]/20 flex items-center justify-center">
          <User size={16} className="text-white dark:text-[#31f64b]" />
        </div>
        <h1 className="text-white dark:text-[#31f64b] font-semibold text-sm tracking-wide">
          My Profile
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto sm:overflow-hidden flex justify-center sm:py-8 sm:px-4">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="w-full max-w-2xl flex flex-col gap-4"
        >
          {/* ── Profile card ── */}
          <div className="bg-white dark:bg-[#222732] rounded-2xl border border-slate-100 dark:border-[#2a3040] shadow-sm dark:shadow-[0_2px_16px_rgba(0,0,0,0.4)] px-6 py-5 flex items-center gap-5">
            {/* Avatar */}
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 dark:from-[#31f64b] dark:to-blue-500 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-[0_4px_12px_rgba(49,246,75,0.25)]">
              <span className="text-xl font-bold text-white dark:text-black tracking-tight">
                {initials}
              </span>
            </div>

            {/* Name + email + badges */}
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
                {userAccount?.user?.fullname || "—"}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {userAccount?.user?.email || "No email set"}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.role && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 capitalize">
                    {formData.role}
                  </span>
                )}
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border
                  ${formData.status
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-green-900/20 dark:text-[#31f64b] dark:border-green-800"
                    : "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600"
                  }`}
                >
                  {formData.status ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Edit / Cancel button */}
            <div>
              <button
                onClick={handleEditClick}
                className={`py-2 px-7 rounded-2xl cursor-pointer font-medium transition-all duration-150
                  ${isEditing
                    ? "bg-red-500 hover:bg-red-600 text-white dark:bg-red-600/90 dark:hover:bg-red-500"
                    : "bg-blue-500 hover:bg-blue-600 text-white dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940] dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]"
                  }`}
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>
          </div>

          {/* ── Form card ── */}
          <div className="bg-white dark:bg-[#222732] rounded-2xl border border-slate-100 dark:border-[#2a3040] shadow-sm dark:shadow-[0_2px_16px_rgba(0,0,0,0.4)] px-6 py-2 sm:py-6">
            <p className="text-[11px] font-bold text-slate-400 dark:text-[#31f64b]/60 uppercase tracking-widest mb-5">
              Edit Information
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Row 1: Full Name + Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" htmlFor={`${userId}-fullname`} icon={User}>
                  <input
                    id={`${userId}-fullname`}
                    type="text"
                    placeholder="Enter full name"
                    value={formData.fullname}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange("fullname", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Position" htmlFor={`${userId}-position`} icon={Briefcase}>
                  <input
                    id={`${userId}-position`}
                    type="text"
                    placeholder="e.g. Network Engineer"
                    value={formData.position}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Row 2: Department + Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Department" htmlFor={`${userId}-department`} icon={Building2}>
                  <select
                    id={`${userId}-department`}
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    required
                    disabled={true}
                    className={inputCls + " appearance-none cursor-pointer"}
                  >
                    <option value="" disabled>Select department</option>
                    {dataDepartment?.departments?.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Role *" htmlFor={`${userId}-role`} icon={Shield}>
                  <select
                    id={`${userId}-role`}
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    required
                    disabled={true}
                    className={inputCls + " appearance-none cursor-pointer"}
                  >
                    <option value="" disabled>Select role</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">Employee</option>
                    <option value="pm">Project Manager</option>
                  </select>
                </Field>
              </div>

              {/* Row 3: Email + Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email Address" htmlFor={`${userId}-email`} icon={Mail}>
                  <input
                    id={`${userId}-email`}
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
                  htmlFor={`${userId}-username`}
                  icon={AtSign}
                  hint="Min. 5 characters if changing"
                >
                  <input
                    id={`${userId}-username`}
                    type="text"
                    placeholder="Leave blank to keep current"
                    value={formData.username}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Password */}
              <Field
                label="Password"
                htmlFor={`${userId}-password`}
                icon={KeyRound}
                hint="Min. 5 characters if changing"
              >
                <div className="relative">
                  <KeyRound
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10"
                  />
                  <input
                    id={`${userId}-password`}
                    type={showPassword ? "text" : "password"}
                    placeholder="Leave blank to keep current"
                    value={formData.password}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={inputCls + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>

              <div className="border-t border-slate-100 dark:border-[#2a3040]" />

              {/* Submit */}
              <button
                type="submit"
                disabled={loadingUpdate || !isEditing}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]
                  bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white shadow-md shadow-blue-100
                  dark:bg-[#31f64b] dark:text-black dark:font-bold dark:hover:bg-[#28d940]
                  dark:hover:shadow-[0_0_12px_rgba(49,246,75,0.4)]
                  dark:disabled:bg-[#31f64b]/40 dark:disabled:cursor-not-allowed dark:disabled:text-black/50"
              >
                {loadingUpdate ? (
                  <><Loader size={15} className="animate-spin" /> Updating…</>
                ) : (
                  <><Save size={15} /> Update Account</>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;
