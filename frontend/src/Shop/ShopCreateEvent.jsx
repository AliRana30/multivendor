import { useState, useEffect } from 'react'
import DashboardHeader from './ShopLayout/DashboardHeader'
import DashboardSideBar from './ShopLayout/DashboardSideBar'
import CreateEvent from './ShopComponents/CreateEvent'

const ShopCreateEvent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setIsSidebarOpen(!mobile)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    
    <div className="min-h-screen bg-gray-100 text-black">
      <DashboardHeader onToggleSidebar={toggleSidebar} isMobile={isMobile} />
      
      <div className="flex relative">
        {/* Sidebar */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isMobile && isSidebarOpen ? 'fixed inset-0 z-40' : ''}
          transition-transform duration-300 ease-in-out
          ${isMobile && isSidebarOpen ? 'w-64' : isMobile ? 'w-0' : isSidebarOpen ? 'w-64' : 'w-20'}
          bg-white shadow-lg h-screen overflow-y-auto
        `}>
          <DashboardSideBar isCollapsed={!isSidebarOpen || (isMobile && !isSidebarOpen)} />
        </div>

        {/* Overlay for mobile */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Content */}
        <div className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isMobile ? 'ml-0' : isSidebarOpen ? 'ml-64' : 'ml-20'}
        `}>
          <div className="p-2  mt-2">
          </div>
          <div className='absolute right-10 w-[60%]'>
            <CreateEvent/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopCreateEvent
