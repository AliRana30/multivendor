import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
  groupTitle: {
    type: String,
    default: function() {
      return `conversation_${this._id}`;
    }
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'memberTypes' 
  }],
  memberTypes: [{
    type: String,
    enum: ['User', 'Shop'], 
    default: 'User'
  }],
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

// Indexes for performance
conversationSchema.index({ members: 1, updatedAt: -1 });
conversationSchema.index({ members: 1, isActive: 1 });

// Virtual for member count
conversationSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// if user is member
conversationSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.toString() === userId.toString());
};

// Pre-save middleware to set memberTypes
conversationSchema.pre('save', function(next) {
  if (this.isNew && (!this.memberTypes || this.memberTypes.length === 0)) {
    this.memberTypes = new Array(this.members.length).fill('User');
  }
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;