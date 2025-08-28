import React, { useState } from 'react';
import ProfileContent from './ProfileContent';
import {
  FaUser,
  FaBoxOpen,
  FaMoneyCheckAlt,
  FaEnvelope,
  FaTruck,
  FaCreditCard,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaLock,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../components/axiosCongif';
import { useSelector } from 'react-redux';
import { PersonStanding } from 'lucide-react';

const ProfileSideBar = () => {
  const [active, setActive] = useState('Profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const options = [
    { name: 'Profile', icon: <FaUser /> },
    { name: 'Orders', icon: <FaBoxOpen /> },
    { name: 'Refunds', icon: <FaMoneyCheckAlt /> },
    { name: 'Inbox', icon: <FaEnvelope /> },
    { name: 'Track Orders', icon: <FaTruck /> },
    { name: 'Change Password', icon: <FaLock /> },
    { name: 'Address', icon: <FaMapMarkerAlt /> },
    { name: 'Logout', icon: <FaSignOutAlt /> },
  ];

  // Helper function to check if user is admin
  const isAdmin = () => {
    if (!user || !user.role) return false;
    const role = user.role.toString().toLowerCase().trim();
    return role === 'admin';
  };

  const handleClick = async (name) => {
    if (name === 'Logout') {
      try {
        await api.get('/logout');
        toast.success('Logged out successfully');
        navigate('/');
        window.location.reload(true);
        scrollTo(0, 0);
      } catch (error) {
        toast.error('Logout failed. Try again.');
      }
    } else {
      setActive(name);
      // Close mobile menu when an option is selected
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-xl font-semibold text-gray-800">
          {active}
        </h1>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <FaTimes className="text-xl text-gray-600" />
          ) : (
            <FaBars className="text-xl text-gray-600" />
          )}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative lg:translate-x-0 top-0 left-0 h-full
          w-64 lg:w-72 bg-white shadow-lg z-50
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Mobile header in sidebar */}
        <div className="lg:hidden p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded hover:bg-gray-100"
          >
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        {/* User info section */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <FaUser className="text-gray-600 text-lg" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>

          {/* Admin Dashboard Button */}
          {isAdmin() && (
            <Link to="/admin/dashboard" className="block">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg p-2 text-center transition-all duration-200 transform hover:scale-20 shadow-md">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-medium">Admin Dashboard</span>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation Options */}
        <nav className="flex-1 p-2 lg:p-4 overflow-y-auto">
          <div className="space-y-1">
            {options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleClick(option.name)}
                className={`
                  w-full p-3 lg:p-4 flex items-center gap-3 rounded-lg text-left
                  transition-all duration-200 hover:transform hover:scale-[1.02]
                  ${
                    active === option.name
                      ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-600 font-medium shadow-sm border border-red-100'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${option.name === 'Logout' ? 'hover:bg-red-50 hover:text-red-600' : ''}
                `}
              >
                <span className={`text-xl ${active === option.name ? 'text-red-500' : 'text-gray-500'}`}>
                  {option.icon}
                </span>
                <span className="font-medium">{option.name}</span>
                
                {/* Active indicator */}
                {active === option.name && (
                  <div className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            © 2024 Your App Name
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 lg:ml-0 min-h-screen">
        {/* Desktop Header */}
        <div className="hidden lg:block bg-white shadow-sm p-6 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{active}</h1>
              <p className="text-gray-600 mt-1">
                Manage your {active.toLowerCase()} settings and preferences
              </p>
            </div>
            
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Profile</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">{active}</span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 lg:p-6 xl:p-8">
          <div className="max-w-6xl mx-auto">
            {active !== 'Logout' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <ProfileContent option={active} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSideBar;