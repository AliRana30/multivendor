import express from 'express'
import { isSeller } from '../middlewares/auth.js';
import { createOrderController, deleteOrderController, getAllOrdersController, getOrderByIdController, getUserOrdersController, orderRefundController, updateOrderStatusController, } from '../controllers/order.controller.js';

export const orderRouter = express.Router();

orderRouter.post('/create-order',createOrderController)
orderRouter.get('/all-orders/:id',getUserOrdersController)
orderRouter.get('/shop-orders/:id',getAllOrdersController)
orderRouter.put('/order-status/:id',updateOrderStatusController)
orderRouter.put('/order-refund/:id',orderRefundController)
orderRouter.get('/order/:id',getOrderByIdController)
orderRouter.get('/user-orders/:id',getUserOrdersController)
orderRouter.delete('/delete-order/:id',isSeller,deleteOrderController)


