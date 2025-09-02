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
    <div className="h-screen w-screen fixed top-0 left-0 flex items-center justify-center bg-gray-900 px-4">
      <Toaster position="top-center" />
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="text-gray-300 block mb-1">
              Email
            </label>
            <div className="flex items-center bg-gray-700 rounded-md px-3">
              <FiMail className="text-gray-400 mr-2" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent w-full py-2 text-white focus:outline-none"
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="text-gray-300 block mb-1">
              Password
            </label>
            <div className="flex items-center bg-gray-700 rounded-md px-3 relative">
              <FiLock className="text-gray-400 mr-2" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent w-full py-2 text-white focus:outline-none pr-10"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 text-gray-400 hover:text-white"
                disabled={isLoading}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-medium py-2 rounded-md transition"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-gray-400 mt-4 text-sm text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-red-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;