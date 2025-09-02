import React, { useEffect, useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../components/axiosCongif";

const ShopLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { isSeller, seller } = useSelector((state) => state.seller);

  useEffect(() => {
    if (isSeller && seller?._id) {
      navigate(`/shop/${seller._id}`);
    }
  }, [isSeller, seller]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Both fields are required.");
      return;
    }

    try {
      const res = await api.post(
        "/shop-login",
        { email, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Login Successful");
        navigate(`/shop/${res.data.seller._id}`);
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (error) {
      toast.error(error.response?.data || "Login failed");
    }
  };

  return (
    <div className="h-screen w-screen fixed top-0 left-0 flex items-center justify-center bg-gray-900 px-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          Login To Your Shop
        </h2>
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
                className="bg-transparent w-full py-2 text-white focus:outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 text-gray-400 hover:text-white"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-md transition"
          >
            Login
          </button>
        </form>

        <p className="text-gray-400 mt-4 text-sm text-center">
          Don't have any Shop?{" "}
          <Link to="/create-shop" className="text-red-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ShopLogin;
