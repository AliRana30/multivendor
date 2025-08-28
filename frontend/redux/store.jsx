import { configureStore } from '@reduxjs/toolkit';
import userReducer from './reducers/user'
import sellerReducer from './reducers/seller';
import productReducer from './reducers/product';
import eventReducer from './reducers/event';
import couponReducer from './reducers/coupon';
import { cartReducer } from './reducers/cart';
import { wishListReducer } from './reducers/wishlist';
import { orderReducer } from './reducers/order';

const Store = configureStore({
    reducer :{
       user : userReducer,
       seller : sellerReducer,
       product : productReducer,
       event : eventReducer,
       coupon : couponReducer,
       cart : cartReducer,
       wishlist : wishListReducer,
       order : orderReducer
    }
})

export default Store;