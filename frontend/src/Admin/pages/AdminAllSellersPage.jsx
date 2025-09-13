import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AdminHeader from '../Components/AdminHeader'
import AdminSideBar from '../Components/AdminSideBar'
import { getAllAdminUsers } from '../../../redux/actions/user'
import { DataGrid } from '@mui/x-data-grid'
import Loader from '../../components/Loader'
import { Trash, AlertTriangle, Store, Eye } from 'lucide-react'
import api from '../../components/axiosCongif'
import toast from 'react-hot-toast'
import { getAllAdminSellers } from '../../../redux/actions/seller'
import { Link } from 'react-router-dom'

const AdminAllSellersPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(null) 
  const { adminsellers, loading, error } = useSelector((state) => state.seller) 
  const dispatch = useDispatch()

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsSidebarOpen(false)
      } else {
        const savedState = localStorage.getItem('adminSidebarOpen')
        if (savedState !== null) {
          setIsSidebarOpen(JSON.parse(savedState))
        }
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    dispatch(getAllAdminSellers()) 
  }, [dispatch])

  const toggleSidebar = () => {
    const newState = !isSidebarOpen
    setIsSidebarOpen(newState)
    if (!isMobile) {
      localStorage.setItem('adminSidebarOpen', JSON.stringify(newState))
    }
  }

  const handleDelete = async (id, userName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete seller "${userName}"? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    try {
      setDeleteLoading(id); 
      
      await api.delete(`/delete-shop/${id}`, { withCredentials: true });
      
      toast.success("Shop deleted successfully");
      
      dispatch(getAllAdminSellers());
      
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete seller';
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  }

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
      field: "name", 
      headerName: "Name", 
      width: 100,
      renderCell: (params) => (
        <span className="text-xs font-medium truncate">{params.value}</span>
      )
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
              to={`/shop/${params.row.id}`}
              className="p-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
            >
              <Eye size={12} />
            </Link>
            <button
              onClick={() => handleDelete(params.row.id, params.row.name)}
              disabled={isDeleting}
              className={`p-1 rounded transition-colors ${
                isDeleting
                  ? 'bg-red-100 text-red-400 cursor-not-allowed'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
              title="Delete seller"
            >
              {isDeleting ? (
                <div className="w-3 h-3 border border-red-300 border-t-red-600 rounded-full animate-spin" />
              ) : (
                <Trash size={12} />
              )}
            </button>
          </div>
        )
      }
    },
  ];

  const desktopColumns = [
    { 
      field: "id", 
      headerName: "Seller ID", 
      minWidth: 120, 
      flex: 0.8,
      renderCell: (params) => (
        <span className="font-mono text-xs font-medium bg-gray-100 px-2 py-1 rounded">
          #{params.value.slice(-8)}
        </span>
      )
    },
    { 
      field: "name", 
      headerName: "Name", 
      minWidth: 150, 
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <Store size={16} className="text-gray-400" />
          <span className="font-medium">{params.value}</span>
        </div>
      )
    },
    { 
      field: "email", 
      headerName: "Email", 
      minWidth: 200, 
      flex: 1.6,
      renderCell: (params) => (
        <span className="text-sm text-gray-600">{params.value}</span>
      )
    },
    { 
      field: "joinedAt", 
      headerName: "Joined", 
      minWidth: 120, 
      flex: 1,
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
              to={`/shop/${params.row.id}`}
              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
              title="View shop"
            >
              <Eye size={14} />
            </Link>
            <button
              onClick={() => handleDelete(params.row.id, params.row.name)}
              disabled={isDeleting}
              className={`p-1.5 rounded-md transition-colors ${
                isDeleting
                  ? 'bg-red-100 text-red-400 cursor-not-allowed'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
              }`}
              title="Delete seller"
            >
              {isDeleting ? (
                <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
              ) : (
                <Trash size={14} />
              )}
            </button>
          </div>
        )
      }
    },
  ];

  const rows = adminsellers?.map((item) => ({
    id: item._id,
    name: item.name || 'N/A',
    email: item.email || 'N/A',
    joinedAt: item.createdAt,
    phoneNumber: item.phoneNumber || 'N/A', 
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
              </div>)
             : error && (
             
              <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
                {/* Header section */}
                <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Store className="w-6 md:w-8 h-6 md:h-8 text-blue-600 flex-shrink-0" />
                      <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Seller Management</h1>
                        <p className="text-gray-600 mt-1 text-sm">
                          Manage all registered sellers ({adminsellers?.length || 0} total)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 md:gap-4">
                      <div className="text-center">
                        <div className="text-lg md:text-2xl font-bold text-green-600">
                          {adminsellers?.filter(s => s.isActive !== false).length || 0}
                        </div>
                        <div className="text-xs text-gray-500">Active</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg md:text-2xl font-bold text-blue-600">
                          {adminsellers?.length || 0}
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
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
                          sortModel: [{ field: 'joinedAt', sort: 'desc' }]
                        }
                      }}
                      pageSizeOptions={isMobile ? [5, 10, 15] : [10, 25, 50]}
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
                          minWidth: isMobile ? '240px' : '100%'
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
  )
}

export default AdminAllSellersPage