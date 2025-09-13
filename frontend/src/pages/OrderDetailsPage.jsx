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
  
  // State for status update
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
    console.log('User role:', role); // Debug log
    return role === 'admin';
  };

  useEffect(() => {
    if (id) {
      dispatch(getOrderById(id));
      console.log('User role check:', user?.role?.toString());
      console.log('Is admin:', isAdmin());
    }
  }, [dispatch, id, user]);

  useEffect(() => {
    if (order?.orderStatus) {
      setSelectedStatus(order.orderStatus);
    }
  }, [order]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="w-full px-4 pt-6">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Link to={`/shop-dashboard`} style={{ textDecoration: 'none' }}>
            <Button startIcon={<AiOutlineArrowLeft />} variant="outlined">
              Back to Shop Dashboard
            </Button>
          </Link>
          {isAdmin() && (
            <Link to={`/admin/dashboard`} style={{ textDecoration: 'none' }}>
              <Button startIcon={<AiOutlineArrowLeft />} variant="contained" color="primary">
                Back to Admin Dashboard
              </Button>
            </Link>
          )}
        </Box>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full px-4 pt-6">
        <Typography variant="h6" color="error">
          Order not found
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Link to="/shop-dashboard" style={{ textDecoration: 'none' }}>
            <Button startIcon={<AiOutlineArrowLeft />} variant="outlined">
              Shop Dashboard
            </Button>
          </Link>
          {isAdmin() && (
            <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
              <Button startIcon={<AiOutlineArrowLeft />} variant="contained" color="primary">
                Admin Dashboard
              </Button>
            </Link>
          )}
        </Box>
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Link to="/shop-dashboard" style={{ textDecoration: 'none' }}>
            <Button 
              startIcon={<AiOutlineArrowLeft />} 
              variant="outlined"
            >
              Back to Shop Dashboard
            </Button>
          </Link>
          {isAdmin() && (
            <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
              <Button 
                startIcon={<AiOutlineArrowLeft />} 
                variant="contained" 
                color="primary"
              >
                Back to Admin Dashboard
              </Button>
            </Link>
          )}
        </Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Order Details
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" color="text.secondary">
            #{order._id}
          </Typography>
          <Chip 
            label={order.orderStatus || 'Processing'} 
            color={getStatusColor(order.orderStatus)}
            size="medium"
          />
        </Box>
      </Box>

      {/* Single Card with All Content */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Order Summary Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AiOutlineCalendar />
              Order Summary
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AiOutlineUser />
                  <Typography variant="subtitle2" color="text.secondary">
                    Customer
                  </Typography>
                </Box>
                <Typography variant="h6">
                  {order.user?.name || order.user?.email || 'Unknown Customer'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Order Date
                </Typography>
                <Typography variant="body1">
                  {orderDate}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Items
                </Typography>
                <Typography variant="h6">
                  {getTotalQuantity(order.items)} items
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Amount
                </Typography>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  US$ {(order.totalPrice || 0).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Order Items Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AiOutlineShoppingCart />
              Order Items ({order.items?.length || 0})
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {order.items && order.items.length > 0 ? (
              <Grid container spacing={2}>
                {order.items.map((item, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3} md={2}>
                          <CardMedia
                            component="img"
                            sx={{
                              width: '100%',
                              height: 120,
                              objectFit: 'cover',
                              borderRadius: 2,
                              border: '1px solid #e0e0e0'
                            }}
                            image={getImageUrl(item.product?.images || item.images || item.image)}
                            alt={item.product?.name || item.name || 'Product'}
                            onError={(e) => {
                              e.target.src = "/placeholder-image.png";
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={9} md={10}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="h6" gutterBottom>
                                {item.product?.name || item.name || 'Product Name'}
                              </Typography>
                              
                              {(item.product?.category || item.category) && (
                                <Chip 
                                  label={item.product?.category || item.category}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mb: 1 }}
                                />
                              )}
                              
                              {item.size && (
                                <Typography variant="body2" color="text.secondary">
                                  Size: {item.size}
                                </Typography>
                              )}
                              
                              {item.color && (
                                <Typography variant="body2" color="text.secondary">
                                  Color: {item.color}
                                </Typography>
                              )}
                            </Grid>
                            
                            <Grid item xs={6} md={3}>
                              <Typography variant="subtitle2" color="text.secondary">
                                Quantity
                              </Typography>
                              <Typography variant="h6">
                                {item.quantity || 1}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={6} md={3}>
                              <Typography variant="subtitle2" color="text.secondary">
                                Unit Price
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                US$ {(item.discountPrice || 0).toFixed(2)}
                              </Typography>
                              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                Total: US$ {((item.discountPrice || 0) * (item.quantity || 1)).toFixed(2)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No items found in this order
                </Typography>
              </Box>
            )}
          </Box>

          {/* Two Column Layout for Address, Payment, Timeline, and Totals */}
          <Grid container spacing={4}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              {/* Shipping Address Section */}
              {order.shippingAddress && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AiOutlineHome />
                    Shipping Address
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {order.user?.name || 'Customer'}
                    </Typography>
                    
                    <Typography variant="body2">
                      {order.shippingAddress.address1}
                    </Typography>
                    
                    {order.shippingAddress.address2 && (
                      <Typography variant="body2">
                        {order.shippingAddress.address2}
                      </Typography>
                    )}
                    
                    <Typography variant="body2">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </Typography>
                    
                    <Typography variant="body2" fontWeight="medium">
                      {order.shippingAddress.country}
                    </Typography>
                    
                    {order.shippingAddress.phoneNumber && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <AiOutlinePhone />
                        <Typography variant="body2">
                          {order.shippingAddress.phoneNumber}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Payment Information Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AiOutlineCreditCard />
                  Payment Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Payment Method
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {order.paymentInfo?.type || 'Not specified'}
                    </Typography>
                  </Box>
                  
                  {order.paymentInfo?.status && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Payment Status
                      </Typography>
                      <Chip 
                        label={order.paymentInfo.status} 
                        color={order.paymentInfo.status === 'succeeded' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  )}

                  {order.paymentInfo?.id && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Transaction ID
                      </Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {order.paymentInfo.id}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
              {/* Order Timeline Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Order Timeline
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2,
                    bgcolor: 'success.light',
                    borderRadius: 1,
                    color: 'white'
                  }}>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        Order Placed
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                    <Chip 
                      label="Completed" 
                      size="small"
                      sx={{ bgcolor: 'white', color: 'success.main' }}
                    />
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2,
                    bgcolor: getStatusColor(order.orderStatus) === 'success' ? 'success.main' : 'primary.main',
                    borderRadius: 1,
                    color: 'white'
                  }}>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        Current Status
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {order.orderStatus || 'Processing'}
                      </Typography>
                    </Box>
                    <Chip 
                      label="Current" 
                      size="small"
                      sx={{ bgcolor: 'white', color: 'text.primary' }}
                    />
                  </Box>

                  {order.deliveredAt && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 2,
                      bgcolor: 'success.main',
                      borderRadius: 1,
                      color: 'white'
                    }}>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          Delivered
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                      <Chip 
                        label="Completed" 
                        size="small"
                        sx={{ bgcolor: 'white', color: 'success.main' }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Order Totals Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Order Totals
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">
                      US$ {(order.subTotalPrice || order.totalPrice || 0).toFixed(2)}
                    </Typography>
                  </Box>
                  
                  {order.shippingPrice && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Shipping:</Typography>
                      <Typography variant="body2">
                        US$ {order.shippingPrice.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  
                  {order.taxPrice && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Tax:</Typography>
                      <Typography variant="body2">
                        US$ {order.taxPrice.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="bold">Total:</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      US$ {(order.totalPrice || 0).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Status Update Section */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AiOutlineEdit />
              Update Order Status
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Order Status</InputLabel>
                  <Select
                    value={selectedStatus}
                    label="Order Status"
                    onChange={handleStatusChange}
                    disabled={selectedStatus == "delivered" || selectedStatus == "refunded"}
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
              </Grid>
              
              <Grid item xs={12} sm={4} md={6}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdateStatus}
                  disabled={updating || !selectedStatus || selectedStatus === order.orderStatus}
                  startIcon={<AiOutlineEdit />}
                  size="large"
                  sx={{ minWidth: 150 }}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Status Update
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to update the order status from "{order.orderStatus}" to "{selectedStatus}"?
            {selectedStatus === 'delivered' && (
              <Typography component="div" sx={{ mt: 2, color: 'warning.main' }}>
                <strong>Note:</strong> Setting status to "delivered" will automatically mark the payment as "paid" and set the delivery date.
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={updating}>
            Cancel
          </Button>
          <Button 
            onClick={confirmStatusUpdate} 
            autoFocus 
            variant="contained"
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Confirm Update'}
          </Button>
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
    </Box>
  );
};

export default OrderDetailsPage;