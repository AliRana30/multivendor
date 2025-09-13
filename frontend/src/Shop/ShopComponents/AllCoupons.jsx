import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import React, { useEffect } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-hot-toast';
import { deleteCoupon, getAllCoupons } from '../../../redux/actions/coupon';
import Loader from '../../components/Loader';

const AllCoupons = () => {
  const { coupons, loading } = useSelector((state) => state.coupon);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

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
        <Button onClick={() => handleDelete(params.id)}>
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

  return loading ? (
    <Loader />
  ) : (
    <div className="w-full px-4 pt-6">
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={10}
        autoHeight
        disableSelectionOnClick
      />
    </div>
  );
};

export default AllCoupons;
