import express from 'express'
import { createNewMessage, deleteMessage, getMessages, markMessagesAsRead } from '../controllers/message.controller.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { upload } from '../multer.js';

export const messageRouter = express.Router();

messageRouter.post("/create-new-message",upload.array("images"),createNewMessage)
messageRouter.get("/messages/:conversationId", isAuthenticated,getMessages)
messageRouter.put("/messages/:conversationId/read", isAuthenticated,markMessagesAsRead)
messageRouter.delete("/messages/:messageId", isAuthenticated, deleteMessage)