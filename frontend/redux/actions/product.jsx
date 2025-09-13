import api from "../../src/components/axiosCongif";

export const createProduct = (newForm) => async (dispatch) => {
  try {
    dispatch({ type: "productCreateRequest" });

    const { data } = await api.post("/create-product", newForm);

    dispatch({
      type: "productCreateSuccess",
      payload: data.product,
    });
  } catch (error) {
    dispatch({
      type: "productCreateFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Action for getting products from a specific seller
export const getAllProducts = (id) => async (dispatch) => {
    try {
        dispatch({ type: "getAllProductsShopRequest" });

        const { data } = await api.get(`/all-products/${id}`);
        dispatch({ 
            type: "getAllProductsShopSuccess", 
            payload: data.products 
        });
    } catch (error) {
        dispatch({
            type: "getAllProductsShopFailed",
            payload: error.response?.data?.message || error.message,
        });
    }
};

// Action for getting ALL products from ALL sellers
export const getAllProductsFromAllSellers = () => async (dispatch) => {
    try {
        dispatch({ type: "getAllProductsRequest" });

        const { data } = await api.get('/all-products');
        dispatch({ 
            type: "getAllProductsSuccess", 
            payload: data.products 
        });
    } catch (error) {
        dispatch({
            type: "getAllProductsFailed",
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const getProducts = (sellerId = null) => async (dispatch) => {
    try {
        if (sellerId) {
            // Get products from specific seller
            dispatch({ type: "getAllProductsShopRequest" });
            const { data } = await api.get(`/all-products/${sellerId}`);
            dispatch({ 
                type: "getAllProductsShopSuccess", 
                payload: data.products 
            });
        } else {
            // Get all products from all sellers
            dispatch({ type: "getAllProductsRequest" });
            const { data } = await api.get('/all-products');
            dispatch({ 
                type: "getAllProductsSuccess", 
                payload: data.products 
            });
        }
    } catch (error) {
        const actionType = sellerId ? "getAllProductsShopFailed" : "getAllProductsFailed";
        dispatch({
            type: actionType,
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const deleteProduct =(id)=> async(dispatch)=> {
   try {
      dispatch({type : "deleteProductRequest"})

      const {data} = await api.delete(`/delete-product/${id}`,{withCredentials : true})
 
      dispatch({type : "deleteProductSuccess" , payload : data.message})
      
   } catch (error) {
      dispatch({type : "deleteProductFailed" , payload : error.response.data.message})
   }
}

export const updateProductStock = ({ productId, quantityToReduce }) => async (dispatch) => {
   try {
      dispatch({ type: "updateProductStockRequest" });

      const { data } = await api.put(`/update-product-stock/${productId}`, { quantityToReduce }, { withCredentials: true });

      dispatch({ 
         type: "updateProductStockSuccess", 
         payload: {
            message: data.message,
            product: data.product
         }
      });

      return { success: true, data };

   } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      dispatch({ 
         type: "updateProductStockFailed", 
         payload: errorMessage 
      });
      
      return { success: false, error: errorMessage };
   }
};

export const createProductReview = (reviewData) => async (dispatch) => {
  try {
    dispatch({
      type: 'productReviewCreateRequest',
    });
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    };

    const { id, ...reviewPayload } = reviewData;

    const { data } = await api.post(
      `/create-review/${id}`,  
      reviewPayload,
      config
    );

    dispatch({
      type: 'productReviewCreateSuccess',
      payload: data,
    });

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create review';
    
    dispatch({
      type: 'productReviewCreateFail',
      payload: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Get all reviews for a specific product
export const getProductReviews = (productId) => async (dispatch) => {
  try {
    dispatch({
      type: 'getProductReviewsRequest',
    });

    const { data } = await api.get(`/product-reviews/${productId}`);

    dispatch({
      type: 'getProductReviewsSuccess',
      payload: data.reviews,
    });

    return {
      success: true,
      reviews: data.reviews,
    };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch reviews';
    
    dispatch({
      type: 'getProductReviewsFail',
      payload: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Update a product review 
export const updateProductReview = (reviewId, reviewData) => async (dispatch) => {
  try {
    dispatch({
      type: 'productReviewUpdateRequest',
    });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    };

    const { data } = await api.put(
      `/api/v2/product/update-review/${reviewId}`,
      reviewData,
      config
    );

    dispatch({
      type: 'productReviewUpdateSuccess',
      payload: data,
    });

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update review';
    
    dispatch({
      type: 'productReviewUpdateFail',
      payload: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}