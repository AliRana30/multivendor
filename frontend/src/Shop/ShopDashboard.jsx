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

  const StatCard = ({ title, value, subtitle, gradient, icon, extraInfo }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-white/80 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="bg-white/20 rounded-lg p-2">
          {icon}
        </div>
      </div>
      {extraInfo && (
        <div className="mt-4 pt-4 border-t border-white/20">
          {extraInfo}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800">
      <DashboardHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isMobile={isMobile} />
      
      <div className="flex relative">
        <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${isMobile && isSidebarOpen ? 'fixed inset-0 z-40' : ''} transition-all duration-300 ease-in-out ${isMobile && isSidebarOpen ? 'w-64' : isMobile ? 'w-0' : isSidebarOpen ? 'w-64' : 'w-16 md:w-20'} bg-white/95 backdrop-blur-sm shadow-xl border-r border-gray-200 ${isMobile ? 'h-screen' : 'min-h-screen'} overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent`}>
          <DashboardSideBar isCollapsed={!isSidebarOpen || (isMobile && !isSidebarOpen)} />
        </div>

        {isMobile && isSidebarOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300" onClick={() => setIsSidebarOpen(false)} />
        )}

        <div className={`flex-1 transition-all duration-300 ease-in-out min-h-screen ${isMobile ? 'ml-0 w-full' : isSidebarOpen ? 'ml-20' : 'md:ml-20'}`}>
          <div className="p-4 md:p-6 lg:p-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Welcome to your dashboard
                  </h1>
                  <p className="text-gray-600 text-sm md:text-base">Manage your shop and track your performance</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium">Available Balance</p>
                      <p className="text-4xl font-bold mb-2">{formatCurrency(stats.availableBalance)}</p>
                    </div>
                    <div className="bg-white/20 rounded-2xl p-4">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  
                  {stats.totalWithdrawn > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-white/80 text-sm">Total Withdrawn:</span>
                        <p className="text-white font-semibold">{formatCurrency(stats.totalWithdrawn)}</p>
                      </div>
                      <div>
                        <span className="text-white/80 text-sm">Pending Withdrawals:</span>
                        <p className="text-white font-semibold">{formatCurrency(stats.pendingWithdrawals)}</p>
                      </div>
                    </div>
                  )}
                  
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                <StatCard 
                  title="Total Products" 
                  value={products?.length || 0} 
                  gradient="from-blue-500 to-blue-600"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>}
                />
                
                <StatCard 
                  title="Total Orders" 
                  value={stats.totalOrders} 
                  subtitle={`${stats.deliveredOrders} delivered`}
                  gradient="from-green-500 to-green-600"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 18v-6h2v6H9z" clipRule="evenodd"/></svg>}
                />
                
                <StatCard 
                  title="Total Revenue (after 10% fees)" 
                  value={formatCurrency(stats.totalRevenue)} 
                  subtitle="All earnings combined"
                  gradient="from-purple-500 to-purple-600"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>}
                />
                
                <StatCard 
                  title="Active Events" 
                  value={events?.length || 0} 
                  gradient="from-orange-500 to-orange-600"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                <StatCard 
                  title="Pending Orders" 
                  value={stats.pendingOrders} 
                  subtitle="Awaiting processing/delivery"
                  gradient="from-emerald-500 to-teal-600"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>}
                />

                <StatCard 
                  title="Avg. Order Value" 
                  value={formatCurrency(stats.avgOrderValue)} 
                  subtitle="Your share per order"
                  gradient="from-indigo-500 to-purple-600"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>}
                />

                <StatCard 
                  title="Withdrawal Requests" 
                  value={stats.withdrawalRequests} 
                  subtitle={`${stats.completedWithdrawals} completed`}
                  gradient="from-rose-500 to-pink-600"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>}
                />
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">Latest 5</div>
                </div>
                
                <div className="space-y-3">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${transaction.status === 'Completed' ? 'bg-green-500' : transaction.status === 'Processing' ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">Withdrawal: {formatCurrency(transaction.amount)}</p>
                            <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.status === 'Completed' ? 'bg-green-100 text-green-800' : transaction.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                          {transaction.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                      <p className="text-sm font-medium">No transactions yet</p>
                      <p className="text-xs text-gray-400 mt-1">Your withdrawal history will appear here</p>
                    </div>
                  )}
                </div>

                {stats.withdrawalRequests === 0 && stats.availableBalance > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-blue-900">Ready to withdraw?</h4>
                          <p className="text-xs text-blue-700 mt-1">You have {formatCurrency(stats.availableBalance)} available for withdrawal</p>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          Withdraw Now
                        </button>
                      </div>
                    </div>
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