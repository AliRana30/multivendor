import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  // FIXED: Add senderType and senderModel to distinguish between users and sellers
  senderType: {
    type: String,
    enum: ['user', 'seller'],
    required: true
  },
  senderModel: {
    type: String,
    enum: ['User', 'Seller'],
    required: true,
    default: function() {
      return this.senderType === 'user' ? 'User' : 'Seller';
    }
  },
  text: {
    type: String,
    default: ""
  },
  images: [{
    type: String
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;