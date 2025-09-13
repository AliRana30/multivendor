import express from 'express'
import { isSeller } from '../middlewares/auth.js';
import { acceptWithdrawalRequest, getAllWithdrawalRequests, rejectWithdrawalRequest, withdrawRequestController } from '../controllers/withdraw.controller.js';


export const withdrawRouter = express.Router();

withdrawRouter.post("/shop-withdraw-request",isSeller,withdrawRequestController);
withdrawRouter.get("/get-withdraw-requests",getAllWithdrawalRequests);
withdrawRouter.post("/accept-withdraw-request",acceptWithdrawalRequest);
withdrawRouter.post("/reject-withdraw-request",rejectWithdrawalRequest);




