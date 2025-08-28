import express from 'express'
import { isSeller } from '../middlewares/auth.js';
import { couponController, deleteCouponController, getCouponController } from '../controllers/coupon.controller.js';

export const couponRouter = express.Router();

couponRouter.post('/create-coupon',isSeller,couponController)
couponRouter.get('/all-coupons/:id',getCouponController)
couponRouter.delete('/delete-coupon/:id',isSeller,deleteCouponController)

