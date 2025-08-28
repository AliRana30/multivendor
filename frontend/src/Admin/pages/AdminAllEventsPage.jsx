import React, { useEffect, useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { AlertTriangle, Calendar } from 'lucide-react';
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
      setIsSidebarOpen(!mobile);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;

    try {
      setDeleteLoading(id);
      const response = await api.delete(`/delete-event/${id}`, { withCredentials: true });
      
      if (response.data.success) {
        toast.success("Event Deleted Successfully");
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

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const columns = [
    { 
      field: "id", 
      headerName: "Event ID", 
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
      field: "price", 
      headerName: "Price", 
      minWidth: 100, 
      flex: 0.6,
      renderCell: (params) => (
        <span className="font-semibold text-green-600">{params.value}</span>
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
      minWidth: 130, 
      flex: 0.6,
      renderCell: (params) => (
        <span className="text-blue-600 font-medium">{params.value}</span>
      )
    },
    {
      field: "shop",
      headerName: "Shop",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <span className="text-gray-600">{params.value}</span>
      )
    },
  ];

  const rows = events?.map((item) => ({
    id: item._id,
    name: item.name || 'N/A',
    price: "US$ " + (item.discountPrice || item.originalPrice || 0),
    Stock: item.stock || 0,
    sold: item.sold_out || 0,
    shop: item.shop?.name || 'N/A'
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800">
      <AdminHeader onToggleSidebar={toggleSidebar} isMobile={isMobile} />
      
      <div className="flex relative">
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

        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
            onClick={toggleSidebar}
          />
        )}

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
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-blue-600" />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
                      <p className="text-gray-600 mt-1">
                        Manage events from all sellers ({events.length} total)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <DataGrid
                  rows={rows}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 10 }
                    }
                  }}
                  pageSizeOptions={[10, 25, 50]}
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
  );
};

export default AdminAllEventsPage;