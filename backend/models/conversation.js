import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
  groupTitle: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'memberModel' 
  }],
  memberModel: {
    type: String,
    enum: ['User', 'Seller'], 
    default: 'User'
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

conversationSchema.index({ members: 1, updatedAt: -1 });

conversationSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

conversationSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.toString() === userId.toString());
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;