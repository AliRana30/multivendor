import express from 'express'
import { createNewMessage, deleteMessage, getMessages, markMessagesAsRead } from '../controllers/message.controller.js';
import { isAuthenticated, isSeller } from '../middlewares/auth.js';
import { upload } from '../multer.js';

export const messageRouter = express.Router();

// User message routes
messageRouter.post("/create-new-message", upload.array("images"), isAuthenticated, createNewMessage)
messageRouter.get("/messages/:conversationId", isAuthenticated, getMessages)
messageRouter.put("/messages/:conversationId/read", isAuthenticated, markMessagesAsRead)
messageRouter.delete("/messages/:messageId", isAuthenticated, deleteMessage)

// Seller message routes (separate endpoints to avoid conflicts)
messageRouter.post("/seller/create-new-message", upload.array("images"), isSeller, createNewMessage)
messageRouter.get("/seller/messages/:conversationId", isSeller, getMessages)
messageRouter.put("/seller/messages/:conversationId/read", isSeller, markMessagesAsRead)
messageRouter.delete("/seller/messages/:messageId", isSeller, deleteMessage)