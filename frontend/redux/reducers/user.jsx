import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  loading: false,
  user: null,
  error: null,
  addressLoading: false,
  adminusers: [],
};

const userReducer = createReducer(initialState, (builder) => {
  builder
    // Load User Cases
    .addCase("LoadUserRequest", (state) => {
      state.loading = true;
    })
    .addCase("LoadUserSuccess", (state, action) => {
      state.isAuthenticated = true;
      state.loading = false;
      state.user = action.payload;
    })
    .addCase("LoadUserFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    })
    
    // get all admin users 
    .addCase("LoadAdminUsersRequest", (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase("LoadAdminUsersSuccess", (state, action) => {
      state.loading = false; 
      state.adminusers = action.payload;
      state.error = null;
    })
    .addCase("LoadAdminUsersFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.adminusers = [];
    })
    
    // Update User Info Cases
    .addCase("updateUserInfoRequest", (state) => {
      state.loading = true;
    })
    .addCase("updateUserInfoSuccess", (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    })
    .addCase("updateUserInfoFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    
    // Update User Avatar Cases
    .addCase("updateUserAvatarRequest", (state) => {
      state.loading = true;
    })
    .addCase("updateUserAvatarSuccess", (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    })
    .addCase("updateUserAvatarFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    
    // Update User Password Cases
    .addCase("updateUserPasswordRequest", (state) => {
      state.loading = true;
    })
    .addCase("updateUserPasswordSuccess", (state, action) => {
      state.loading = false;
      state.error = null;
    })
    .addCase("updateUserPasswordFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    
    // Add User Address Cases
    .addCase("addUserAddressRequest", (state) => {
      state.addressLoading = true;
    })
    .addCase("addUserAddressSuccess", (state, action) => {
      state.addressLoading = false;
      state.user = action.payload;
      state.error = null;
    })
    .addCase("addUserAddressFail", (state, action) => {
      state.addressLoading = false;
      state.error = action.payload;
    })
    
    // Update User Address Cases
    .addCase("updateUserAddressRequest", (state) => {
      state.addressLoading = true;
    })
    .addCase("updateUserAddressSuccess", (state, action) => {
      state.addressLoading = false;
      state.user = action.payload;
      state.error = null;
    })
    .addCase("updateUserAddressFail", (state, action) => {
      state.addressLoading = false;
      state.error = action.payload;
    })
    
    // Delete User Address Cases
    .addCase("deleteUserAddressRequest", (state) => {
      state.addressLoading = true;
    })
    .addCase("deleteUserAddressSuccess", (state, action) => {
      state.addressLoading = false;
      state.user = action.payload;
      state.error = null;
    })
    .addCase("deleteUserAddressFail", (state, action) => {
      state.addressLoading = false;
      state.error = action.payload;
    })
    
    // Set Default Address Cases
    .addCase("setDefaultAddressRequest", (state) => {
      state.addressLoading = true;
    })
    .addCase("setDefaultAddressSuccess", (state, action) => {
      state.addressLoading = false;
      state.user = action.payload;
      state.error = null;
    })
    .addCase("setDefaultAddressFail", (state, action) => {
      state.addressLoading = false;
      state.error = action.payload;
    })
    
    // Logout User Cases
    .addCase("LogoutUserRequest", (state) => {
      state.loading = true;
    })
    .addCase("LogoutUserSuccess", (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.adminusers = []; // Clear admin users on logout
      state.error = null;
    })
    .addCase("LogoutUserFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
});

export default userReducer;