import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import React, { useEffect } from "react";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {toast} from 'react-hot-toast'
import Loader from '../../components/Loader';
import { deleteEvent, getAllEvents } from '../../../redux/actions/event';

const AllEvents = () => {
  const { events , loading } = useSelector((state) => state.event);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  const handleDelete = async (id) => {
    await dispatch(deleteEvent(id));
    toast.success("Event Deleted Successfully")
    dispatch(getAllEvents(seller._id)); 
  };
  
  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllEvents(seller._id));
    }
  }, [dispatch, seller?._id]);

  const columns = [
    { field: "id", headerName: "Product Id", minWidth: 150, flex: 0.7 },
    { field: "name", headerName: "Name", minWidth: 180, flex: 1.4 },
    { field: "price", headerName: "Price", minWidth: 100, flex: 0.6 },
    { field: "Stock", headerName: "Stock", type: "number", minWidth: 80, flex: 0.5 },
    { field: "sold", headerName: "Sold Out", type: "number", minWidth: 130, flex: 0.6 },
    {
      field: "Delete",
      flex: 0.8,
      minWidth: 120,
      headerName: "Delete",
      sortable: false,
      renderCell: (params) => (
        <Button onClick={() => handleDelete(params.id)}>
          <AiOutlineDelete size={20} />
        </Button>
      ),
    },
  ];

  const rows = events?.map((item) => ({
    id: item._id,
    name: item.name,
    price: "US$ " + item.discountPrice,
    Stock: item.stock,
    sold: item.sold_out || 0,
  })) || [];

  return loading ? (<Loader/>) : (
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

export default AllEvents;
