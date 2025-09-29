import { useState, useEffect, useMemo } from 'react'
import DashboardHeader from './ShopLayout/DashboardHeader'
import DashboardSideBar from './ShopLayout/DashboardSideBar'
import { useSelector } from 'react-redux'

const ShopDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { products } = useSelector((state) => state.product)
  const { events } = useSelector((state) => state.event)
  const { orders } = useSelector((state) => state.order)
  const { seller } = useSelector((state) => state.seller)

  const stats = useMemo(() => {
    const withdrawalStats = seller?.transactions?.reduce((acc, t) => {
      acc.totalWithdrawn += t.status === 'Completed' ? t.amount || 0 : 0
      acc.pendingWithdrawals += t.status === 'Processing' ? t.amount || 0 : 0
      return acc
    }, { totalWithdrawn: 0, pendingWithdrawals: 0 }) || { totalWithdrawn: 0, pendingWithdrawals: 0 }

    const availableBalance = seller?.availableBalance || 0
    const totalRevenue = (withdrawalStats.totalWithdrawn + availableBalance) * 0.9

    const orderStats = orders?.reduce((acc, order) => {
      acc.totalOrders++
      if (['delivered', 'received'].includes(order.orderStatus)) acc.deliveredOrders++
      if (['processing', 'shipping', 'transferred to delivery partner', 'on the way'].includes(order.orderStatus)) {
        acc.pendingOrders++
        acc.pendingRevenue += (order.totalPrice || 0) * 0.9
      }
      return acc
    }, { totalOrders: 0, deliveredOrders: 0, pendingOrders: 0, pendingRevenue: 0 }) || 
    { totalOrders: 0, deliveredOrders: 0, pendingOrders: 0, pendingRevenue: 0 }

    return {
      totalRevenue,
      availableBalance,
      ...withdrawalStats,
      ...orderStats,
      avgOrderValue: orderStats.deliveredOrders > 0 ? totalRevenue / orderStats.deliveredOrders : 0,
      withdrawalRequests: seller?.transactions?.length || 0,
      completedWithdrawals: seller?.transactions?.filter(t => t.status === 'Completed').length || 0
    }
  }, [orders, seller])

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(amount)

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

  const recentTransactions = seller?.transactions?.slice(0,5) || []

  const StatCard = ({ title, value, subtitle, icon, trend, color = "gray" }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 font-light text-sm tracking-wide mb-2">{title}</p>
          <p className="text-2xl font-light text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-gray-500 font-light text-xs">{subtitle}</p>
          )}
          {trend && (
            <div className={`inline-flex items-center text-xs font-medium mt-2 px-2 py-1 rounded-full ${
              trend > 0 ? 'text-green-700 bg-green-50' : 'text-gray-600 bg-gray-50'
            }`}>
              {trend > 0 && '↑'} {trend}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          color === 'blue' ? 'bg-blue-50 text-blue-600' :
          color === 'green' ? 'bg-green-50 text-green-600' :
          color === 'purple' ? 'bg-purple-50 text-purple-600' :
          color === 'orange' ? 'bg-orange-50 text-orange-600' :
          'bg-gray-50 text-gray-600'
        }`}>
          {icon}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isMobile={isMobile} />
      
      <div className="flex relative">
        <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${isMobile && isSidebarOpen ? 'fixed inset-0 z-40' : ''} transition-all duration-300 ease-in-out ${isMobile && isSidebarOpen ? 'w-64' : isMobile ? 'w-0' : isSidebarOpen ? 'w-64' : 'w-16 md:w-20'} bg-white shadow-sm border-r border-gray-200 ${isMobile ? 'h-screen' : 'min-h-screen'} overflow-y-auto`}>
          <DashboardSideBar isCollapsed={!isSidebarOpen || (isMobile && !isSidebarOpen)} />
        </div>

        {isMobile && isSidebarOpen && (
          <div className="fixed inset-0 bg-black/20 z-30 md:hidden transition-opacity duration-300" onClick={() => setIsSidebarOpen(false)} />
        )}

        <div className={`flex-1 transition-all duration-300 ease-in-out min-h-screen ${isMobile ? 'ml-0 w-full' : isSidebarOpen ? 'ml-20' : 'md:ml-20'}`}>
          <div className="w-full py-20 px-4 md:px-10" style={{margin: 0, padding: 0}}>
            <div className="max-w-7xl mx-auto px-4 md:px-10 py-20">
              
              {/* Header Section */}
              <div className="mb-8 text-center">
                <div className="inline-block">
                  <p className="text-sm font-medium text-gray-500 tracking-[0.15em] uppercase mb-2 font-mono">
                    Dashboard Overview
                  </p>
                  <h1 className="text-3xl md:text-4xl font-light text-gray-900 leading-[0.9] mb-6">
                    Welcome back, {seller?.name || 'Seller'}
                  </h1>
                  <div className="w-20 h-[1px] bg-gray-900 mx-auto"></div>
                </div>
              </div>

              {/* Featured Balance Card */}
              <div className="mb-12">
                <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-light text-gray-900 mb-2">Available Balance</h3>
                    <div className="w-12 h-[1px] bg-gray-900 mx-auto"></div>
                  </div>
                  
                  <div className="text-center space-y-6">
                    <div className="text-5xl font-light text-gray-900">
                      {formatCurrency(stats.availableBalance)}
                    </div>
                    
                    {(stats.totalWithdrawn > 0 || stats.pendingWithdrawals > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-md mx-auto pt-6 border-t border-gray-100">
                        <div className="text-center">
                          <p className="text-gray-500 font-light text-sm">Total Withdrawn</p>
                          <p className="text-lg font-medium text-gray-900">{formatCurrency(stats.totalWithdrawn)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500 font-light text-sm">Pending Withdrawals</p>
                          <p className="text-lg font-medium text-gray-900">{formatCurrency(stats.pendingWithdrawals)}</p>
                        </div>
                      </div>
                    )}

                    {stats.withdrawalRequests === 0 && stats.availableBalance > 0 && (
                      <div className="pt-6">
                        <button className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200 font-medium tracking-wide">
                          Withdraw Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard 
                  title="Total Products" 
                  value={products?.length || 0} 
                  color="blue"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>}
                />
                
                <StatCard 
                  title="Total Orders" 
                  value={stats.totalOrders} 
                  subtitle={`${stats.deliveredOrders} delivered`}
                  color="green"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 18v-6h2v6H9z" clipRule="evenodd"/></svg>}
                />
                
                <StatCard 
                  title="Total Revenue" 
                  value={formatCurrency(stats.totalRevenue)} 
                  subtitle="After 10% platform fees"
                  color="purple"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>}
                />
                
                <StatCard 
                  title="Active Events" 
                  value={events?.length || 0} 
                  color="orange"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>}
                />
              </div>

              {/* Secondary Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard 
                  title="Pending Orders" 
                  value={stats.pendingOrders} 
                  subtitle="Awaiting processing"
                  color="blue"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>}
                />

                <StatCard 
                  title="Average Order Value" 
                  value={formatCurrency(stats.avgOrderValue)} 
                  subtitle="Your share per order"
                  color="green"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>}
                />

                <StatCard 
                  title="Withdrawal Requests" 
                  value={stats.withdrawalRequests} 
                  subtitle={`${stats.completedWithdrawals} completed`}
                  color="purple"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>}
                />
              </div>

              {/* Recent Transactions Section */}
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-light text-gray-900 mb-2">Recent Transactions</h3>
                  <div className="w-12 h-[1px] bg-gray-900 mx-auto"></div>
                </div>
                
                {recentTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-6 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            transaction.status === 'Completed' ? 'bg-green-500' : 
                            transaction.status === 'Processing' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-900">Withdrawal Request</p>
                            <p className="text-sm text-gray-500 font-light">
                              {new Date(transaction.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'Completed' ? 'bg-green-50 text-green-700' : 
                            transaction.status === 'Processing' ? 'bg-yellow-50 text-yellow-700' : 
                            'bg-gray-50 text-gray-700'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                      <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-light text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-500 font-light">Your withdrawal history will appear here once you make your first withdrawal</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopDashboard