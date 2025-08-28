import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  coupon: null,
  coupons: [],
  error: null,
  success: false,
  message: null,
};

const couponReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("couponCreateRequest", (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase("couponCreateSuccess", (state, action) => {
      state.loading = false;
      state.coupon = action.payload;
      state.success = true;
    })
    .addCase("couponCreateFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    })

    // Get all coupons
    .addCase("getAllCouponsShopRequest", (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase("getAllCouponsShopSuccess", (state, action) => {
      state.loading = false;
      state.coupons = action.payload;
    })
    .addCase("getAllCouponsShopFailed", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // Delete coupon
    .addCase("deleteCouponRequest", (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase("deleteCouponSuccess", (state, action) => {
      state.loading = false;
      state.message = action.payload;
    })
    .addCase("deleteCouponFailed", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
});

export default couponReducer;
