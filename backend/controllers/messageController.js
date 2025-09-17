import Conversation from "../models/Conversation.js";
import fs from 'fs';
import Message from "../models/Message.js";

// Create new message
export const createNewMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    
    let sender, senderType;
    if (req.seller && req.seller._id) {
      sender = req.seller._id.toString();
      senderType = 'seller';
    } else if (req.user && req.user._id) {
      sender = req.user._id.toString();
      senderType = 'user';
    } else {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    
    console.log("Creating new message with data:", { 
      conversationId, 
      text, 
      sender, 
      senderType 
    });
    console.log("Files received:", req.files);

    // Validate required fields
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required"
      });
    }

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    if (!conversation.members.includes(sender)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to send messages in this conversation"
      });
    }

    const hasText = text && text.trim();
    const hasImages = req.files && req.files.length > 0;
    
    if (!hasText && !hasImages) {
      return res.status(400).json({
        success: false,
        message: "Message must contain either text or images"
      });
    }

    let imageUrls = [];
    
    if (hasImages) {
      try {
        console.log("Processing images...");
        
        for (const file of req.files) {
          if (process.env.CLOUDINARY_CLOUD_NAME) {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "messages",
              resource_type: "image"
            });
            imageUrls.push(result.secure_url);
            fs.unlinkSync(file.path);
          } else {
            imageUrls.push(file.filename);
          }
        }
        
        console.log("Images processed:", imageUrls);
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload images"
        });
      }
    }

    // Create the message with sender type
    const newMessage = new Message({
      conversationId,
      text: hasText ? text.trim() : "",
      sender,
      senderType, // FIXED: Add sender type to distinguish between user and seller
      images: imageUrls,
      isRead: false
    });

    await newMessage.save();
    console.log("Message saved:", newMessage);

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: hasText ? text.trim() : "Image",
      lastMessageId: newMessage._id,
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
      _id: newMessage._id,
      images: imageUrls
    });

  } catch (error) {
    console.error("Error creating message:", error);
    
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (cleanupError) {
          console.error("Error cleaning up file:", cleanupError);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    console.log("Fetching messages for conversation:", conversationId);

    let currentUserId, currentUserType;
    if (req.seller && req.seller._id) {
      currentUserId = req.seller._id.toString(); 
      currentUserType = 'seller';
    } else if (req.user && req.user._id) {
      currentUserId = req.user._id.toString();
      currentUserType = 'user';
    } else {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    console.log("Authenticated user:", currentUserId, "Type:", currentUserType);

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    const isMember = conversation.members.some(member => member.toString() === currentUserId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this conversation"
      });
    }

    console.log("User access verified. Conversation members:", conversation.members);

    const messages = await Message.find({ 
      conversationId: conversationId 
    }).sort({ createdAt: 1 });

    const messagesWithOwnership = messages.map(message => ({
      ...message.toObject(),
      isOwnMessage: message.sender.toString() === currentUserId,
      currentUserType: currentUserType
    }));

    console.log(`Found ${messages.length} messages for conversation ${conversationId}`);

    res.status(200).json({
      success: true,
      messages: messagesWithOwnership,
      count: messages.length,
      currentUserId,
      currentUserType
    });

  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // FIXED: Get userId from authenticated user instead of request body
    let userId;
    if (req.seller && req.seller._id) {
      userId = req.seller._id.toString();
    } else if (req.user && req.user._id) {
      userId = req.user._id.toString();
    } else {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    console.log("Marking messages as read:", { conversationId, userId });

    // Update all unread messages in the conversation that were NOT sent by the user
    const result = await Message.updateMany(
      { 
        conversationId, 
        sender: { $ne: userId }, // Not sent by current user
        isRead: false 
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    console.log("Messages marked as read:", result.modifiedCount);

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const readMessageController = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // FIXED: Handle both seller and user authentication
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
    
    console.log("Marking messages as read:", { conversationId, userId });

    // Validate required data
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required"
      });
    }

    // Validate conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    // Check if user is part of the conversation
    if (!conversation.members.includes(userId.toString())) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this conversation"
      });
    }

    // Update all unread messages in the conversation that were NOT sent by the current user
    const result = await Message.updateMany(
      { 
        conversationId, 
        sender: { $ne: userId.toString() }, // Not sent by current user
        isRead: false 
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    console.log("Messages marked as read:", result.modifiedCount);

    res.status(200).json({
      success: true,
      message: "Messages marked as read successfully",
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Error in readMessageController:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // FIXED: Get userId from authenticated user instead of request body
    let userId;
    if (req.seller && req.seller._id) {
      userId = req.seller._id.toString();
    } else if (req.user && req.user._id) {
      userId = req.user._id.toString();
    } else {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    console.log("Deleting message:", { messageId, userId });

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // Check if user is authorized to delete (only sender can delete)
    if (message.sender !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages"
      });
    }

    // Delete images from storage if they exist
    if (message.images && message.images.length > 0) {
      for (const imageUrl of message.images) {
        try {
          if (process.env.CLOUDINARY_CLOUD_NAME) {
            // Extract public_id from cloudinary URL and delete
            const publicId = imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`messages/${publicId}`);
          } else {
            // Delete local file
            const imagePath = `uploads/${imageUrl}`;
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }
        } catch (imageDeleteError) {
          console.error("Error deleting image:", imageDeleteError);
        }
      }
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: "Message deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};