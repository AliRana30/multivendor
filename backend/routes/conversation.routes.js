import express from 'express'
import { conversationController, getConversationById, getSellerConversations, getUserConversations, updateLastMessage } from '../controllers/conversation.controller.js'
import {isAuthenticated, isSeller, isUserOrSeller} from '../middlewares/auth.js'
import Conversation from '../models/conversation.js';

export const conversationRoute = express.Router()

conversationRoute.post('/create-new-conversation', isAuthenticated, conversationController);

conversationRoute.get('/conversations/:userId', isSeller, getUserConversations);
conversationRoute.get('/all-conversations/:sellerId', isAuthenticated, getSellerConversations);

conversationRoute.put('/conversation/:conversationId/last-message', isAuthenticated, updateLastMessage);

conversationRoute.get('/conversation/:conversationId', isUserOrSeller, getConversationById);

conversationRoute.delete('/conversation/:conversationId', isSeller, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOneAndDelete({
      _id: conversationId,
      members: { $in: [userId] }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or no permission"
      });
    }

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
