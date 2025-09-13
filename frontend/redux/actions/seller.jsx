import api from "../../src/components/axiosCongif";

export const loadSeller = () => async (dispatch) => {
  try {
    dispatch({
      type: "LoadSellerRequest",
    });
    const { data } = await api.get(`/get-seller`, { withCredentials: true });
    dispatch({
      type: "LoadSellerSuccess",
      payload: data.seller || data.user, 
    });
  } catch (error) {
    dispatch({
      type: "LoadSellerFail",
      payload: error.response?.data?.message || "Failed to load seller",
    });
  }
};

export const getAllAdminSellers = () => async(dispatch)=>{
  try {
    dispatch({ type: "LoadAdminSellersRequest" });
    
    const { data } = await api.get(`/admin-all-sellers`, {
      withCredentials: true
    });
    
    
    dispatch({
      type: "LoadAdminSellersSuccess",
      payload: data.adminsellers 
    });
  } catch (error) {
    console.error('Error fetching admin sellers:', error);
    dispatch({
      type: "LoadAdminSellersFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};