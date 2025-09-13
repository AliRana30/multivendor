// add to cart
export const addToCart = (product) => async (dispatch, getState) => {
  try {
    dispatch({
      type: "addToCartRequest",
    });
    dispatch({
      type: "addToCartSuccess",
      payload: product,
    });
    localStorage.setItem("cart", JSON.stringify(getState().cart.cart));
    return product;
  } catch (error) {
    dispatch({
      type: "addToCartFailure",
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// remove from cart

export const removeFromCart = (_id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: "removeFromCartRequest",
    });

    dispatch({
      type: "removeFromCartSuccess",
      payload: _id, 
    });

    localStorage.setItem("cart", JSON.stringify(getState().cart.cart));
    return _id;
  } catch (error) {
    dispatch({
      type: "removeFromCartFailure",
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};


export const updateCartQuantity = (_id, quantity) => async (dispatch, getState) => {
  try {
    dispatch({
      type: "updateCartQuantity",
      payload: { _id, quantity },
    });

    localStorage.setItem("cart", JSON.stringify(getState().cart.cart));
  } catch (error) {
    console.error("Failed to update cart quantity:", error);
  }
};
