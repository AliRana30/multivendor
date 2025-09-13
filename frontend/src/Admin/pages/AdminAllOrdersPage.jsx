import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Trash, AlertTriangle, Eye, Package, User } from 'lucide-react';
import AdminHeader from '../Components/AdminHeader';
import AdminSideBar from '../Components/AdminSideBar';
import Loader from '../../components/Loader';
import api from '../../components/axiosCongif';
import { getAllAdminOrders } from '../../../redux/actions/order';

const AdminAllOrdersPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const { adminorders, loading, error } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        // Restore sidebar state for desktop
        const savedState = localStorage.getItem('adminSidebarOpen');
        if (savedState !== null) {
          setIsSidebarOpen(JSON.parse(savedState));
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    dispatch(getAllAdminOrders());
  }, [dispatch]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    if (!isMobile) {
      localStorage.setItem('adminSidebarOpen', JSON.stringify(newState));
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    
    try {
      setDeleteLoading(orderId);
      await api.delete(`/delete-order/${orderId}`, { withCredentials: true });
      toast.success("Order deleted successfully");
      dispatch(getAllAdminOrders());
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete order');
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'processing': 'bg-yellow-100 text-yellow-800',
      'transferred to delivery partner': 'bg-blue-100 text-blue-800',
      'shipping': 'bg-purple-100 text-purple-800',
      'on the way': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800',
      'refund request': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTotalItems = (items) => items?.reduce((total, item) => total + item.quantity, 0) || 0;

  const getItemsDisplay = (items) => {
    if (!items || items.length === 0) return 'No items';
    if (items.length === 1) return items[0].name;
    return `${items[0].name} (+${items.length - 1} more)`;
  };

  const mobileColumns = [
    { 
      field: "id", 
      headerName: "ID", 
      width: 70,
      renderCell: (params) => (
        <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
          #{params.value.slice(-4)}
        </span>
      )
    },
    { 
      field: "customerName", 
      headerName: "Customer", 
      width: 100,
      renderCell: (params) => (
        <span className="text-xs font-medium truncate">{params.value}</span>
      )
    },
    { 
      field: "totalPrice", 
      headerName: "Total", 
      width: 70,
      renderCell: (params) => (
        <span className="font-bold text-green-600 text-xs">
          ${params.value.toFixed(0)}
        </span>
      )
    },
    { 
      field: "orderStatus", 
      headerName: "Status", 
      width: 80,
      renderCell: (params) => {
        const shortStatus = params.value.length > 6 ? params.value.slice(0, 6) + '...' : params.value;
        return (
          <span className={`px-1 py-0.5 rounded text-xs font-medium ${getStatusColor(params.value)}`}>
            {shortStatus}
          </span>
        );
      }
    },
    { 
      field: "actions", 
      headerName: "Actions", 
      width: 70,
      sortable: false,
      renderCell: (params) => {
        const isDeleting = deleteLoading === params.row.id;
        return (
          <div className="flex gap-0.5">
            <Link
              to={`/order/${params.row.id}`}
              className="p-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
            >
              <Eye size={12} />
            </Link>
            <button
              onClick={() => handleDelete(params.row.id)}
              disabled={isDeleting}
              className={`p-1 rounded transition-colors ${
                isDeleting
                  ? 'bg-red-100 text-red-400 cursor-not-allowed'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              {isDeleting ? (
                <div className="w-3 h-3 border border-red-300 border-t-red-600 rounded-full animate-spin" />
              ) : (
                <Trash size={12} />
              )}
            </button>
          </div>
        );
      }
    }
  ];

  const desktopColumns = [
    { 
      field: "id", 
      headerName: "Order ID", 
      minWidth: 120, 
      flex: 0.8,
      renderCell: (params) => (
        <span className="font-mono text-xs font-medium bg-gray-100 px-2 py-1 rounded">
          #{params.value.slice(-8)}
        </span>
      )
    },
    { 
      field: "customerName", 
      headerName: "Customer", 
      minWidth: 150, 
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <User size={16} className="text-gray-400" />
          <span className="font-medium">{params.value}</span>
        </div>
      )
    },
    { 
      field: "customerEmail", 
      headerName: "Email", 
      minWidth: 180, 
      flex: 1.2,
      renderCell: (params) => (
        <span className="text-sm text-gray-600">{params.value}</span>
      )
    },
    { 
      field: "items", 
      headerName: "Items", 
      minWidth: 200, 
      flex: 1.5,
      sortable: false,
      renderCell: (params) => (
        <div className="py-1">
          <div className="font-medium text-sm">{params.value.display}</div>
          <div className="text-xs text-gray-500">
            {params.value.totalQuantity} item(s) • ${params.value.subtotal}
          </div>
        </div>
      )
    },
    { 
      field: "totalPrice", 
      headerName: "Total", 
      minWidth: 100, 
      flex: 0.7,
      renderCell: (params) => (
        <span className="font-bold text-green-600">
          ${params.value.toFixed(2)}
        </span>
      )
    },
    { 
      field: "orderStatus", 
      headerName: "Status", 
      minWidth: 140, 
      flex: 1,
      renderCell: (params) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(params.value)}`}>
          {params.value}
        </span>
      )
    },
    { 
      field: "paymentStatus", 
      headerName: "Payment", 
      minWidth: 100, 
      flex: 0.8,
      renderCell: (params) => {
        const colors = {
          'paid': 'bg-green-100 text-green-800',
          'pending': 'bg-yellow-100 text-yellow-800',
          'failed': 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[params.value] || colors.pending}`}>
            {params.value}
          </span>
        );
      }
    },
    { 
      field: "createdAt", 
      headerName: "Order Date", 
      minWidth: 120, 
      flex: 0.9,
      renderCell: (params) => (
        <div className="text-sm">
          <div className="font-medium">{new Date(params.value).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{new Date(params.value).toLocaleTimeString()}</div>
        </div>
      )
    },
    { 
      field: "actions", 
      headerName: "Actions", 
      minWidth: 120, 
      flex: 0.8,
      sortable: false,
      renderCell: (params) => {
        const isDeleting = deleteLoading === params.row.id;
        return (
          <div className="flex items-center gap-1">
            <Link
              to={`/order/${params.row.id}`}
              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
            >
              <Eye size={14} />
            </Link>
            <button
              onClick={() => handleDelete(params.row.id)}
              disabled={isDeleting}
              className={`p-1.5 rounded-md transition-colors ${
                isDeleting
                  ? 'bg-red-100 text-red-400 cursor-not-allowed'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
              }`}
            >
              {isDeleting ? (
                <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
              ) : (
                <Trash size={14} />
              )}
            </button>
          </div>
        );
      }
    }
  ];

  const rows = adminorders?.map((order) => ({
    id: order._id,
    customerName: user?.name || 'N/A',
    customerEmail: user?.email || 'N/A',
    items: {
      display: getItemsDisplay(order.items),
      totalQuantity: getTotalItems(order.items),
      subtotal: order.subtotal?.toFixed(2) || '0.00'
    },
    totalPrice: order.totalPrice || 0,
    orderStatus: order.orderStatus || 'processing',
    paymentStatus: order.paymentInfo?.paymentStatus || 'pending',
    paymentMethod: order.paymentInfo?.paymentMethod || 'N/A',
    createdAt: order.createdAt,
    shopName: order.shop?.name || 'N/A'
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800">
      <AdminHeader onToggleSidebar={toggleSidebar} isMobile={isMobile} />
      
      <div className="flex relative">
        {/* Sidebar */}
        <div className={`
          transition-all duration-300 ease-in-out
          ${isMobile 
            ? `fixed inset-y-0 left-0 z-40 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64`
            : `${isSidebarOpen ? 'w-64' : 'w-16'} relative`
          }
          bg-white/95 backdrop-blur-sm shadow-xl border-r border-gray-200
          overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
        `}>
          <AdminSideBar isCollapsed={!isSidebarOpen} />
        </div>

        {/* Mobile overlay */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300"
            onClick={toggleSidebar}
          />
        )}

        {/* Main content */}
        <div className="flex-1 min-h-screen overflow-hidden">
          <div className="h-full p-3 md:p-6 pt-20 overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader />
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center h-64">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <div className="text-red-500 text-center">
                  <p className="font-semibold">Error loading orders</p>
                  <p className="text-sm">{error}</p>
                  <button 
                    onClick={() => dispatch(getAllAdminOrders())}
                    className="mt-2 px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
                {/* Header section */}
                <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Package className="w-6 md:w-8 h-6 md:h-8 text-blue-600 flex-shrink-0" />
                      <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Order Management</h1>
                        <p className="text-gray-600 mt-1 text-sm">
                          Manage all customer orders ({adminorders?.length || 0} total)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 md:gap-4">
                      <div className="text-center">
                        <div className="text-lg md:text-2xl font-bold text-green-600">
                          {adminorders?.filter(o => o.orderStatus === 'delivered').length || 0}
                        </div>
                        <div className="text-xs text-gray-500">Delivered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg md:text-2xl font-bold text-yellow-600">
                          {adminorders?.filter(o => o.orderStatus === 'processing').length || 0}
                        </div>
                        <div className="text-xs text-gray-500">Processing</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg md:text-2xl font-bold text-blue-600">
                          {adminorders?.filter(o => o.orderStatus === 'shipping').length || 0}
                        </div>
                        <div className="text-xs text-gray-500">Shipping</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* DataGrid container */}
                <div className="flex-1 p-2 md:p-4 overflow-hidden">
                  <div className="h-full w-full">
                    <DataGrid
                      rows={rows}
                      columns={isMobile ? mobileColumns : desktopColumns}
                      initialState={{
                        pagination: {
                          paginationModel: { page: 0, pageSize: isMobile ? 5 : 10 }
                        },
                        sorting: {
                          sortModel: [{ field: 'createdAt', sort: 'desc' }]
                        }
                      }}
                      pageSizeOptions={isMobile ? [5, 10, 15] : [10, 25, 50, 100]}
                      disableSelectionOnClick
                      className="border-0"
                      rowHeight={isMobile ? 50 : 70}
                      sx={{
                        height: '100%',
                        width: '100%',
                        '& .MuiDataGrid-root': {
                          border: 'none',
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
                        },
                        '& .MuiDataGrid-main': {
                          overflow: 'hidden'
                        },
                        '& .MuiDataGrid-virtualScroller': {
                          overflow: 'auto !important'
                        },
                        '& .MuiDataGrid-virtualScrollerContent': {
                          minWidth: isMobile ? '390px' : '100%'
                        },
                        '& .MuiDataGrid-cell': {
                          borderBottom: '1px solid #f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: 'inherit',
                          padding: isMobile ? '4px 8px' : '8px 16px'
                        },
                        '& .MuiDataGrid-columnHeaders': {
                          backgroundColor: '#f9fafb',
                          borderBottom: '2px solid #e5e7eb',
                          fontSize: 'inherit',
                          minHeight: isMobile ? '40px' : '56px'
                        },
                        '& .MuiDataGrid-columnHeader': {
                          padding: isMobile ? '4px 8px' : '8px 16px'
                        },
                        '& .MuiDataGrid-row:hover': {
                          backgroundColor: '#f8fafc',
                        },
                        '& .MuiDataGrid-footerContainer': {
                          borderTop: '1px solid #e5e7eb',
                          minHeight: isMobile ? '40px' : '52px'
                        },
                        '& .MuiTablePagination-root': {
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
                        },
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                          fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAllOrdersPage;