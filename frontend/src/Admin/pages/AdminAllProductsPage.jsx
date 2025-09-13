import React, { useEffect, useState, useMemo, useCallback } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { Link } from "react-router-dom";
import { toast } from 'react-hot-toast';
import { AlertTriangle, ShoppingBag, Eye, Trash } from 'lucide-react';
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

  const createProductSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') 
      .trim();
  };

  const fetchAllProducts = useCallback(async () => {
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
  }, []);

  const handleDelete = useCallback(async (id) => {
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
  }, []);

  const productStats = useMemo(() => {
    const inStock = products.filter((p) => p.stock > 10).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    
    return { inStock, lowStock, outOfStock };
  }, [products]);

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
        const productNameSlug = createProductSlug(params.row.name);
        
        return (
          <div className="flex items-center gap-0.5">
            <Link to={`/products/${productNameSlug}`} state={{ productId: params.id }}>
              <button className="p-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors">
                <Eye size={12} />
              </button>
            </Link>
            <button 
              onClick={() => handleDelete(params.id)}
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

  const desktopColumns = useMemo(() => [
    { 
      field: "id", 
      headerName: "Product ID", 
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
        <span className="font-medium text-sm" title={params.value}>
          {params.value}
        </span>
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
        const productNameSlug = createProductSlug(params.row.name);
        
        return (
          <div className="flex items-center gap-1">
            <Link to={`/products/${productNameSlug}`} state={{ productId: params.id }}>
              <button 
                className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                title="View Product"
              >
                <Eye size={14} />
              </button>
            </Link>
            <button 
              onClick={() => handleDelete(params.id)}
              disabled={isDeleting}
              className={`p-1.5 rounded-md transition-colors ${
                isDeleting ? 'bg-red-100 text-red-400 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
              }`}
              title="Delete Product"
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
  ], [deleteLoading, handleDelete]);

  const rows = useMemo(() => 
    products?.map((item) => ({
      id: item._id,
      name: item.name || 'N/A',
      category: item.category || 'N/A',
      price: "US$ " + (item.discountPrice || item.originalPrice || 0),
      Stock: item.stock || 0,
      sold: item.sold_out || 0,
      shop: item.shop || 'N/A'
    })) || [], [products]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800">
      <AdminHeader onToggleSidebar={toggleSidebar} isMobile={isMobile} />
      
      <div className="flex relative">
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

        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300"
            onClick={toggleSidebar}
          />
        )}

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
              <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-6 md:w-8 h-6 md:h-8 text-blue-600 flex-shrink-0" />
                      <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Product Management</h1>
                        <p className="text-gray-600 mt-1 text-sm">
                          Manage products from all sellers ({products.length} total)
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-3 md:gap-4">
                      <div className="text-center">
                        <div className="text-lg md:text-2xl font-bold text-green-600">
                          {productStats.inStock}
                        </div>
                        <div className="text-xs text-gray-500">In Stock</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg md:text-2xl font-bold text-yellow-600">
                          {productStats.lowStock}
                        </div>
                        <div className="text-xs text-gray-500">Low Stock</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg md:text-2xl font-bold text-red-600">
                          {productStats.outOfStock}
                        </div>
                        <div className="text-xs text-gray-500">Out of Stock</div>
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
                          paginationModel: { page: 0, pageSize: isMobile ? 5 : 10 },
                        },
                        sorting: {
                          sortModel: [{ field: 'name', sort: 'asc' }]
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
                          minWidth: isMobile ? '380px' : '100%'
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

export default AdminAllProductsPage;