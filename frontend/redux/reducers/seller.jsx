import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isSeller: false,
  loading: false,
  seller: null,
  error: null,
  updating: false, 
};

const sellerReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("LoadSellerRequest", (state) => {
      state.loading = true;
    })
    .addCase("LoadSellerSuccess", (state, action) => {
      state.isSeller = true;
      state.loading = false;
      state.seller = action.payload;
    })
    .addCase("LoadSellerFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isSeller = false;
    })

    // get all admin sellers
    .addCase("LoadAdminSellersRequest", (state) => {
      state.loading = true;
    })
    .addCase("LoadAdminSellersSuccess", (state, action) => {
      state.loading = false;
      state.adminsellers = action.payload;
    })
    .addCase("LoadAdminSellersFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isSeller = false;
    })
    // update shop cases
    .addCase("UpdateShopRequest", (state) => {
      state.updating = true;
      state.error = null;
    })
    .addCase("UpdateShopSuccess", (state, action) => {
      state.updating = false;
      state.seller = action.payload;
      state.error = null;
    })
    .addCase("UpdateShopFail", (state, action) => {
      state.updating = false;
      state.error = action.payload;
    })
    .addCase("clearErrors", (state) => {
      state.error = null;
    });
});

export default sellerReducer;