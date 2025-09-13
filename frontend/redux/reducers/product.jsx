import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  product: null,
  products: [],
  error: null,
  success: false,
  message: null,
  reviewLoading: false,
  reviewError: null,
  reviewSuccess: false,
  reviewMessage: null,
  reviews: [],
  allProducts: [],
  allProductsLoading: false,
  allProductsError: null,
};

const productReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("productCreateRequest", (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase("productCreateSuccess", (state, action) => {
      state.loading = false;
      state.product = action.payload;
      state.success = true;
    })
    .addCase("productCreateFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    })

    // get products of shop
    .addCase("getAllProductsShopRequest", (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase("getAllProductsShopSuccess", (state, action) => {
      state.loading = false;
      state.products = action.payload;
      state.error = null;
    })
    .addCase("getAllProductsShopFailed", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // get ALL products from ALL sellers 
    .addCase("getAllProductsRequest", (state) => {
      state.allProductsLoading = true;
      state.allProductsError = null;
    })
    .addCase("getAllProductsSuccess", (state, action) => {
      state.allProductsLoading = false;
      state.allProducts = action.payload;
      state.allProductsError = null;
    })
    .addCase("getAllProductsFailed", (state, action) => {
      state.allProductsLoading = false;
      state.allProductsError = action.payload;
    })

    //update product stock
    .addCase("updateProductStockRequest", (state) => {
      state.loading = true;
    })
    .addCase("updateProductStockSuccess", (state, action) => {
      state.loading = false;
      state.message = action.payload;
    })
    .addCase("updateProductStockFailed", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    //delete a product from shop
    .addCase("deleteProductRequest", (state) => {
      state.loading = true;
    })
    .addCase("deleteProductSuccess", (state, action) => {
      state.loading = false;
      state.message = action.payload;
    })
    .addCase("deleteProductFailed", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // create product review
    .addCase("productReviewCreateRequest", (state) => {
      state.reviewLoading = true;
      state.reviewError = null;
      state.reviewSuccess = false;
      state.reviewMessage = null;
    })
    .addCase("productReviewCreateSuccess", (state, action) => {
      state.reviewLoading = false;
      state.reviewSuccess = true;
      state.reviewMessage = action.payload.message;
      if (action.payload.product) {
        state.product = action.payload.product;
      }
    })
    .addCase("productReviewCreateFail", (state, action) => {
      state.reviewLoading = false;
      state.reviewError = action.payload;
      state.reviewSuccess = false;
    })

    // Get product reviews
    .addCase("getProductReviewsRequest", (state) => {
      state.reviewLoading = true;
      state.reviewError = null;
    })
    .addCase("getProductReviewsSuccess", (state, action) => {
      state.reviewLoading = false;
      state.reviews = action.payload;
    })
    .addCase("getProductReviewsFail", (state, action) => {
      state.reviewLoading = false;
      state.reviewError = action.payload;
    })

    // Clear errors and reset states
    .addCase("clearErrors", (state) => {
      state.error = null;
      state.allProductsError = null;
      state.reviewError = null;
    })
    .addCase("clearMessages", (state) => {
      state.message = null;
      state.reviewMessage = null;
    });
});

export default productReducer;