import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllAdminOrders } from '../../../redux/actions/order'
import { getAllAdminSellers } from '../../../redux/actions/seller'
import { getAllAdminUsers } from '../../../redux/actions/user'
import { getAllEventsFromAllSellers } from '../../../redux/actions/event'
import { getAllProducts } from '../../../redux/actions/product'

const AdminDashboardMain = () => {
  const {allProducts} = useSelector((state) => state.product);
  const {adminevents} = useSelector((state) => state.event);
  const {adminsellers} = useSelector((state) => state.seller);
  const {adminorders} = useSelector((state) => state.order);
  const {users} = useSelector((state) => state.user);
  const dispatch = useDispatch()

  const orderStats = useMemo(() => {
    if (!adminorders || !Array.isArray(adminorders)) {
      return {
        totalRevenue: 0,
        deliveredOrders: 0,
        pendingOrders: 0,
        totalOrders: 0
      };
    }

    const stats = adminorders.reduce((acc, order) => {
      acc.totalOrders += 1;

      if (order.orderStatus === 'delivered') {
        acc.totalRevenue += order.totalPrice * 0.1 || 0;
        acc.deliveredOrders += 1;
      }

      if (['processing', 'shipping', 'transferred to delivery partner', 'on the way'].includes(order.orderStatus)) {
        acc.pendingOrders += 1;
      }

      return acc;
    }, {
      totalRevenue: 0,
      deliveredOrders: 0,
      pendingOrders: 0,
      totalOrders: 0
    });

    return stats;
  }, [adminorders]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    dispatch(getAllAdminOrders());
    dispatch(getAllAdminSellers());
    dispatch(getAllAdminUsers());
    dispatch(getAllEventsFromAllSellers());
    dispatch(getAllProducts()); 
  }, [dispatch])

  const StatCard = ({ title, value, subtitle, icon, color = "gray" }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 font-light text-sm tracking-wide mb-2">{title}</p>
          <p className="text-2xl font-light text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-gray-500 font-light text-xs">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          color === 'blue' ? 'bg-blue-50 text-blue-600' :
          color === 'green' ? 'bg-green-50 text-green-600' :
          color === 'purple' ? 'bg-purple-50 text-purple-600' :
          color === 'orange' ? 'bg-orange-50 text-orange-600' :
          color === 'cyan' ? 'bg-cyan-50 text-cyan-600' :
          color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
          color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
          'bg-gray-50 text-gray-600'
        }`}>
          {icon}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-20">
        
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-block">
            <p className="text-sm font-medium text-gray-500 tracking-[0.15em] uppercase mb-2 font-mono">
              Platform Overview
            </p>
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 leading-[0.9] mb-6">
              Admin Dashboard
            </h1>
            <div className="w-20 h-[1px] bg-gray-900 mx-auto"></div>
          </div>
        </div>

        {/* System Status */}
        <div className="mb-12">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            <div className="text-center space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-md mx-auto pt-6 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-gray-500 font-light text-sm">Platform Revenue</p>
                  <p className="text-lg font-medium text-gray-900">{formatCurrency(orderStats.totalRevenue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 font-light text-sm">Total Users</p>
                  <p className="text-lg font-medium text-gray-900">{users?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            title="Total Products" 
            value={allProducts?.length || 0} 
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            }
          />
          
          <StatCard 
            title="Total Sellers" 
            value={adminsellers?.length || 0} 
            color="cyan"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
            }
          />
          
          <StatCard 
            title="Total Orders" 
            value={orderStats.totalOrders} 
            subtitle={`${orderStats.deliveredOrders} delivered`}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 18v-6h2v6H9z" clipRule="evenodd"/>
              </svg>
            }
          />
          
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(orderStats.totalRevenue)} 
            subtitle="Platform commission"
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
              </svg>
            }
          />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard 
            title="Active Events" 
            value={adminevents?.length || 0} 
            color="orange"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
            }
          />

          <StatCard 
            title="Pending Orders" 
            value={orderStats.pendingOrders} 
            subtitle="Awaiting processing"
            color="emerald"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
            }
          />

          <StatCard 
            title="Average Order Value" 
            value={
              orderStats.deliveredOrders > 0 
                ? formatCurrency((orderStats.totalRevenue / orderStats.deliveredOrders) / 0.1)
                : '$0.00'
            } 
            subtitle="Platform commission rate"
            color="indigo"
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
            }
          />
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-light text-gray-900 mb-2">Platform Insights</h3>
            <div className="w-12 h-[1px] bg-gray-900 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Orders Overview */}
            <div className="text-center p-6 border border-gray-100 rounded-lg">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM9 18v-6h2v6H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <h4 className="text-lg font-light text-gray-900 mb-2">Order Management</h4>
              <p className="text-gray-500 font-light text-sm mb-4">
                Track and manage all orders across the platform
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Orders</span>
                  <span className="font-medium">{orderStats.totalOrders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivered</span>
                  <span className="font-medium text-green-600">{orderStats.deliveredOrders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pending</span>
                  <span className="font-medium text-yellow-600">{orderStats.pendingOrders}</span>
                </div>
              </div>
            </div>

            {/* Sellers Overview */}
            <div className="text-center p-6 border border-gray-100 rounded-lg">
              <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-100">
                <svg className="w-8 h-8 text-cyan-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
              </div>
              <h4 className="text-lg font-light text-gray-900 mb-2">Seller Network</h4>
              <p className="text-gray-500 font-light text-sm mb-4">
                Manage seller accounts and performance
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active Sellers</span>
                  <span className="font-medium">{adminsellers?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Products Listed</span>
                  <span className="font-medium text-blue-600">{allProducts?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Events Active</span>
                  <span className="font-medium text-orange-600">{adminevents?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Revenue Overview */}
            <div className="text-center p-6 border border-gray-100 rounded-lg">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-100">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h4 className="text-lg font-light text-gray-900 mb-2">Revenue Analytics</h4>
              <p className="text-gray-500 font-light text-sm mb-4">
                Monitor platform revenue and commissions
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Revenue</span>
                  <span className="font-medium">{formatCurrency(orderStats.totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Commission Rate</span>
                  <span className="font-medium text-purple-600">10%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Avg Order</span>
                  <span className="font-medium text-indigo-600">
                    {orderStats.deliveredOrders > 0 
                      ? formatCurrency((orderStats.totalRevenue / orderStats.deliveredOrders) / 0.1)
                      : '$0.00'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminDashboardMain