import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { MdOutlineLocalOffer } from 'react-icons/md'
import { AiOutlineGift } from 'react-icons/ai'
import { FiPackage, FiShoppingBag, FiMenu, FiBell } from 'react-icons/fi'
import { BiMessageSquareDetail } from 'react-icons/bi'

const DashboardHeader = ({ onToggleSidebar, isMobile }) => {
  const { seller } = useSelector((state) => state.seller)

  const quickActions = [
    { 
      icon: <MdOutlineLocalOffer />, 
      path: '/shop-dashboard/all-events', 
      label: 'Events',
      color: 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
    },
    { 
      icon: <AiOutlineGift />, 
      path: '/shop-dashboard/all-coupons', 
      label: 'Coupons',
      color: 'text-pink-600 hover:text-pink-700 hover:bg-pink-50'
    },
    { 
      icon: <FiShoppingBag />, 
      path: '/shop-dashboard/all-products', 
      label: 'Products',
      color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
    },
    { 
      icon: <FiPackage />, 
      path: '/shop-dashboard/all-orders', 
      label: 'Orders',
      color: 'text-green-600 hover:text-green-700 hover:bg-green-50'
    },
    { 
      icon: <BiMessageSquareDetail />, 
      path: '/shop-dashboard/all-messages', 
      label: 'Messages',
      color: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
    },
  ]

  return (
    <header className='sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/60 shadow-sm'>
      <div className='flex items-center justify-between px-4 lg:px-6 py-3 md:py-4'>
        {/* Left Section */}
        <div className='flex items-center space-x-4'>
          {/* Mobile menu button */}
          {isMobile && (
            <button 
              onClick={onToggleSidebar}
              className='group p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
              aria-label="Toggle menu"
            >
              <FiMenu className="text-xl group-hover:scale-110 transition-transform duration-200" />
            </button>
          )}
          
          {/* Logo */}
          <Link 
            to={`/shop/${seller}`}
            className="group flex items-center space-x-3 hover:scale-105 transition-transform duration-200"
          >
            <div className="relative">
              <img 
                src="/MultiMart.png" 
                alt="MultiMart Logo" 
                className='h-10 md:h-12 lg:h-14 object-contain group-hover:brightness-110 transition-all duration-200' 
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse ring-2 ring-white"></div>
            </div>
            <div className="hidden md:block">
              <h1 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                MultiMart
              </h1>
              <p className="text-xs text-gray-500">Seller Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Right Section */}
        <div className='flex items-center space-x-2 md:space-x-4'>
          {/* Quick Actions */}
          <div className='hidden sm:flex items-center space-x-1 md:space-x-2'>
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className={`
                  group relative p-2 md:p-3 rounded-xl transition-all duration-200 
                  ${action.color}
                  hover:scale-110 hover:shadow-lg hover:shadow-current/10
                  focus:outline-none focus:ring-2 focus:ring-current/20
                `}
                title={action.label}
              >
                <span className="text-lg md:text-xl">
                  {action.icon}
                </span>
                
                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                    {action.label}
                  </div>
                </div>
              </Link>
            ))}
          </div>


          {/* Mobile Quick Actions Menu */}
          <div className='sm:hidden'>
            <div className="relative group">
              <button className="p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
              </button>
              
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.path}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <span className={action.color.split(' ')[0]}>
                        {action.icon}
                      </span>
                      <span>{action.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
    </header>
  )
}

export default DashboardHeader