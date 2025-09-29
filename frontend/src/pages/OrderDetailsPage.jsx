import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { 
  Button, 
  Chip, 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  AiOutlineArrowLeft, 
  AiOutlineUser, 
  AiOutlinePhone, 
  AiOutlineHome,
  AiOutlineCreditCard,
  AiOutlineCalendar,
  AiOutlineEdit,
  AiOutlineShoppingCart
} from 'react-icons/ai';
import { getOrderById, updateOrderStatus } from '../../redux/actions/order';
import Loader from '../components/Loader';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { order, loading, error } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const validStatuses = [
    "processing", 
    "transferred to delivery partner", 
    "shipping", 
    "received", 
    "on the way", 
    "delivered", 
    "cancelled", 
    "refunded"
  ];

  const getImageUrl = (imageObj) => {
    if (!imageObj) return "/placeholder-image.png";

    if (Array.isArray(imageObj) && imageObj.length > 0) {
      return getImageUrl(imageObj[0]);
    }

    if (imageObj && typeof imageObj === "object" && imageObj.url) {
      return imageObj.url;
    }

    if (typeof imageObj === "string") {
      if (imageObj.startsWith("http://") || imageObj.startsWith("https://")) {
        return imageObj;
      }
      if (imageObj.startsWith("/")) {
        return `http://localhost:5000${imageObj}`;
      }
      return `http://localhost:5000/uploads/${imageObj}`;
    }

    return "/placeholder-image.png";
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return 'warning';
      case 'transferred to delivery partner':
        return 'info';
      case 'shipping':
        return 'primary';
      case 'received':
        return 'success';
      case 'on the way':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'refunded':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getTotalQuantity = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleUpdateStatus = () => {
    if (!selectedStatus) {
      setSnackbar({
        open: true,
        message: 'Please select a status to update',
        severity: 'warning'
      });
      return;
    }
    setDialogOpen(true);
  };

  const confirmStatusUpdate = async () => {
    setUpdating(true);
    try {
      await dispatch(updateOrderStatus(order._id, selectedStatus));
      setSnackbar({
        open: true,
        message: 'Order status updated successfully!',
        severity: 'success'
      });
      setDialogOpen(false);
      setSelectedStatus('');
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update order status',
        severity: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Helper function to check if user is admin
  const isAdmin = () => {
    if (!user || !user.role) return false;
    const role = user.role.toString().toLowerCase().trim();
    return role === 'admin';
  };

  useEffect(() => {
    if (id) {
      dispatch(getOrderById(id));
    }
  }, [dispatch, id, user]);

  useEffect(() => {
    if (order?.orderStatus) {
      setSelectedStatus(order.orderStatus);
    }
  }, [order]);

  useEffect(()=>{
   scrollTo(0,0)
  },[])

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="w-full py-20 px-4 md:px-10 bg-gray-50" style={{margin: 0, padding: 0}}>
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-20">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <div className="w-10 h-10 bg-red-100 rounded-full"></div>
            </div>
            <h3 className="text-2xl font-light text-gray-900 mb-3">Something went wrong</h3>
            <p className="text-gray-500 font-light text-lg mb-8">{error}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/shop-dashboard" className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200 font-medium tracking-wide">
                Back to Shop Dashboard
              </Link>
              {isAdmin() && (
                <Link to="/admin/dashboard" className="px-8 py-3 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors duration-200 font-medium tracking-wide">
                  Back to Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full py-20 px-4 md:px-10 bg-gray-50" style={{margin: 0, padding: 0}}>
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-20">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            </div>
            <h3 className="text-2xl font-light text-gray-900 mb-3">Order not found</h3>
            <p className="text-gray-500 font-light text-lg mb-8">The order you're looking for doesn't exist</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/shop-dashboard" className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200 font-medium tracking-wide">
                Shop Dashboard
              </Link>
              {isAdmin() && (
                <Link to="/admin/dashboard" className="px-8 py-3 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors duration-200 font-medium tracking-wide">
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="w-full py-20 px-4 md:px-10 bg-gray-50" style={{margin: 0, padding: 0}}>
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-20">
        
        {/* Header Section */}
        <div className="mb-16">
          <div className="flex flex-wrap gap-4 mb-8">
            <Link to="/shop-dashboard" className="px-6 py-3 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors duration-200 font-medium tracking-wide">
              ← Back to Shop Dashboard
            </Link>
            {isAdmin() && (
              <Link to="/admin/dashboard" className="px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200 font-medium tracking-wide">
                ← Back to Admin Dashboard
              </Link>
            )}
          </div>
          
          <div className="text-center">
            <div className="inline-block">
              <p className="text-sm font-medium text-gray-500 tracking-[0.15em] uppercase mb-4 font-mono">
                Order Management
              </p>
              <h1 className="text-3xl md:text-4xl font-light text-gray-900 leading-[0.9] mb-6">
                Order Details
              </h1>
              <div className="w-20 h-[1px] bg-gray-900 mx-auto"></div>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
              <p className="text-lg text-gray-600 font-light">#{order._id}</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                getStatusColor(order.orderStatus) === 'success' ? 'bg-green-50 text-green-700' :
                getStatusColor(order.orderStatus) === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                getStatusColor(order.orderStatus) === 'error' ? 'bg-red-50 text-red-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {order.orderStatus || 'Processing'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          
          {/* Order Summary */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-xl font-light text-gray-900 mb-2">Order Summary</h3>
              <div className="w-12 h-[1px] bg-gray-900 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-gray-500 font-light text-sm mb-2">Customer</p>
                <p className="text-lg font-medium text-gray-900">{order.user?.name || order.user?.email || 'Unknown Customer'}</p>
              </div>
              
              <div className="text-center">
                <p className="text-gray-500 font-light text-sm mb-2">Order Date</p>
                <p className="text-lg font-medium text-gray-900">{orderDate}</p>
              </div>
              
              <div className="text-center">
                <p className="text-gray-500 font-light text-sm mb-2">Total Items</p>
                <p className="text-lg font-medium text-gray-900">{getTotalQuantity(order.items)} items</p>
              </div>
              
              <div className="text-center">
                <p className="text-gray-500 font-light text-sm mb-2">Total Amount</p>
                <p className="text-2xl font-light text-gray-900">US$ {(order.totalPrice || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-xl font-light text-gray-900 mb-2">Order Items ({order.items?.length || 0})</h3>
              <div className="w-12 h-[1px] bg-gray-900 mx-auto"></div>
            </div>
            
            {order.items && order.items.length > 0 ? (
              <div className="space-y-6">
                {order.items.map((item, index) => (
                  <div key={index} className="border border-gray-100 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                      <div className="flex justify-center">
                        <img
                          src={getImageUrl(item.product?.images || item.images || item.image)}
                          alt={item.product?.name || item.name || 'Product'}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = "/placeholder-image.png";
                          }}
                        />
                      </div>
                      
                      <div className="text-center md:text-left">
                        <h4 className="font-medium text-gray-900 mb-2">{item.product?.name || item.name || 'Product Name'}</h4>
                        
                        {(item.product?.category || item.category) && (
                          <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mb-2">
                            {item.product?.category || item.category}
                          </span>
                        )}
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          {item.size && <p>Size: {item.size}</p>}
                          {item.color && <p>Color: {item.color}</p>}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-gray-500 font-light text-sm mb-1">Quantity</p>
                        <p className="text-lg font-medium text-gray-900">{item.quantity || 1}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-gray-500 font-light text-sm mb-1">Total Price</p>
                        <p className="text-lg font-medium text-gray-900">US$ {((item.discountPrice || 0) * (item.quantity || 1)).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">US$ {(item.discountPrice || 0).toFixed(2)} each</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
                <h3 className="text-lg font-light text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-500 font-light">This order doesn't contain any items</p>
              </div>
            )}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-8">
              
              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-light text-gray-900 mb-2">Shipping Address</h3>
                    <div className="w-10 h-[1px] bg-gray-900 mx-auto"></div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                    <p className="font-medium text-gray-900">{order.user?.name || 'Customer'}</p>
                    <p className="text-gray-700">{order.shippingAddress.address1}</p>
                    {order.shippingAddress.address2 && (
                      <p className="text-gray-700">{order.shippingAddress.address2}</p>
                    )}
                    <p className="text-gray-700">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    <p className="font-medium text-gray-900">{order.shippingAddress.country}</p>
                    {order.shippingAddress.phoneNumber && (
                      <p className="text-gray-700 flex items-center gap-2">
                        <AiOutlinePhone />
                        {order.shippingAddress.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Information */}
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-light text-gray-900 mb-2">Payment Information</h3>
                  <div className="w-10 h-[1px] bg-gray-900 mx-auto"></div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-gray-500 font-light text-sm mb-1">Payment Method</p>
                    <p className="font-medium text-gray-900">{order.paymentInfo?.type || 'Not specified'}</p>
                  </div>
                  
                  {order.paymentInfo?.status && (
                    <div>
                      <p className="text-gray-500 font-light text-sm mb-1">Payment Status</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        order.paymentInfo.status === 'succeeded' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
                      }`}>
                        {order.paymentInfo.status}
                      </span>
                    </div>
                  )}

                  {order.paymentInfo?.id && (
                    <div>
                      <p className="text-gray-500 font-light text-sm mb-1">Transaction ID</p>
                      <p className="text-sm text-gray-700 font-mono break-all">{order.paymentInfo.id}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              
              {/* Order Timeline */}
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-light text-gray-900 mb-2">Order Timeline</h3>
                  <div className="w-10 h-[1px] bg-gray-900 mx-auto"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-green-900">Order Placed</p>
                        <p className="text-sm text-green-700">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">Completed</span>
                    </div>
                  </div>
                  
                  <div className={`${
                    getStatusColor(order.orderStatus) === 'success' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                  } border rounded-lg p-4`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`font-medium ${
                          getStatusColor(order.orderStatus) === 'success' ? 'text-green-900' : 'text-blue-900'
                        }`}>Current Status</p>
                        <p className={`text-sm ${
                          getStatusColor(order.orderStatus) === 'success' ? 'text-green-700' : 'text-blue-700'
                        }`}>{order.orderStatus || 'Processing'}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        getStatusColor(order.orderStatus) === 'success' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'
                      }`}>Current</span>
                    </div>
                  </div>

                  {order.deliveredAt && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-green-900">Delivered</p>
                          <p className="text-sm text-green-700">
                            {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">Completed</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Totals */}
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-light text-gray-900 mb-2">Order Totals</h3>
                  <div className="w-10 h-[1px] bg-gray-900 mx-auto"></div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">US$ {(order.subTotalPrice || order.totalPrice || 0).toFixed(2)}</span>
                  </div>
                  
                  {order.shippingPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="text-gray-900">US$ {order.shippingPrice.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {order.taxPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-900">US$ {order.taxPrice.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Total:</span>
                      <span className="font-medium text-gray-900 text-lg">US$ {(order.totalPrice || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Update Section */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-xl font-light text-gray-900 mb-2">Update Order Status</h3>
              <div className="w-12 h-[1px] bg-gray-900 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <FormControl fullWidth>
                  <InputLabel>Order Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    label="Order Status"
                    onChange={handleStatusChange}
                    disabled={selectedStatus === "delivered" || selectedStatus === "refunded"}
                  >
                    {validStatuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={status} 
                            color={getStatusColor(status)}
                            size="small"
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              
              <div>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating || !selectedStatus || selectedStatus === order.orderStatus}
                  className={`w-full px-8 py-3 font-medium tracking-wide transition-colors duration-200 ${
                    updating || !selectedStatus || selectedStatus === order.orderStatus
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <div className="text-center">
              <h3 className="text-lg font-light text-gray-900">Confirm Status Update</h3>
            </div>
          </DialogTitle>
          <DialogContent>
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Are you sure you want to update the order status from "{order.orderStatus}" to "{selectedStatus}"?
              </p>
              {selectedStatus === 'delivered' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Setting status to "delivered" will automatically mark the payment as "paid" and set the delivery date.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <div className="flex gap-4 w-full p-4">
              <button 
                onClick={() => setDialogOpen(false)} 
                disabled={updating}
                className="flex-1 px-6 py-3 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors duration-200 font-medium tracking-wide"
              >
                Cancel
              </button>
              <button 
                onClick={confirmStatusUpdate} 
                disabled={updating}
                className={`flex-1 px-6 py-3 font-medium tracking-wide transition-colors duration-200 ${
                  updating 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {updating ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default OrderDetailsPage;