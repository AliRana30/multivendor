import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-hot-toast';
import { deleteCoupon, getAllCoupons } from '../../../redux/actions/coupon';
import Loader from '../../components/Loader';
import ConfirmModal from '../../components/Layout/ConfirmModal';

const AllCoupons = () => {
  const { coupons, loading } = useSelector((state) => state.coupon);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [couponId, setCouponId] = useState("");

  const handleDelete = async (id) => {
    await dispatch(deleteCoupon(id));
    toast.success("Coupon Deleted Successfully");
    dispatch(getAllCoupons(seller._id));
  };
  
  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllCoupons(seller._id));
    }
  }, [dispatch, seller?._id]);

  const columns = [
    { field: "id", headerName: "Coupon Id", minWidth: 150, flex: 0.7 },
    { field: "name", headerName: "Name", minWidth: 180, flex: 1.4 },
    { field: "value", headerName: "Value (%)", minWidth: 100, flex: 0.8 },
    { field: "minAmount", headerName: "Min Amount", minWidth: 120, flex: 0.8 },
    { field: "maxAmount", headerName: "Max Amount", minWidth: 120, flex: 0.8 },
    { field: "selectedProduct", headerName: "Product", minWidth: 150, flex: 1.2 },
    { field: "selectedCategory", headerName: "Category", minWidth: 150, flex: 1.2 },
    {
      field: "Delete",
      flex: 0.8,
      minWidth: 100,
      headerName: "Delete",
      sortable: false,
      renderCell: (params) => (
        <Button onClick={() => { setCouponId(params.id); setOpen(true); }}>
          <AiOutlineDelete size={20} />
        </Button>
      ),
    },
  ];

  const rows = coupons?.map((item) => ({
    id: item._id,
    name: item.name,
    value: item.value + "%",
    minAmount: item.minAmount,
    maxAmount: item.maxAmount,
    selectedProduct: item.selectedProduct,
    selectedCategory: item.category,
  })) || [];

  return (
    <div className="w-full px-4 pt-6">
      {loading ? (
        <Loader />
      ) : (
        <>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            autoHeight
            disableSelectionOnClick
          />
          <ConfirmModal
            isOpen={open}
            onClose={() => setOpen(false)}
            onConfirm={() => handleDelete(couponId)}
            title="Delete Coupon"
            message="Are you sure you want to delete this coupon? This action cannot be undone and will remove the discount for all customers."
            confirmText="Yes, Delete"
          />
        </>
      )}
    </div>
  );
};

export default AllCoupons;
