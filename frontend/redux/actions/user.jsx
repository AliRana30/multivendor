import api from "../../src/components/axiosCongif";

// Load User Action
export const loadUser = () => async (dispatch) => {
  try {
    dispatch({
      type: "LoadUserRequest",
    });
    const { data } = await api.get(`/get-user`, { withCredentials: true });
    dispatch({
      type: "LoadUserSuccess",
      payload: data.user,
    });
  } catch (error) {
    dispatch({
      type: "LoadUserFail",
      payload: error.response?.data?.message || "Failed to load user",
    });
  }
};

// Login User Action (NEW)
export const loginUser = (email, password) => async (dispatch) => {
  try {
    dispatch({
      type: "LoginUserRequest",
    });
    
    const { data } = await api.post("/login", {
      email,
      password,
    }, {
      withCredentials: true
    });

    if (data.success) {
      dispatch({
        type: "LoginUserSuccess",
        payload: data.user,
      });
      return { success: true, user: data.user };
    } else {
      dispatch({
        type: "LoginUserFail",
        payload: data.message || "Login failed",
      });
      return { success: false, error: data.message || "Login failed" };
    }
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data || 
                        "Login failed. Please try again.";
    dispatch({
      type: "LoginUserFail",
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

// get all admin users
export const getAllAdminUsers = () => async (dispatch) => {
  try {
    dispatch({ type: "LoadAdminUsersRequest" });
    
    const { data } = await api.get(`/admin-all-users`, {
      withCredentials: true
    });
    
    dispatch({
      type: "LoadAdminUsersSuccess",
      payload: data.adminusers 
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    dispatch({
      type: "LoadAdminUsersFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Update User Info Action
export const updateUserInfo = (userData) => async (dispatch) => {
  try {
    dispatch({
      type: "updateUserInfoRequest",
    });
    
    const { data } = await api.put(`/update-user`, userData, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    dispatch({
      type: "updateUserInfoSuccess",
      payload: data.user,
    });
    
    return { success: true, user: data.user };
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to update user info";
    dispatch({
      type: "updateUserInfoFail",
      payload: errorMessage,
    });
    
    return { success: false, error: errorMessage };
  }
};

// Add User Address Action
export const addUserAddress = (addressData) => async (dispatch) => {
  try {
    dispatch({
      type: "addUserAddressRequest",
    });

    const { data } = await api.post(`/add-user-address`, addressData, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    dispatch({
      type: "addUserAddressSuccess",
      payload: data.user,
    });
    
    return { success: true, user: data.user };
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to add address";
    dispatch({
      type: "addUserAddressFail",
      payload: errorMessage,
    });
    
    return { success: false, error: errorMessage };
  }
};

// Delete User Address Action
export const deleteUserAddress = (addressId) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteUserAddressRequest",
    });

    const { data } = await api.delete(`/delete-user-address/${addressId}`, {
      withCredentials: true,
    });

    dispatch({
      type: "deleteUserAddressSuccess",
      payload: data.user,
    });
    
    return { success: true, user: data.user };
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to delete address";
    dispatch({
      type: "deleteUserAddressFail",
      payload: errorMessage,
    });
    
    return { success: false, error: errorMessage };
  }
};

// Logout User Action
export const logoutUser = () => async (dispatch) => {
  try {
    dispatch({
      type: "LogoutUserRequest",
    });
    
    await api.get(`/logout`, { withCredentials: true });
    
    dispatch({
      type: "LogoutUserSuccess",
    });
  } catch (error) {
    dispatch({
      type: "LogoutUserFail",
      payload: error.response?.data?.message || "Logout failed",
    });
  }
};

// Update User Avatar Action
export const updateUserAvatar = (avatar) => async (dispatch) => {
  try {
    dispatch({
      type: "updateUserAvatarRequest",
    });

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    };

    const { data } = await api.put(`/update-avatar`, avatar, config);

    dispatch({
      type: "updateUserAvatarSuccess",
      payload: data.user,
    });
    
    return { success: true, user: data.user };
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to update avatar";
    dispatch({
      type: "updateUserAvatarFail",
      payload: errorMessage,
    });
    
    return { success: false, error: errorMessage };
  }
};

// Update User Password Action
export const updateUserPassword = (passwords) => async (dispatch) => {
  try {
    dispatch({
      type: "updateUserPasswordRequest",
    });

    const { data } = await api.put(`/update-password`, passwords, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    dispatch({
      type: "updateUserPasswordSuccess",
      payload: data.message,
    });
    
    return { success: true, message: data.message };
    
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to update password";
    dispatch({
      type: "updateUserPasswordFail",
      payload: errorMessage,
    });
    
    return { success: false, error: errorMessage };
  }
};