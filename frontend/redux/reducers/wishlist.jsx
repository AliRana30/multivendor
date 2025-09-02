import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  wishlist: localStorage.getItem("wishlist")
    ? JSON.parse(localStorage.getItem("wishlist"))
    : [],
  loading: false,
  error: null,
  success: false,
};

export const wishListReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("addToWishListRequest", (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase("addToWishListSuccess", (state, action) => {
      const item = action.payload;
      const isItemExist = state.wishlist.find((i) => i._id === item._id);

      if (isItemExist) {
        // Update existing item
        state.wishlist = state.wishlist.map((i) =>
          i._id === isItemExist._id ? item : i
        );
      } else {
        // Add new item
        state.wishlist.push(item);
      }

      state.loading = false;
      state.success = true;
      state.error = null;
    })
    .addCase("addToWishListFailure", (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    })
    .addCase("removeFromWishListRequest", (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase("removeFromWishListSuccess", (state, action) => {
      const itemId = action.payload;
      state.wishlist = state.wishlist.filter((item) => item._id !== itemId);
      state.loading = false;
      state.success = true;
      state.error = null;
    })
    .addCase("removeFromWishListFailure", (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    })
    // Clear error and success states
    .addCase("clearWishListErrors", (state) => {
      state.error = null;
      state.success = false;
    });
});