import React, { useEffect, useState } from 'react';
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiHome, FiUpload } from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../components/axiosCongif';

const ShopCreate = () => {
  const [shopName, setShopName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { isSeller, seller } = useSelector((state) => state.seller);
  const navigate = useNavigate();

  const handleFileInputChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!avatar || !shopName || !phoneNumber || !email || !password || !zipCode || !address) {
      toast.error("All fields including avatar are required.");
      return;
    }

    const formData = new FormData();
    formData.append("file", avatar);
    formData.append("name", shopName);
    formData.append("phoneNumber", phoneNumber);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("zipCode", zipCode);
    formData.append("address", address);

    try {
      setIsLoading(true);
      await api.post("/create-shop", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShopName("");
      setPhoneNumber("");
      setEmail("");
      setPassword("");
      setZipCode("");
      setAddress("");
      setAvatar(null);
      toast.success(`Shop created successfully. Check your ${email} to activate your account.`);
    } catch (err) {
      toast.error(err.response?.data || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSeller) {
      navigate(`/shop/${seller._id}`);
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-12">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block">
            <p className="text-sm font-medium text-gray-500 tracking-[0.15em] uppercase mb-2 font-mono">
              Start Selling
            </p>
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 leading-[0.9] mb-6">
              Create your shop
            </h1>
            <div className="w-20 h-[1px] bg-gray-900 mx-auto"></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg p-8 md:p-10 shadow-sm border border-gray-100">
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Shop Name */}
            <div>
              <label htmlFor="shopName" className="text-gray-700 font-light text-sm block mb-2">
                Shop Name
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-4 py-3 focus-within:border-gray-900 transition-colors">
                <FiUser className="text-gray-400 mr-3" size={18} />
                <input
                  id="shopName"
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="bg-transparent w-full text-gray-900 placeholder-gray-400 focus:outline-none font-light"
                  placeholder="Your shop name"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Grid for Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent w-full text-gray-900 placeholder-gray-400 focus:outline-none font-light"
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="text-gray-700 font-light text-sm block mb-2">
                  Phone Number
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-4 py-3 focus-within:border-gray-900 transition-colors">
                  <FiPhone className="text-gray-400 mr-3" size={18} />
                  <input
                    id="phoneNumber"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-transparent w-full text-gray-900 placeholder-gray-400 focus:outline-none font-light"
                    placeholder="+1 234 567 8900"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-gray-700 font-light text-sm block mb-2">
                Password
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-4 py-3 focus-within:border-gray-900 transition-colors">
                <FiLock className="text-gray-400 mr-3" size={18} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent w-full text-gray-900 placeholder-gray-400 focus:outline-none font-light"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Grid for Address and Zip Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address */}
              <div>
                <label htmlFor="address" className="text-gray-700 font-light text-sm block mb-2">
                  Address
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-4 py-3 focus-within:border-gray-900 transition-colors">
                  <FiHome className="text-gray-400 mr-3" size={18} />
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-transparent w-full text-gray-900 placeholder-gray-400 focus:outline-none font-light"
                    placeholder="123 Main Street"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Zip Code */}
              <div>
                <label htmlFor="zipCode" className="text-gray-700 font-light text-sm block mb-2">
                  Zip Code
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-4 py-3 focus-within:border-gray-900 transition-colors">
                  <FiMapPin className="text-gray-400 mr-3" size={18} />
                  <input
                    id="zipCode"
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="bg-transparent w-full text-gray-900 placeholder-gray-400 focus:outline-none font-light"
                    placeholder="12345"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="avatar" className="text-gray-700 font-light text-sm block mb-2">
                Shop Logo
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-4 py-3 cursor-pointer hover:border-gray-900 transition-colors">
                <FiUpload className="text-gray-400 mr-3" size={18} />
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="text-gray-700 font-light text-sm w-full bg-transparent outline-none file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-800 file:cursor-pointer"
                  disabled={isLoading}
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
                  <span>Creating shop...</span>
                </>
              ) : (
                "Create Shop"
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-gray-500 font-light text-sm text-center">
              Already have a shop?{" "}
              <Link to="/shop-login" className="text-gray-900 font-medium hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCreate;
