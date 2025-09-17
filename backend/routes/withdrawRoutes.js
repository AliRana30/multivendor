import express from 'express'
import { isSeller } from '../middlewares/auth.js';
import { 
  acceptWithdrawalRequest, 
  getAllWithdrawalRequests, 
  rejectWithdrawalRequest, 
  withdrawRequestController,
  getSellerWithdrawals  
} from '../controllers/withdrawController.js';

export const withdrawRouter = express.Router();

withdrawRouter.post("/shop-withdraw-request", isSeller, withdrawRequestController);
withdrawRouter.get("/get-withdraw-requests", getAllWithdrawalRequests);
withdrawRouter.post("/accept-withdraw-request", acceptWithdrawalRequest);
withdrawRouter.post("/reject-withdraw-request", rejectWithdrawalRequest);

withdrawRouter.get("/seller-withdrawals", isSeller, getSellerWithdrawals);