import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js"; 
import mongoose from 'mongoose'; 

export const conversationController = async (req, res) => { 
  try {
    const { groupTitle, userId, sellerId } = req.body;

    if (!groupTitle) {
      return res.status(400).json({ 
        success: false,
        message: "Group title is required" 
      });
    }

    if(!userId ){
       return res.status(400).json({ 
        success: false,
        message: "user ID is required" 
      });
    }

    if( !sellerId ){
       return res.status(400).json({ 
        success: false,
        message: "seller Id is required" 
      });
    }

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
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    let conversation = await Conversation.findOne({
      _id: conversationId,
      members: { $in: [userId] }
    });

    if (!conversation) {
      const conversationExists = await Conversation.findById(conversationId);
      
      if (!conversationExists) {
        conversation = new Conversation({
          _id: conversationId,
          groupTitle: `Chat_${conversationId.slice(-6)}`,
          members: [userId],
          lastMessage: '',
          lastMessageId: null
        });
        
        await conversation.save();
        console.log('Created new conversation:', conversation._id);
      } else {
        return res.status(403).json({
          success: false,
          message: "You don't have access to this conversation"
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

export const deleteconversation = async(req,res)=>{
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
};


export const getMessagesByConversationId = async (req, res) => {
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
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    console.log('Fetching messages for conversation:', { 
      conversationId, 
      userId: userId.toString() 
    });

    // Check if user has access to this conversation
    let conversation = await Conversation.findOne({
      _id: conversationId,
      members: { $in: [userId] }
    });

    if (!conversation) {
      // Create conversation if it doesn't exist
      conversation = new Conversation({
        _id: conversationId,
        groupTitle: `Chat_${conversationId.slice(-6)}`,
        members: [userId],
        lastMessage: '',
        lastMessageId: null
      });
      
      try {
        await conversation.save();
        console.log('Created new conversation for messages:', conversationId);
      } catch (createError) {
        console.log('Conversation creation failed:', createError.message);
      }
    }

    // Fetch messages for this conversation
    const messages = await Message.find({
      conversationId: conversationId
    }).sort({ createdAt: 1 }); // Sort by creation time, oldest first

    console.log(`Found ${messages.length} messages for conversation ${conversationId}`);

    res.status(200).json({
      success: true,
      messages: messages,
      count: messages.length
    });

  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

