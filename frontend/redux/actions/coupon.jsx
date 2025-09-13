import api from "../../src/components/axiosCongif";

export const createCoupon = (couponData) => async (dispatch) => {
  try {
    dispatch({ type: "couponCreateRequest" });

    const { data } = await api.post("/create-coupon", couponData, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    dispatch({
      type: "couponCreateSuccess",
      payload: data.coupon,
    });
  } catch (error) {
    dispatch({
      type: "couponCreateFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};


export const getAllCoupons =(id) => async(dispatch)=>{
    try {
       dispatch({ type: "getAllCouponsShopRequest" });

       const {data} = await api.get(`/all-coupons/${id}`)
       dispatch({type : "getAllCouponsShopSuccess" , payload : data.coupons})
    } catch (error) {
       dispatch({
      type: "getAllCouponsShopFailed",
      payload: error.response?.data?.message || error.message,
    });
    }
}

export const deleteCoupon =(id)=> async(dispatch)=> {
   try {
      dispatch({type : "deleteCouponRequest"})

      const {data} = await api.delete(`/delete-coupon/${id}`,{withCredentials : true})
 
      dispatch({type : "deleteCouponSuccess" , payload : data.message})
      
   } catch (error) {
      dispatch({type : "deleteCouponFailed" , payload : error.response.data.message})
   }
}