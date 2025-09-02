import Conversation from "../models/conversation.js";


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
      { lastMessage, lastMessageId },
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
    const userId = req.user._id;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required"
      });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: { $in: [userId] } 
    }).populate('members', 'name email avatar'); 

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or you don't have access to it"
      });
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
      error: error.message
    });
  }
};