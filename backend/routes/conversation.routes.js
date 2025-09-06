import express from 'express'
import { conversationController, deleteconversation, getConversationById, getSellerConversations, getUserConversations, updateLastMessage } from '../controllers/conversation.controller.js'
import {isAuthenticated, isSeller, isUserOrSeller} from '../middlewares/auth.js'
import Conversation from '../models/conversation.js';

export const conversationRoute = express.Router()

conversationRoute.post('/create-new-conversation', isAuthenticated, conversationController);

conversationRoute.get('/conversations/:userId', isSeller, getUserConversations);
conversationRoute.get('/all-conversations/:sellerId', isAuthenticated, getSellerConversations);

conversationRoute.put('/conversation/:conversationId/last-message', isAuthenticated, updateLastMessage);

conversationRoute.get('/conversation/:conversationId', isSeller, getConversationById);

conversationRoute.delete('/conversation/:conversationId', isSeller,deleteconversation);
