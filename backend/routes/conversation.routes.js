import express from 'express'
import { conversationController, getConversationById, getSellerConversations, getUserConversations, updateLastMessage } from '../controllers/conversation.controller.js'
import {isAuthenticated} from '../middlewares/auth.js'

export const conversationRoute = express.Router()

conversationRoute.post('/create-new-conversation', isAuthenticated, conversationController);

conversationRoute.get('/conversations/:userId', isAuthenticated, getUserConversations);
conversationRoute.get('/all-conversations/:sellerId', isAuthenticated, getSellerConversations);
conversationRoute.get('/conversation/:conversationId', isAuthenticated, getConversationById);


conversationRoute.put('/conversation/:conversationId/last-message', updateLastMessage);