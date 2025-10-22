import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiUpload } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../components/axiosCongif";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleFileInputChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!avatar || !fullName || !email || !password) {
      toast.error("All fields including avatar are required.");
      return;
    }

    const form = new FormData();
    form.append("file", avatar);
    form.append("name", fullName);
    form.append("email", email);
    form.append("password", password);

    try {
      setIsLoading(true);
      await api.post("/signup", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`Signup successful`);
      setFullName("");
      setEmail("");
      setPassword("");
      setAvatar(null);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data || "Signup failed");
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
              Create Account
            </p>
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 leading-[0.9] mb-6">
              Register as a new user
            </h1>
            <div className="w-20 h-[1px] bg-gray-900 mx-auto"></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="text-gray-700 font-light text-sm block mb-2">
                Full Name
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-4 py-3 focus-within:border-gray-900 transition-colors">
                <FiUser className="text-gray-400 mr-3" size={18} />
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-transparent w-full text-gray-900 placeholder-gray-400 focus:outline-none font-light"
                  placeholder="Your name"
                  required
                />
              </div>
            </div>

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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent w-full text-gray-900 placeholder-gray-400 focus:outline-none font-light pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="fileUpload" className="text-gray-700 font-light text-sm block mb-2">
                Profile Picture
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-4 py-3 cursor-pointer hover:border-gray-900 transition-colors">
                <FiUpload className="text-gray-400 mr-3" size={18} />
                <input
                  id="fileUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="text-gray-700 font-light text-sm w-full bg-transparent outline-none file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-800 file:cursor-pointer"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-md transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed tracking-wide"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  <span>Creating account...</span>
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-gray-500 font-light text-sm text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-gray-900 font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
