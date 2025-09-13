import { DataGrid } from '@mui/x-data-grid';
import { Button, Chip } from '@mui/material';
import React, { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from 'react-hot-toast';
import Loader from '../../components/Loader';
import { deleteOrder, getAllOrders } from '../../../redux/actions/order';

const Allorders = () => {
  const { orders, loading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        setDeleteLoading(true);
        await dispatch(deleteOrder(id));
        toast.success("Order Deleted Successfully");
        if (seller?._id) {
          dispatch(getAllOrders(seller._id));
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete order");
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Get status color for chips
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

  // Format items display
  const formatItems = (items) => {
    if (!items || !Array.isArray(items)) return 'No items';
    
    if (items.length === 1) {
      return items[0].name || 'Product';
    } else if (items.length === 2) {
      return `${items[0].name || 'Product'}, ${items[1].name || 'Product'}`;
    } else {
      return `${items[0].name || 'Product'} + ${items.length - 1} more`;
    }
  };

  // Calculate total quantity
  const getTotalQuantity = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  };
  
  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllOrders(seller._id));
    }
  }, [dispatch, seller?._id]);

  const columns = [
    { 
      field: "id", 
      headerName: "Order ID", 
      minWidth: 150, 
      flex: 0.7,
    },
    { 
      field: "customer", 
      headerName: "Customer", 
      minWidth: 180, 
      flex: 1.4,
    },
    { 
      field: "items", 
      headerName: "Items", 
      minWidth: 200, 
      flex: 1.2,
    },
    { 
      field: "total", 
      headerName: "Total", 
      minWidth: 100, 
      flex: 0.6,
    },
    { 
      field: "status", 
      headerName: "Status", 
      minWidth: 130, 
      flex: 0.8,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    { 
      field: "itemsQty", 
      headerName: "Quantity", 
      type: "number", 
      minWidth: 80, 
      flex: 0.5,
    },
    { 
      field: "createdAt", 
      headerName: "Order Date", 
      minWidth: 100, 
      flex: 0.6,
    },
    {
      field: "Preview",
      flex: 0.8,
      minWidth: 100,
      headerName: "Preview",
      sortable: false,
      renderCell: (params) => (
        <Link to={`/order/${params.id}`}>
          <Button><AiOutlineEye size={20} /></Button>
        </Link>
      ),
    },
    {
      field: "Delete",
      flex: 0.8,
      minWidth: 120,
      headerName: "Delete",
      sortable: false,
      renderCell: (params) => (
        <Button 
          onClick={() => handleDelete(params.id)}
          disabled={deleteLoading}
        >
          <AiOutlineDelete size={20} />
        </Button>
      ),
    },
  ];

  const rows = orders?.map((order) => {
    const items = order.items || [];
    const customerName = order.user?.name || order.user?.email || 'Unknown Customer';
    const totalAmount = order.totalPrice || 0;
    
    return {
      id: order._id,
      customer: customerName,
      items: formatItems(items),
      total: "US$ " + totalAmount.toFixed(2),
      status: order.orderStatus || 'processing',
      itemsQty: getTotalQuantity(items),
      createdAt: new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
    };
  }) || [];


  return (
    <div className="w-full px-4 pt-6">
      {loading ? (
        <Loader />
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          autoHeight
          disableSelectionOnClick
        />
      )}
    </div>
  );
};

export default Allorders;