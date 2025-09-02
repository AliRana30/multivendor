import React, { useEffect, useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { AlertTriangle, ShoppingBag } from 'lucide-react';
import AdminSideBar from '../Components/AdminSideBar';
import Loader from '../../components/Loader';
import api from '../../components/axiosCongif';
import AdminHeader from "../Components/AdminHeader";

const AdminAllProductsPage = () => {
  const [products, setProducts] = useState([]);
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

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    if (!isMobile) {
      localStorage.setItem('adminSidebarOpen', JSON.stringify(newState));
    }
  };

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/admin-all-products', { withCredentials: true });
      
      if (response.data.success) {
        setProducts(response.data.products || response.data.adminproducts || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      setDeleteLoading(id);
      const response = await api.delete(`/delete-product/${id}`, { withCredentials: true });
      
      if (response.data.success) {
        toast.success("Product Deleted Successfully");
        setProducts(prev => prev.filter(product => product._id !== id));
      } else {
        throw new Error(response.data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(null);
    }
  };

  const columns = [
    { 
      field: "id", 
      headerName: "Product ID", 
      minWidth: 120, 
      flex: 0.7,
      renderCell: (params) => (
        <span className="font-mono text-xs">{params.value.slice(-8)}</span>
      )
    },
    { 
      field: "name", 
      headerName: "Name", 
      minWidth: 150, 
      flex: 1.4,
      renderCell: (params) => (
        <span className="font-medium text-sm">{params.value}</span>
      )
    },
    { 
      field: "category",
      headerName: "Category",
      minWidth: 100,
      flex: 0.8,
      renderCell: (params) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
          {params.value}
        </span>
      )
    },
    { 
      field: "price", 
      headerName: "Price", 
      minWidth: 80, 
      flex: 0.6,
      renderCell: (params) => (
        <span className="font-semibold text-green-600 text-sm">{params.value}</span>
      )
    },
    { 
      field: "Stock", 
      headerName: "Stock", 
      type: "number", 
      minWidth: 70, 
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
      headerName: "Sold", 
      type: "number", 
      minWidth: 60, 
      flex: 0.4,
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
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      minWidth: 100,
      sortable: false,
      renderCell: (params) => {
        const isDeleting = deleteLoading === params.id;
        return (
          <div className="flex items-center gap-1">
            <Link to={`/products/${params.row.name}`}>
              <Button size="small" className="text-blue-600 hover:bg-blue-50 min-w-0 p-1">
                <AiOutlineEye size={16} />
              </Button>
            </Link>
            <Button 
              onClick={() => handleDelete(params.id)}
              disabled={isDeleting}
              size="small"
              className={`min-w-0 p-1 ${isDeleting ? 'text-red-400' : 'text-red-600 hover:bg-red-50'}`}
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
              ) : (
                <AiOutlineDelete size={16} />
              )}
            </Button>
          </div>
        );
      }
    },
  ];

  const rows = products?.map((item) => ({
    id: item._id,
    name: item.name || 'N/A',
    category: item.category || 'N/A',
    price: "US$ " + (item.discountPrice || item.originalPrice || 0),
    Stock: item.stock || 0,
    sold: item.sold_out || 0,
    shop: item.shop || 'N/A'
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
          flex-1 transition-all duration-300 ease-in-out min-h-screen p-6 pt-20
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
                <p className="font-semibold">Error loading products</p>
                <p className="text-sm">{error}</p>
                <button 
                  onClick={fetchAllProducts}
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
                    <ShoppingBag className="w-8 h-8 text-blue-600" />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                      <p className="text-gray-600 mt-1">
                        Manage products from all sellers ({products.length} total)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {products.filter(p => p.stock > 10).length}
                      </div>
                      <div className="text-xs text-gray-500">In Stock</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {products.filter(p => p.stock > 0 && p.stock <= 10).length}
                      </div>
                      <div className="text-xs text-gray-500">Low Stock</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {products.filter(p => p.stock === 0).length}
                      </div>
                      <div className="text-xs text-gray-500">Out of Stock</div>
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
                  density="compact"
                  sx={{
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid #f3f4f6',
                      padding: '8px 4px',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#f9fafb',
                      borderBottom: '2px solid #e5e7eb',
                      minHeight: '40px !important',
                    },
                    '& .MuiDataGrid-row': {
                      minHeight: '48px !important',
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: '#f8fafc',
                    },
                    '& .MuiDataGrid-columnHeader': {
                      padding: '8px 4px',
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

export default AdminAllProductsPage;