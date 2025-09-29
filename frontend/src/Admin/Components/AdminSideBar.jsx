import {
  MdOutlineDashboard,
  MdMan2,
} from "react-icons/md";
import {
  FaProductHunt,
} from "react-icons/fa";
import {
  FiPackage,
} from "react-icons/fi";
import {
  CiMoneyBill,
} from "react-icons/ci";
import { Link, useLocation } from "react-router-dom";
import { BsCalendarEvent, BsFillPeopleFill, BsPerson } from "react-icons/bs";

const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <MdOutlineDashboard />, color: "blue" },
  { label: "All Products", path: "/admin/all-products", icon: <FaProductHunt />, color: "green" },
  { label: "All Orders", path: "/admin/all-orders", icon: <FiPackage />, color: "teal" },
  { label: "All Sellers", path: "/admin/all-sellers", icon: <MdMan2 />, color: "teal" },
  { label: "All Users", path: "/admin/all-users", icon: <BsFillPeopleFill />, color: "teal" },
  { label: "All Events", path: "/admin/all-events", icon: <BsCalendarEvent />, color: "teal" },
  { label: "Withdraw Request", path: "/admin/withdraw-requests", icon: <CiMoneyBill />, color: "yellow" },
];

const colorVariants = {
  blue: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200",
  green: "hover:bg-green-50 hover:text-green-600 hover:border-green-200",
  purple: "hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200",
  orange: "hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200",
  red: "hover:bg-red-50 hover:text-red-600 hover:border-red-200",
  pink: "hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200",
  indigo: "hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200",
  teal: "hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200",
  yellow: "hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200",
  cyan: "hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200",
  gray: "hover:bg-gray-50 hover:text-gray-600 hover:border-gray-200",
};

const activeColorVariants = {
  blue: "text-blue-600 bg-blue-50 border-blue-200 shadow-md",
  green: "text-green-600 bg-green-50 border-green-200 shadow-md",
  purple: "text-purple-600 bg-purple-50 border-purple-200 shadow-md",
  orange: "text-orange-600 bg-orange-50 border-orange-200 shadow-md",
  red: "text-red-600 bg-red-50 border-red-200 shadow-md",
  pink: "text-pink-600 bg-pink-50 border-pink-200 shadow-md",
  indigo: "text-indigo-600 bg-indigo-50 border-indigo-200 shadow-md",
  teal: "text-teal-600 bg-teal-50 border-teal-200 shadow-md",
  yellow: "text-yellow-600 bg-yellow-50 border-yellow-200 shadow-md",
  cyan: "text-cyan-600 bg-cyan-50 border-cyan-200 shadow-md",
  gray: "text-gray-600 bg-gray-50 border-gray-200 shadow-md",
};

const AdminSideBar = ({ isCollapsed }) => {
  const location = useLocation();

  return (
    <div className="w-full h-full bg-white/95 backdrop-blur-sm  ">
      <div className={`p-4 border-b overflow-auto border-gray-100 ${isCollapsed ? 'text-center' : ''}`}>
        {isCollapsed ? (
          <div className="w-10 h-10 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
             <div className="ml-2">
                <BsPerson/>
              </div>
            <div className="justify-center flex flex-col">
              <h2 className="text-lg font-bold text-gray-800">Admin Dashboard</h2>
              <p className="text-xs text-gray-500">Manage Everything</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="p-4">
        <ul className="space-y-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`
                    group flex items-center transition-all duration-200 ease-in-out
                    border border-transparent rounded-xl
                    ${isCollapsed ? 'justify-center p-3' : 'px-4 py-3 space-x-3'}
                    ${isActive 
                      ? activeColorVariants[item.color] 
                      : `text-gray-700 ${colorVariants[item.color]}`
                    }
                    hover:transform hover:scale-105 hover:shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <span className={`
                    text-xl transition-transform duration-200
                    ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                    ${isCollapsed ? 'mx-auto' : ''}
                  `}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="font-medium text-sm whitespace-nowrap group-hover:translate-x-1 transition-transform duration-200">
                      {item.label}
                    </span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      
      {isCollapsed && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSideBar;