import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { MdOutlineLocalOffer, MdDashboard } from 'react-icons/md'
import { FiShoppingBag } from 'react-icons/fi'
import { BiCalendarEvent } from 'react-icons/bi'
import { BsFilePerson } from 'react-icons/bs'
import { Box, User } from 'lucide-react'

const AdminHeader = () => {
  const { seller } = useSelector((state) => state.seller)

  const quickActions = [
    { 
      icon: <MdDashboard />, 
      path: '/admin/dashboard', 
      label: 'Dashboard',
      color: 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50',
      showOnMobile: true
    },
    { 
      icon: <MdOutlineLocalOffer />, 
      path: '/admin/all-events', 
      label: 'Events',
      color: 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
    },
    { 
      icon: <FiShoppingBag />, 
      path: '/admin/all-products', 
      label: 'Products',
      color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
    },
    { 
      icon: <Box />, 
      path: '/admin/all-orders', 
      label: 'Orders',
      color: 'text-pink-600 hover:text-pink-700 hover:bg-pink-50'
    },
    { 
      icon: <BsFilePerson />, 
      path: '/admin/all-sellers', 
      label: 'Sellers',
      color: 'text-green-600 hover:text-green-700 hover:bg-green-50'
    },
    { 
      icon: <User />, 
      path: '/admin/all-users', 
      label: 'Users',
      color: 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
    },
    { 
      icon: <BiCalendarEvent />, 
      path: '/admin/withdraw-requests', 
      label: 'Withdraw Requests',
      color: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
    },
  ]

  return (
    <header className='top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/60 shadow-sm'>
      <div className='flex items-center justify-between px-3 lg:px-6 py-3 md:py-4'>
        <div className='flex items-center'>
          <Link 
            to={`/`}
            className="group flex items-center space-x-2 md:space-x-3 hover:scale-105 transition-transform duration-200"
          >
            <div className="relative">
              <img 
                src="/MultiMart.png" 
                alt="MultiMart Logo" 
                className='h-8 md:h-10 lg:h-12 object-contain group-hover:brightness-110 transition-all duration-200' 
              />
              <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse ring-1 md:ring-2 ring-white"></div>
            </div>
            <div className="hidden lg:block">
              <h1 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                MultiMart
              </h1>
              <p className="text-xs text-gray-500">MultiMart</p>
            </div>
          </Link>
        </div>

        <div className='flex items-center'>
          <div className='flex items-center space-x-1 sm:hidden'>
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className={`
                  group relative p-2 rounded-lg transition-all duration-200 
                  ${action.color}
                  hover:scale-110 hover:shadow-lg hover:shadow-current/10
                  focus:outline-none focus:ring-2 focus:ring-current/20
                  active:scale-95
                `}
                title={action.label}
              >
                <span className="text-base">
                  {action.icon}
                </span>
                
                {/* Tooltip for mobile */}
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                    {action.label}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Tablet Navigation (showing more icons) */}
          <div className='hidden sm:flex md:hidden items-center space-x-1'>
            {quickActions.slice(0, 5).map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className={`
                  group relative p-2 rounded-xl transition-all duration-200 
                  ${action.color}
                  hover:scale-110 hover:shadow-lg hover:shadow-current/10
                  focus:outline-none focus:ring-2 focus:ring-current/20
                  active:scale-95
                `}
                title={action.label}
              >
                <span className="text-lg">
                  {action.icon}
                </span>
                
                {/* Tooltip */}
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                    {action.label}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop Navigation (showing all icons) */}
          <div className='hidden md:flex items-center space-x-2'>
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className={`
                  group relative p-2 md:p-3 rounded-xl transition-all duration-200 
                  ${action.color}
                  hover:scale-110 hover:shadow-lg hover:shadow-current/10
                  focus:outline-none focus:ring-2 focus:ring-current/20
                  active:scale-95
                `}
                title={action.label}
              >
                <span className="text-lg">
                  {action.icon}
                </span>
                
                {/* Tooltip */}
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                    {action.label}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
    </header>
  )
}

export default AdminHeader