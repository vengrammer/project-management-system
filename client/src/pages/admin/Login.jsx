import React, { useState } from "react";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import {motion} from "framer-motion"
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/middleware/authSlice";
import { gql } from "@apollo/client";
import {  useMutation } from "@apollo/client/react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        fullname
      }
    }
  }
`;


export default function LoginUI() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const [login] = useMutation(LOGIN, {
    onCompleted: () => {
      setIsLoading(false);
      toast.success("Login successful!");
    },
    onError: () => {
      setIsLoading(false);
      toast.error("Wrong username or password. Please try again.");
    },
  });

  //login logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login({
      variables: {
        username: username,
        password: password,
      },
    });
    console.log("Login response:", res);
    dispatch(loginSuccess(res.data.login));

    setIsLoading(false);
  };

  //get the current user from redux store
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  console.log(user, token);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }} // start below
      animate={{ y: 0, opacity: 1 }} // move to normal position
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="min-h-screen w-full flex items-center justify-center p-6"
    >
      {/* Login Container */}
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="bg-linear-to-br from-blue-600 to-blue-700 backdrop-blur-2xl rounded-3xl p-10 sm:p-12 shadow-2xl shadow-blue-900/50 relative overflow-hidden border border-white/10">
          {/* Decorative top line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent" />

          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="mb-10 relative">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
              Welcome back
            </h1>
            <p className="text-blue-100 text-sm tracking-wide">
              Sign in to continue to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="group">
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-blue-100 uppercase tracking-wider mb-3"
              >
                Username
              </label>

              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none transition-colors group-focus-within:text-blue-600" />

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-white/95 hover:bg-white rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-blue-100 uppercase tracking-wider mb-3"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none transition-colors group-focus-within:text-blue-600" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-14 py-3.5 bg-white/95 hover:bg-white rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all duration-300 shadow-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-linear-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group mt-8"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </span>
              <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-xl" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}