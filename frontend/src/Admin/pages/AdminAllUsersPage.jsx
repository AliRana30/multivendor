
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AdminHeader from '../Components/AdminHeader'
import AdminSideBar from '../Components/AdminSideBar'
import { getAllAdminUsers } from '../../../redux/actions/user'
import { DataGrid } from '@mui/x-data-grid'
import Loader from '../../components/Loader'
import { Trash, AlertTriangle } from 'lucide-react'
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
      setIsSidebarOpen(!mobile)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    dispatch(getAllAdminUsers()) 
  }, [dispatch])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // FIXED DELETE FUNCTION
  const handleDelete = async (id, userName) => {
    // Confirmation dialog
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
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  }

  const columns = [
    { 
      field: "id", 
      headerName: "User ID", 
      minWidth: 150, 
      flex: 0.7,
      renderCell: (params) => (
        <span className="font-mono text-xs">{params.value.slice(-8)}</span>
      )
    },
    { 
      field: "name", 
      headerName: "Name", 
      minWidth: 180, 
      flex: 1.4,
      renderCell: (params) => (
        <span className="font-medium">{params.value}</span>
      )
    },
    { 
      field: "email", 
      headerName: "Email", 
      minWidth: 200, 
      flex: 1.6 
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
        <span className="text-sm text-gray-600">
          {new Date(params.value).toLocaleDateString()}
        </span>
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDelete(params.row.id, params.row.name)}
              disabled={isDeleting || isCurrentUser}
              className={`p-2 rounded-md transition-colors ${
                isCurrentUser
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isDeleting
                  ? 'bg-red-100 text-red-400 cursor-not-allowed'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
              }`}
              title={isCurrentUser ? 'Cannot delete admin user' : 'Delete user'}
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
              ) : (
                <Trash size={16} />
              )}
            </button>
          </div>
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
      {/* Header */}
      <AdminHeader onToggleSidebar={toggleSidebar} isMobile={isMobile} />
      
      <div className="flex relative">
        {/* Sidebar */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isMobile && isSidebarOpen ? 'fixed inset-0 z-40' : ''}
          transition-all duration-300 ease-in-out
          ${isMobile && isSidebarOpen ? 'w-64' : isMobile ? 'w-0' : isSidebarOpen ? 'w-64' : 'w-16 md:w-20'}
          bg-white/95 backdrop-blur-sm shadow-xl border-r border-gray-200
          ${isMobile ? 'h-screen' : 'min-h-screen'}
          overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
        `}>
          <AdminSideBar isCollapsed={!isSidebarOpen || (isMobile && !isSidebarOpen)} />
        </div>

        {/* Mobile Overlay */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Content */}
        <div className={`
          flex-1 transition-all duration-300 ease-in-out min-h-screen p-6
          ${isMobile ? 'ml-0 w-full' : isSidebarOpen ? 'ml-20' : 'md:ml-20'}
        `}>
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
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-1">
                      Manage all registered users ({adminusers?.length || 0} total)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  autoHeight
                  disableSelectionOnClick
                  className="border-0"
                  sx={{
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid #f3f4f6',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#f9fafb',
                      borderBottom: '2px solid #e5e7eb',
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: '#f8fafc',
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminAllUsersPage