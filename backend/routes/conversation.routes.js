import express from 'express'
import { conversationController, deleteconversation, getConversationById, getMessagesByConversationId, getSellerConversations, getUserConversations, updateLastMessage } from '../controllers/conversation.controller.js'
import {isAuthenticated, isSeller} from '../middlewares/auth.js'

export const conversationRoute = express.Router()

conversationRoute.post('/create-new-conversation', isAuthenticated, conversationController);
conversationRoute.get('/conversations/:userId', isAuthenticated, getUserConversations);
conversationRoute.put('/conversation/:conversationId/last-message', isAuthenticated, updateLastMessage);

// Seller routes  
conversationRoute.get('/all-conversations/:sellerId', isSeller, getSellerConversations);

// Shared routes (both users and sellers can access)
conversationRoute.get('/conversation/:conversationId', isAuthenticated, getConversationById); 
conversationRoute.get('/conversation-messages/:conversationId', isAuthenticated, getMessagesByConversationId);
conversationRoute.delete('/conversation/:conversationId', isAuthenticated, deleteconversation);


