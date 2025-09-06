import Conversation from "../models/conversation.js";
import mongoose from 'mongoose'; 

export const conversationController = async (req, res) => { 
  try {
    const { groupTitle, userId, sellerId } = req.body;

    // Validate required fields
    if (!groupTitle || !userId || !sellerId) {
      return res.status(400).json({ 
        success: false,
        message: "Group title, user ID, and seller ID are required" 
      });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      groupTitle: groupTitle
    });
    
    if (existingConversation) {
      return res.status(200).json({ 
        success: true,
        conversationId: existingConversation._id,
        conversation: existingConversation,
        message: "Conversation already exists" 
      });
    }

    const newConversation = new Conversation({
      groupTitle,
      members: [userId, sellerId],
    });

    await newConversation.save();
    
    res.status(201).json({
      success: true,
      conversationId: newConversation._id,
      conversation: newConversation,
      message: "Conversation created successfully"
    });
    
  } catch (error) {
    console.error("Error in conversationController:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const conversations = await Conversation.find({
      members: { $in: [userId] }
    }).sort({ updatedAt: -1 , createdAt : -1});
    
    res.status(200).json({
      success: true,
      conversations
    });
    
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

export const getSellerConversations = async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    const conversations = await Conversation.find({
      members: { $in: [sellerId] }
    }).sort({ updatedAt: -1 , createdAt : -1});
    
    res.status(200).json({
      success: true,
      conversations
    });
    
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

export const updateLastMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { lastMessage, lastMessageId } = req.body;
    
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { 
        lastMessage, 
        lastMessageId,
        updatedAt: new Date() 
      },
      { new: true }
    );
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }
    
    res.status(200).json({
      success: true,
      conversation
    });
    
  } catch (error) {
    console.error("Error updating conversation:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID format"
      });
    }

    let userId;
    if (req.seller && req.seller._id) {
      userId = req.seller._id; 
    } else if (req.user && req.user._id) {
      userId = req.user._id;
    } else {
      console.log('Authentication check failed:', {
        hasSeller: !!req.seller,
        hasUser: !!req.user,
        sellerData: req.seller,
        userData: req.user
      });
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    console.log('Fetching conversation:', { 
      conversationId, 
      userId: userId.toString(),
      userType: req.seller ? 'seller' : 'user'
    });

    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: { $in: [userId] }
    });

    if (!conversation) {
      console.log('Conversation not found or access denied:', { 
        conversationId, 
        userId: userId.toString() 
      });

      const conversationExists = await Conversation.findById(conversationId);

      if (!conversationExists) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found"
        });
      } else {
        console.log('Conversation exists but access denied. Members:', conversationExists.members);
        return res.status(403).json({
          success: false,
          message: "You don't have access to this conversation",
          debug: {
            conversationMembers: conversationExists.members.map(m => m.toString()),
            requestingUserId: userId.toString()
          }
        });
      }
    }

    res.status(200).json({
      success: true,
      conversation: conversation
    });

  } catch (error) {
    console.error("Error fetching conversation by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};