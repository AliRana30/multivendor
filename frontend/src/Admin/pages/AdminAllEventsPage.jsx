import React, { useEffect, useState, useMemo } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Calendar, Trash } from 'lucide-react';
import AdminHeader from '../Components/AdminHeader';
import AdminSideBar from '../Components/AdminSideBar';
import Loader from '../../components/Loader';
import api from '../../components/axiosCongif';

const AdminAllEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
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

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/admin-all-events', { withCredentials: true });
      
      if (response.data.success) {
        setEvents(response.data.events || response.data.adminevents || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch events');
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    if (!isMobile) {
      localStorage.setItem('adminSidebarOpen', JSON.stringify(newState));
    }
  };

  const handleDelete = async (id, eventName) => {
    if (!window.confirm(`Are you sure you want to delete event "${eventName}"? This action cannot be undone.`)) return;
    
    try {
      setDeleteLoading(id);
      const response = await api.delete(`/delete-shop-event/${id}`, { withCredentials: true });
      
      if (response.data.success) {
        toast.success("Event deleted successfully");
        setEvents(prev => prev.filter(event => event._id !== id));
      } else {
        throw new Error(response.data.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to delete event');
    } finally {
      setDeleteLoading(null);
    }
  };

  const createEventSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') 
      .trim();
  };

  const eventStats = useMemo(() => {
    const active = events.filter((e) => e.status === 'active' || !e.status).length;
    const finished = events.filter((e) => e.status === 'finished').length;
    const upcoming = events.filter((e) => new Date(e.start_Date || e.startDate) > new Date()).length;
    
    return { active, finished, upcoming };
  }, [events]);

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
        <span className="text-xs font-medium truncate" title={params.value}>{params.value}</span>
      )
    },
    { 
      field: "price", 
      headerName: "Price", 
      width: 70,
      renderCell: (params) => (
        <span className="font-semibold text-green-600 text-xs">${params.value.replace('US$ ', '')}</span>
      )
    },
    { 
      field: "Stock", 
      headerName: "Stock", 
      width: 60,
      renderCell: (params) => (
        <span className={`px-1 py-0.5 rounded text-xs ${
          params.value > 10 ? 'bg-green-100 text-green-800' : 
          params.value > 0 ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {params.value}
        </span>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      renderCell: (params) => {
        const isDeleting = deleteLoading === params.id;
        const eventNameSlug = createEventSlug(params.row.name);
        
        return (
          <div className="flex items-center gap-0.5">
            <button 
              onClick={() => handleDelete(params.id, params.row.name)}
              disabled={isDeleting}
              className={`p-1 rounded transition-colors ${
                isDeleting ? 'bg-red-100 text-red-400 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'
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
    },
  ];

  const desktopColumns = [
    { 
      field: "id", 
      headerName: "Event ID", 
      minWidth: 120, 
      flex: 0.7,
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
      flex: 1.4,
      renderCell: (params) => (
        <span className="font-medium text-sm" title={params.value}>{params.value}</span>
      )
    },
    { 
      field: "price", 
      headerName: "Price", 
      minWidth: 100, 
      flex: 0.6,
      renderCell: (params) => (
        <span className="font-semibold text-green-600 text-sm">{params.value}</span>
      )
    },
    { 
      field: "Stock", 
      headerName: "Stock", 
      type: "number", 
      minWidth: 80, 
      flex: 0.5,
      renderCell: (params) => (
        <span className={`px-2 py-1 rounded text-xs ${
          params.value > 10 ? 'bg-green-100 text-green-800' : 
          params.value > 0 ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {params.value}
        </span>
      )
    },
    { 
      field: "sold", 
      headerName: "Sold Out", 
      type: "number", 
      minWidth: 100, 
      flex: 0.6,
      renderCell: (params) => (
        <span className="text-blue-600 font-medium text-sm">{params.value}</span>
      )
    },
    {
      field: "shop",
      headerName: "Shop",
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <span className="text-gray-600 text-sm">{params.value}</span>
      )
    },
    {
      field: "startDate",
      headerName: "Start Date",
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <div className="text-sm">
          <div className="font-medium">{params.value ? new Date(params.value).toLocaleDateString() : 'N/A'}</div>
          <div className="text-xs text-gray-500">{params.value ? new Date(params.value).toLocaleTimeString() : ''}</div>
        </div>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => {
        const isDeleting = deleteLoading === params.id;
        const eventNameSlug = createEventSlug(params.row.name);
        
        return (
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handleDelete(params.id, params.row.name)}
              disabled={isDeleting}
              className={`p-1.5 rounded-md transition-colors ${
                isDeleting ? 'bg-red-100 text-red-400 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
              }`}
              title="Delete Event"
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
    },
  ];

  const rows = useMemo(() => 
    events?.map((item) => ({
      id: item._id,
      name: item.name || 'N/A',
      price: "US$ " + (item.discountPrice || item.originalPrice || 0),
      Stock: item.stock || 0,
      sold: item.sold_out || 0,
      shop: item.shop?.name || 'N/A',
      startDate: item.start_Date || item.startDate || null
    })) || [], [events]
  );

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
                  <p className="font-semibold">Error loading events</p>
                  <p className="text-sm">{error}</p>
                  <button 
                    onClick={fetchAllEvents}
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
                      <Calendar className="w-6 md:w-8 h-6 md:h-8 text-blue-600 flex-shrink-0" />
                      <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Event Management</h1>
                        <p className="text-gray-600 mt-1 text-sm">
                          Manage events from all sellers ({events.length} total)
                        </p>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex gap-3 md:gap-4">
                      <div className="text-center">
                        <div className="text-lg md:text-2xl font-bold text-green-600">
                          {eventStats.active}
                        </div>
                        <div className="text-xs text-gray-500">Active</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg md:text-2xl font-bold text-blue-600">
                          {eventStats.upcoming}
                        </div>
                        <div className="text-xs text-gray-500">Upcoming</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg md:text-2xl font-bold text-gray-600">
                          {eventStats.finished}
                        </div>
                        <div className="text-xs text-gray-500">Finished</div>
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
                          sortModel: [{ field: 'startDate', sort: 'desc' }]
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
                        '& .MuiDataGrid-row': {
                          minHeight: isMobile ? '50px' : '70px'
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
  );
};

export default AdminAllEventsPage;