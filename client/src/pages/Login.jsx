import React, { useState } from "react";
import { Lock, User, Eye,  EyeOff } from "lucide-react";



export default function LoginUI() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      console.log("Login attempt:", { email, password, rememberMe });
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center p-6 relative overflow-hidden">
      {/* Login Container */}
      <div className="w-full md:w-200 max-w-md relative z-10 animate-slide-up">
        <div className="bg-blue-500 backdrop-blur-2xl borderrounded-3xl p-12 relative overflow-hidden">
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1px bg-linear-to-r  opacity-30" />

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-serif font-semibold text-white mb-2 tracking-tight">
              Welcome back
            </h1>
            <p className="text-white-100 text-sm tracking-wide">
              Sign in to continue to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium text-white uppercase tracking-wider mb-2"
              >
                username
              </label>

              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black w-6 h-6 pointer-events-none" />

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  className="w-full caret-black pl-13 pr-4 py-3.5 bg-white border border-white text-black text-sm
                 placeholder:text-gray-500 focus:outline-none focus:border-black
                 focus:ring-1 focus:ring-black transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-white uppercase tracking-wider mb-2"
              >
                Password
              </label>

              <div className="relative">
                {/* Lock icon */}
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black w-6 h-6 pointer-events-none" />

                {/* Input */}
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full caret-black pl-14 pr-14 py-3.5 bg-white border border-white text-black text-sm
                 placeholder:text-gray-500 focus:outline-none focus:border-black
                 focus:ring-1 focus:ring-black transition-all duration-300"
                />

                {/* Eye toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black cursor-pointer"
                >
                  {!showPassword ? (
                    <EyeOff className="w-6 h-6" />
                  ) : (
                    <Eye className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className=" w-full px-4 py-4 bg-[#023586] hover:bg-[#0547b0] text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-lime-300/30 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              <span className="relative z-10">
                {isLoading ? "Signing in..." : "Sign In"}
              </span>
              <div className="absolute inset-0 bg-white/30 transform scale-0 group-hover:scale-100 transition-transform duration-500 rounded-xl" />
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,300&family=DM+Sans:wght@400;500;700&display=swap");

        .font-serif {
          font-family: "Fraunces", serif;
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 20s ease-in-out infinite;
          animation-delay: 7s;
        }

        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
