import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiUpload } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../components/axiosCongif";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar]   = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate()

  const handleFileInputChange = (e)=>{
       setAvatar(e.target.files[0]);
  }

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
      await api.post("/signup", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success(`Signup successful , check your gmail ${email} to activate your account`);
      setFullName("")
      setEmail("")
      setPassword("")
      setAvatar("")
      navigate("/login")
    } catch (err) {
      toast.error(err.response?.data || "Signup failed");
    }
  };

  return (
    <div className="h-screen w-screen fixed top-0 left-0 flex items-center justify-center bg-gray-900 px-4">
      <Toaster position="top-center" />
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Register as a new user</h2>
        <form onSubmit={handleSignup} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="text-gray-300 block mb-1">
              Full Name
            </label>
            <div className="flex items-center bg-gray-700 rounded-md px-3">
              <FiUser className="text-gray-400 mr-2" />
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-transparent w-full py-2 text-white focus:outline-none"
                placeholder="Your name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-gray-300 block mb-1">
              Email address
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
                autoComplete="new-password"
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

          {/* File Upload */}
          <div>
            <label htmlFor="fileUpload" className="text-gray-300 block mb-1">
              Upload a file
            </label>
            <div className="flex items-center bg-gray-700 rounded-md px-3 py-2 cursor-pointer">
              <FiUpload className="text-gray-400 mr-2" />
              <input
                id="fileUpload"
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="text-gray-300 w-full bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition"
          >
            Submit
          </button>
        </form>

        {/* Link to Login */}
        <p className="text-gray-400 mt-4 text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
