import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  cart: localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart"))
    : [],
};

export const cartReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("addToCartRequest", (state) => {
      state.loading = true;
    })
    .addCase("addToCartSuccess", (state, action) => {
      const item = action.payload;
      const isItemExist = state.cart.find((i) => i._id === item._id);

      if (isItemExist) {
        state.cart = state.cart.map((i) =>
          i._id === isItemExist._id ? item : i
        );
      } else {
        state.cart.push(item);
      }

      state.loading = false;
      state.success = true;
    })
    .addCase("addToCartFailure", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase("removeFromCartRequest", (state) => {
      state.loading = true;
    })
    .addCase("removeFromCartSuccess", (state, action) => {
      const itemId = action.payload;
      state.cart = state.cart.filter((item) => item._id !== itemId);
      state.loading = false;
      state.success = true;
    })
    .addCase("removeFromCartFailure", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase("updateCartQuantity", (state, action) => {
      const { _id, quantity } = action.payload;
      const item = state.cart.find((i) => i._id === _id);

      if (item) {
        item.quantity = quantity;
      }
      localStorage.setItem("cart", JSON.stringify(state.cart));
    });
});
