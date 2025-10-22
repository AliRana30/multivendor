import React, { useEffect, useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import api from "../components/axiosCongif";
import { loadUser } from "../../redux/actions/user";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Both fields are required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/login", {
        email,
        password,
      }, {
        withCredentials: true
      });

      if (res.data.success) {
        await dispatch(loadUser());
        toast.success("Login Successful");
        navigate("/");
      } else {
        toast.error(res.data.message || "Login failed");
      }

    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data || 
                          "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-12">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block">
            <p className="text-sm font-medium text-gray-500 tracking-[0.15em] uppercase mb-2 font-mono">
              Welcome Back
            </p>
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 leading-[0.9] mb-6">
              Login to your account
            </h1>
            <div className="w-20 h-[1px] bg-gray-900 mx-auto"></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="text-gray-700 font-light text-sm block mb-2">
                Email address
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-4 py-3 focus-within:border-gray-900 transition-colors">
                <FiMail className="text-gray-400 mr-3" size={18} />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent w-full text-gray-900 placeholder-gray-400 focus:outline-none font-light"
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-gray-700 font-light text-sm block mb-2">
                Password
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-4 py-3 focus-within:border-gray-900 transition-colors relative">
                <FiLock className="text-gray-400 mr-3" size={18} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent w-full text-gray-900 placeholder-gray-400 focus:outline-none font-light pr-10"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 text-gray-400 hover:text-gray-900 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 rounded-md transition-colors duration-200 tracking-wide"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Link to Signup */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-gray-500 font-light text-sm text-center">
              Don't have an account?{" "}
              <Link to="/signup" className="text-gray-900 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
