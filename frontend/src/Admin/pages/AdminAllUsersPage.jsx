import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AdminHeader from '../Components/AdminHeader'
import AdminSideBar from '../Components/AdminSideBar'
import { getAllAdminUsers } from '../../../redux/actions/user'
import { DataGrid } from '@mui/x-data-grid'
import Loader from '../../components/Loader'
import { Trash, AlertTriangle, User } from 'lucide-react'
import api from '../../components/axiosCongif'
import toast from 'react-hot-toast'

const AdminAllUsersPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(null) 
  const { adminusers, loading, error } = useSelector((state) => state.user) 
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
    dispatch(getAllAdminUsers()) 
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
      `Are you sure you want to delete user "${userName}"? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    try {
      setDeleteLoading(id); 
      
      await api.delete(`/delete-user/${id}`, { withCredentials: true });
      
      toast.success("User deleted successfully");
      
      dispatch(getAllAdminUsers());
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
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
      field: "role", 
      headerName: "Role", 
      width: 80,
      renderCell: (params) => (
        <span className={`px-1 py-0.5 rounded-full text-xs font-medium ${
          params.value === 'admin' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {params.value}
        </span>
      )
    },
    { 
      field: "delete", 
      headerName: "Actions", 
      width: 70,
      sortable: false,
      renderCell: (params) => {
        const isDeleting = deleteLoading === params.row.id;
        const isCurrentUser = params.row.role === 'admin'; 
        
        return (
          <button
            onClick={() => handleDelete(params.row.id, params.row.name)}
            disabled={isDeleting || isCurrentUser}
            className={`p-1 rounded transition-colors ${
              isCurrentUser
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDeleting
                ? 'bg-red-100 text-red-400 cursor-not-allowed'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
            title={isCurrentUser ? 'Cannot delete admin user' : 'Delete user'}
          >
            {isDeleting ? (
              <div className="w-3 h-3 border border-red-300 border-t-red-600 rounded-full animate-spin" />
            ) : (
              <Trash size={12} />
            )}
          </button>
        )
      }
    },
  ];

  const desktopColumns = [
    { 
      field: "id", 
      headerName: "User ID", 
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
          <User size={16} className="text-gray-400" />
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
      field: "role", 
      headerName: "Role", 
      minWidth: 120, 
      flex: 0.8,
      renderCell: (params) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          params.value === 'admin' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {params.value}
        </span>
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
      field: "delete", 
      headerName: "Actions", 
      minWidth: 100, 
      flex: 0.6,
      sortable: false,
      renderCell: (params) => {
        const isDeleting = deleteLoading === params.row.id;
        const isCurrentUser = params.row.role === 'admin'; 
        
        return (
          <button
            onClick={() => handleDelete(params.row.id, params.row.name)}
            disabled={isDeleting || isCurrentUser}
            className={`p-1.5 rounded-md transition-colors ${
              isCurrentUser
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDeleting
                ? 'bg-red-100 text-red-400 cursor-not-allowed'
                : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
            }`}
            title={isCurrentUser ? 'Cannot delete admin user' : 'Delete user'}
          >
            {isDeleting ? (
              <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
            ) : (
              <Trash size={14} />
            )}
          </button>
        )
      }
    },
  ];

  const rows = adminusers?.map((item) => ({
    id: item._id,
    name: item.name || 'N/A',
    email: item.email || 'N/A',
    joinedAt: item.createdAt,
    phoneNumber: item.phoneNumber || 'N/A', 
    role: item.role || 'user'
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
                  <p className="font-semibold">Error loading users</p>
                  <p className="text-sm">{error}</p>
                  <button 
                    onClick={() => dispatch(getAllAdminUsers())}
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
                      <User className="w-6 md:w-8 h-6 md:h-8 text-blue-600 flex-shrink-0" />
                      <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-600 mt-1 text-sm">
                          Manage all registered users ({adminusers?.length || 0} total)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 md:gap-4">
                      <div className="text-center">
                        <div className="text-lg md:text-2xl font-bold text-purple-600">
                          {adminusers?.filter(u => u.role === 'admin').length || 0}
                        </div>
                        <div className="text-xs text-gray-500">Admins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg md:text-2xl font-bold text-blue-600">
                          {adminusers?.filter(u => u.role === 'user').length || 0}
                        </div>
                        <div className="text-xs text-gray-500">Users</div>
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
                          minWidth: isMobile ? '320px' : '100%'
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

export default AdminAllUsersPage