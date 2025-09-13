// add to wishlist
export const addToWishlist = (product) => async (dispatch, getState) => {
  try {
    dispatch({
      type: "addToWishListRequest",
    });

    dispatch({
      type: "addToWishListSuccess",
      payload: product,
    });

    localStorage.setItem("wishlist", JSON.stringify(getState().wishlist.wishlist));
    return product;
  } catch (error) {
    dispatch({
      type: "addToWishListFailure",
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// remove from wishlist
export const removeFromWishlist = (_id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: "removeFromWishListRequest",
    });

    dispatch({
      type: "removeFromWishListSuccess",
      payload: _id,
    });

    localStorage.setItem("wishlist", JSON.stringify(getState().wishlist.wishlist));
    return _id;
  } catch (error) {
    dispatch({
      type: "removeFromWishListFailure",
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};