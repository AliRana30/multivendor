import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
       conversationId:{
           type: mongoose.Schema.Types.ObjectId,
           ref: 'Conversation',
           required: true
       },
       text:{
        type: String,
        default: ''
       },
       sender: {
           type: String,
           required: true
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
},{timestamps: true})

// Add indexes for better performance
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
