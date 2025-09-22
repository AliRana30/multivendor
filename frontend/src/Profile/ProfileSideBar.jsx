import { useState } from 'react';
import ProfileContent from './ProfileContent';
import {
  FaUser,
  FaBoxOpen,
  FaMoneyCheckAlt,
  FaEnvelope,
  FaTruck,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaLock,
  FaCog,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../components/axiosCongif';
import { useSelector } from 'react-redux';

const ProfileSideBar = () => {
  const [active, setActive] = useState('Profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const options = [
    { name: 'Profile', icon: <FaUser />, shortName: 'Profile' },
    { name: 'Orders', icon: <FaBoxOpen />, shortName: 'Orders' },
    { name: 'Refunds', icon: <FaMoneyCheckAlt />, shortName: 'Refunds' },
    { name: 'Track Orders', icon: <FaTruck />, shortName: 'Track' },
    { name: 'Change Password', icon: <FaLock />, shortName: 'Password' },
    { name: 'Address', icon: <FaMapMarkerAlt />, shortName: 'Address' },
    { name: 'Logout', icon: <FaSignOutAlt />, shortName: 'Logout' },
  ];

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
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden bg-white shadow-md sticky top-0 z-40 w-full">
        <div className="px-2 py-2">
          <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-hide">
            {/* Admin Dashboard Button - Mobile */}
            {isAdmin() && (
              <Link to="/admin/dashboard" className="flex-shrink-0">
                <div className="h-10 px-3 bg-black text-white rounded-lg flex items-center justify-center transition-all duration-200 shadow-md group relative">
                  <FaCog className="text-sm" />
                  <span className="ml-1.5 text-xs font-medium xs:inline">Admin</span>
                  
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    Admin Dashboard
                  </div>
                </div>
              </Link>
            )}

            {/* Navigation Options */}
            {options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleClick(option.name)}
                className={`
                  h-10 px-2 sm:px-3 flex items-center justify-center rounded-lg group relative flex-shrink-0 min-w-[40px] sm:min-w-[48px]
                  transition-all duration-200 hover:transform hover:scale-105
                  ${
                    active === option.name
                      ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-600 shadow-sm border border-red-100'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${option.name === 'Logout' ? 'hover:bg-red-50 hover:text-red-600' : ''}
                `}
              >
                <span className={`text-base sm:text-lg ${active === option.name ? 'text-red-500' : 'text-gray-500'}`}>
                  {option.icon}
                </span>
                
                <span className="hidden sm:inline ml-1.5 text-xs font-medium truncate">
                  {option.shortName}
                </span>
                
                <div className="sm:hidden absolute top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  {option.name}
                </div>

                {active === option.name && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-col lg:w-72 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <FaUser className="text-gray-600 text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>

          {/* Admin Dashboard Button - Desktop */}
          {isAdmin() && (
            <Link to="/admin/dashboard" className="block">
              <div className="bg-black text-white rounded-lg p-2.5 text-center transition-all duration-200 transform hover:scale-[1.02] shadow-md">
                <div className="flex items-center justify-center gap-2">
                  <FaCog className="text-sm" />
                  <span className="font-medium text-sm">Admin Dashboard</span>
                </div>
              </div>
            </Link>
          )}
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleClick(option.name)}
                className={`
                  w-full p-3 flex items-center gap-3 rounded-lg text-left
                  transition-all duration-200 hover:transform hover:scale-[1.01]
                  ${
                    active === option.name
                      ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-600 font-medium shadow-sm border border-red-100'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${option.name === 'Logout' ? 'hover:bg-red-50 hover:text-red-600' : ''}
                `}
              >
                <span className={`text-lg ${active === option.name ? 'text-red-500' : 'text-gray-500'}`}>
                  {option.icon}
                </span>
                <span className="font-medium">{option.name}</span>
                
                {active === option.name && (
                  <div className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 lg:ml-0 min-h-screen">
        <div className="hidden lg:block bg-white shadow-sm p-4 top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{active}</h1>
              <p className="text-gray-600 mt-1 text-sm">
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

        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm p-3 sticky top-[60px] z-30">
          <h1 className="text-lg font-bold text-gray-900">{active}</h1>
        </div>

        {/* Main Content */}
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {active !== 'Logout' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <ProfileContent option={active} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @media (min-width: 475px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileSideBar;