import { useState, useEffect } from 'react'
import DashboardHeader from './ShopLayout/DashboardHeader'
import DashboardSideBar from './ShopLayout/DashboardSideBar'
import CreateProduct from './ShopComponents/CreateProduct'

const ShopCreateProduct = () => {
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
          ${isMobile && isSidebarOpen ? 'fixed inset-y-0 left-0 z-[70]' : ''}
          transition-transform duration-300 ease-in-out
          ${isMobile && isSidebarOpen ? 'w-64' : isMobile ? 'w-0' : isSidebarOpen ? 'w-64' : 'w-20'}
          bg-white shadow-xl h-screen overflow-y-auto
        `}>
          <DashboardSideBar isCollapsed={!isSidebarOpen || (isMobile && !isSidebarOpen)} />
        </div>

        {/* Overlay for mobile */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-[60] md:hidden backdrop-blur-sm"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Content */}
        <div className={`
          flex-1 transition-all duration-300 ease-in-out min-h-screen
          ${isMobile ? 'ml-0' : isSidebarOpen ? 'ml-64' : 'ml-20'}
        `}>
          <div className="p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-5xl">
              <CreateProduct/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopCreateProduct
