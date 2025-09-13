import React, { useState, useEffect } from 'react';
import Allorders from "./ShopComponents/AllOrders";
import DashboardHeader from "./ShopLayout/DashboardHeader";
import DashboardSideBar from "./ShopLayout/DashboardSideBar";

const ShopAllOrders = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth < 768;
      setIsMobile(isNowMobile);
      setIsSidebarOpen(!isNowMobile); 
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col h-screen text-black bg-gray-100">
      {/* Header */}
      <DashboardHeader onToggleSidebar={toggleSidebar} isMobile={isMobile} />

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`bg-gray-100 border-r transition-all duration-300 ${
            isMobile
              ? isSidebarOpen
                ? 'fixed z-50 top-0 left-0 w-64 h-full'
                : 'hidden'
              : 'w-64'
          }`}
        >
          <DashboardSideBar isCollapsed={!isSidebarOpen && !isMobile} />
        </div>

        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-50 z-40"
            onClick={toggleSidebar}
          ></div>
        )}

        <div className="flex-1 overflow-auto bg-gray-50 p-4 ml-0 md:ml-0">
          <div className="max-w-full mx-auto">
        
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <Allorders />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopAllOrders;