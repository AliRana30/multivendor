// redux/actions/order.js

import api from "../../src/components/axiosCongif";

export const createOrder = (orderData) => async (dispatch) => {
  try {
    dispatch({ type: "orderCreateRequest" });

    const { data } = await api.post("/create-order", orderData);

    dispatch({
      type: "orderCreateSuccess",
      payload: data.orders, 
    });
    
    return data.orders;
  } catch (error) {
    dispatch({
      type: "orderCreateFail",
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getAllOrders = (shopId) => async (dispatch) => {
  try {
    dispatch({ type: "getAllOrdersShopRequest" });
    
    const { data } = await api.get(`/shop-orders/${shopId}`);
    
    dispatch({
      type: "getAllOrdersShopSuccess",
      payload: data.orders
    });
  } catch (error) {
    dispatch({
      type: "getAllOrdersShopFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const getUserOrders = (userId) => async (dispatch) => {
  try {
    dispatch({ type: "getUserOrdersRequest" });
    
    const { data } = await api.get(`/user-orders/${userId}`);
    
    dispatch({
      type: "getUserOrdersSuccess",
      payload: data.orders
    });
  } catch (error) {
    dispatch({
      type: "getUserOrdersFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};


export const getOrderById = (orderId) => async (dispatch) => {
  try {
    dispatch({ type: "getOrderByIdRequest" });
    
    const { data } = await api.get(`/order/${orderId}`);
    
    dispatch({
      type: "getOrderByIdSuccess",
      payload: data.order
    });
  } catch (error) {
    dispatch({
      type: "getOrderByIdFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const updateOrderStatus = (orderId, orderStatus) => async (dispatch) => {
  try {
    dispatch({ type: "updateOrderStatusRequest" });
    
    const { data } = await api.put(`/order-status/${orderId}`, { orderStatus });
    
    dispatch({
      type: "updateOrderStatusSuccess",
      payload: data.order
    });
    
    return data.order;
  } catch (error) {
    dispatch({
      type: "updateOrderStatusFailed",
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const deleteOrder = (orderId) => async (dispatch) => {
  try {
    dispatch({ type: "deleteOrderRequest" });
    
    const { data } = await api.delete(`/delete-order/${orderId}`);
    
    dispatch({
      type: "deleteOrderSuccess",
      payload: orderId
    });
    
    return data;
  } catch (error) {
    dispatch({
      type: "deleteOrderFailed",
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const cancelOrder = (orderId, reason) => async (dispatch) => {
  try {
    dispatch({ type: "cancelOrderRequest" });
    
    const { data } = await api.post(`/order/${orderId}/cancel`, { reason });
    
    dispatch({
      type: "cancelOrderSuccess",
      payload: data.order
    });
    
    return data.order;
  } catch (error) {
    dispatch({
      type: "cancelOrderFailed",
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const getAllAdminOrders = () => async (dispatch) => {
  try {
    dispatch({ type: "getAllOrdersAdminRequest" });
    
    const { data } = await api.get(`/admin-all-orders`);
    
    dispatch({
      type: "getAllOrdersAdminSuccess",
      payload: data.orders
    });
  } catch (error) {
    dispatch({
      type: "getAllOrdersAdminFailed",
      payload: error.response?.data?.message || error.message,
    });
  }
};