import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  order: null,          
  orders: [],         
  error: null,
  success: false,
};

export const orderReducer = createReducer(initialState, (builder) => {
    builder
    .addCase('orderCreateRequest', (state) => {
        state.loading = true;
        state.error = null;
    })
    .addCase('orderCreateSuccess', (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.error = null;
    })
    .addCase('orderCreateFail', (state, action) => {
        state.loading = false;
        state.error = action.payload;
    })
    .addCase('getAllOrdersShopRequest', (state) => {
        state.loading = true;
        state.error = null;
    })
    .addCase('getAllOrdersShopSuccess', (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.error = null;
    })
    .addCase('getAllOrdersShopFailed', (state, action) => {
        state.loading = false;
        state.error = action.payload;

    // get all orders for admin
    }).addCase('getAllOrdersAdminRequest', (state) => {
        state.loading = true;
        state.error = null;
    })
    .addCase('getAllOrdersAdminSuccess', (state, action) => {
        state.loading = false;
        state.adminorders = action.payload;
        state.error = null;
    })
    .addCase('getAllOrdersAdminFailed', (state, action) => {
        state.loading = false;
        state.error = action.payload;
    })
    // Add the user orders cases
    .addCase('getUserOrdersRequest', (state) => {
        state.loading = true;
        state.error = null;
    })
    .addCase('getUserOrdersSuccess', (state, action) => {
        state.loading = false;
        state.orders = action.payload; 
        state.error = null;
    })
    .addCase('getUserOrdersFailed', (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.orders = []; 
    })
    // Add getOrderById cases
    .addCase('getOrderByIdRequest', (state) => {
        state.loading = true;
        state.error = null;
    })
    .addCase('getOrderByIdSuccess', (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.error = null;
    })
    .addCase('getOrderByIdFailed', (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.order = null;
    })
    // Add updateOrderStatus cases
    .addCase('updateOrderStatusRequest', (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
    })
    .addCase('updateOrderStatusSuccess', (state, action) => {
        state.loading = false;
        state.order = action.payload;
        state.error = null;
        state.success = true;
        const orderIndex = state.orders.findIndex(order => order._id === action.payload._id);
        if (orderIndex !== -1) {
            state.orders[orderIndex] = action.payload;
        }
    })
    .addCase('updateOrderStatusFailed', (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
    });
})