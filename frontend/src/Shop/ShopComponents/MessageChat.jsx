import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Send, 
  Image, 
  MoreVertical,
  Phone,
  Video,
  Info
} from 'lucide-react';
import api from '../../components/axiosCongif';
import socketIo from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const ENDPOINT = "http://localhost:4000";
let socket = null;

const MessageChat = ({ conversationId: propConversationId, onBack }) => {
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const conversationDataRef = useRef(null);
  
  const { seller } = useSelector((state) => state.seller);
  const { user } = useSelector((state) => state.user);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState(null);

  const currentUserId = seller?._id || user?._id;
  const currentUser = seller || user;
  const navigate = useNavigate();

  // FIXED: Use propConversationId directly and don't reassign
  const conversationId = propConversationId;

  // FIXED: Early return if no conversation ID
  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Conversation Selected</h3>
          <p className="text-gray-600 mb-4">Please select a conversation to start messaging</p>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (currentUserId && !socket) {
      socket = socketIo(ENDPOINT, { transports: ["websocket"] });
    }
    
    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  useEffect(() => {
    if (currentUserId && socket && conversationId) {
      socket.emit("addUser", currentUserId);
      
      socket.on("getUsers", (users) => {
        setOnlineUsers(users);
      });

      socket.on("getMessage", (data) => {
        if (data.conversationId === conversationId && data.senderId !== currentUserId) {
          setMessages(prev => [...prev, {
            _id: Date.now().toString(),
            conversationId: data.conversationId,
            text: data.text || data.message,
            sender: data.senderId || data.sender,
            images: data.images || [],
            createdAt: new Date(),
            isRead: false
          }]);
        }
      });

      socket.on("messageSeen", (data) => {
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, isRead: true }
            : msg
        ));
      });

      return () => {
        if (socket) {
          socket.off("getUsers");
          socket.off("getMessage");
          socket.off("messageSeen");
        }
      };
    }
  }, [currentUserId, conversationId]);

  // FIXED: Only run effect when we have both required values and they're stable
  useEffect(() => {
    const fetchConversationData = async () => {
      // Early return if we don't have the required data
      if (!conversationId || !currentUserId) {
        console.log('Missing required data:', { conversationId, currentUserId });
        setLoading(false);
        setError("Missing conversation ID or user information");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching conversation data for:', { conversationId, currentUserId });

        let conversationData = null;
        let messagesData = [];

        // Try to get specific conversation first
        try {
          const specificConvResponse = await api.get(`/conversation/${conversationId}`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });

          console.log('Raw conversation response:', specificConvResponse.data);
          
          if (specificConvResponse.data && specificConvResponse.data.success !== false) {
            conversationData = specificConvResponse.data.conversation || 
                              specificConvResponse.data.data ||
                              specificConvResponse.data;
            console.log('Extracted conversation data:', conversationData);
            conversationDataRef.current = conversationData; // Store in ref
          }
        } catch (specificError) {
          console.warn('Specific conversation fetch failed:', specificError.message);
        }

        // Fallback: Get all conversations and find the one we need
        if (!conversationData) {
          try {
            const conversationEndpoint = seller
              ? `/all-conversations/${currentUserId}`
              : `/conversations/${currentUserId}`;

            const conversationResponse = await api.get(conversationEndpoint, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            if (conversationResponse.data && conversationResponse.data.success !== false) {
              const allConversations = conversationResponse.data.conversations || conversationResponse.data || [];
              conversationData = Array.isArray(allConversations)
                ? allConversations.find(conv => conv._id === conversationId)
                : null;

              if (conversationData) {
                console.log('Found conversation via fallback:', conversationData);
                conversationDataRef.current = conversationData; // Store in ref
              }
            }
          } catch (fallbackError) {
            console.warn('Fallback conversation fetch failed:', fallbackError.message);
          }
        }

        // Create minimal conversation object if needed
        if (!conversationData && conversationId) {
          console.log('Creating minimal conversation object');
          conversationData = {
            _id: conversationId,
            members: [currentUserId], 
            groupTitle: null,
            lastMessage: '',
            lastMessageId: null
          };
          conversationDataRef.current = conversationData; // Store in ref
        }

        // Fetch messages
        try {
          console.log('Fetching messages for conversation:', conversationId);
          const messagesResponse = await api.get(`/messages/${conversationId}`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });

          if (messagesResponse.data && messagesResponse.data.success !== false) {
            messagesData = messagesResponse.data.messages || messagesResponse.data || [];
            console.log('Fetched messages:', messagesData.length);
            console.log('Messages data:', messagesData);
            
            // Update conversation members if needed
            if (conversationData && messagesData.length > 0 && conversationData.members.length === 1) {
              const otherParticipants = messagesData
                .map(msg => msg.sender)
                .filter(senderId => senderId !== currentUserId);
              
              if (otherParticipants.length > 0) {
                conversationData.members = [...new Set([currentUserId, ...otherParticipants])];
                conversationDataRef.current = conversationData; // Update ref
              }
            }
          }
        } catch (messagesError) {
          console.warn('Messages fetch failed:', messagesError.message);
        }

        // Set state
        if (conversationData) {
          setConversation(conversationData.lastMessageId ? conversationData : {...conversationData, lastMessageId: null});
          const messagesToSet = Array.isArray(messagesData) ? messagesData : [];
          setMessages(messagesToSet);
          console.log('Setting messages:', messagesToSet);
          console.log('Current user ID for comparison:', currentUserId);
        } else {
          setError("Conversation not found or inaccessible");
        }

      } catch (error) {
        console.error('Error in fetchConversationData:', error);
        let errorMessage = "Failed to load conversation";
        
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = "Authentication failed. Please log in again.";
          } else if (error.response.status === 404) {
            errorMessage = "Conversation not found";
          } else if (error.response.status === 403) {
            errorMessage = "Access denied to this conversation";
          }
        } else if (error.message?.includes('Network')) {
          errorMessage = "Network error. Please check your connection.";
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    // FIXED: Only fetch when both values are present and valid
    if (conversationId && currentUserId && typeof conversationId === 'string' && conversationId.length >= 12) {
      fetchConversationData();
    }
  }, [conversationId, currentUserId, seller]); // Removed unnecessary dependencies

  // Debug log to track state changes
  useEffect(() => {
    console.log('Component state:', {
      propConversationId,
      conversationId,
      currentUserId,
      loading,
      error,
      messagesLength: messages.length,
      conversationSet: !!conversation
    });
  }, [propConversationId, conversationId, currentUserId, loading, error, messages.length, conversation]);

  useEffect(() => {
    console.log('Messages state updated:', messages);
    console.log('Messages length:', messages.length);
    if (messages.length > 0) {
      console.log('Sample message:', messages[0]);
      console.log('Sample message sender:', messages[0].sender);
      console.log('Current user ID:', currentUserId);
      console.log('Sender comparison result:', messages[0].sender === currentUserId);
    }
  }, [messages, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      return true;
    });
    
    setSelectedImages(validFiles);
  };

  const removeSelectedImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && selectedImages.length === 0) return;
    if (!currentUserId) {
      toast.error("Missing user information");
      return;
    }

    if (!conversationId) {
      toast.error("Missing conversation ID");
      return;
    }

    try {
      setSending(true);

      const formData = new FormData();
      formData.append('conversationId', conversationId);  
      formData.append('text', newMessage.trim());
      formData.append('sender', currentUserId);

      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      const response = await api.post('/create-new-message', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        timeout: 10000
      });

      if (response.data && response.data.success !== false) {
        const messageData = {
          _id: response.data._id || Date.now().toString(),
          conversationId,
          text: newMessage.trim(),
          sender: currentUserId,
          lastMessage: newMessage.trim(),
          images: response.data.images || [],
          createdAt: new Date(),
          isRead: false
        };

        setMessages(prev => [...prev, messageData]);

        // Use the conversation data from ref for socket emission
        const currentConversation = conversationDataRef.current || conversation;
        const otherMember = currentConversation?.members?.find(member => member !== currentUserId);
        if (otherMember && socket) {
          socket.emit("sendMessage", {
            senderId: currentUserId,
            receiverId: otherMember,
            text: newMessage.trim(),
            message: newMessage.trim(), 
            images: response.data.images || [],
            conversationId: conversationId 
          });
        }

        setNewMessage('');
        setSelectedImages([]);
        
        try {
          await api.put(`/conversation/${conversationId}/last-message`, {
            lastMessage: newMessage.trim() || "Image",
            lastMessageId: response.data._id
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
        } catch (updateError) {
          console.warn('Failed to update last message:', updateError);
        }
        
        toast.success("Message sent!");
      } else {
        toast.error(response.data?.message || "Failed to send message");
      }
    } catch (error) {
      console.error('Send message error:', error);
      let errorMessage = "Failed to send message";
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (error.response.status === 403) {
          errorMessage = "You don't have permission to send messages";
        } else if (error.response.status === 404) {
          errorMessage = "Conversation not found";
        } else {
          errorMessage = error.response?.data?.message || "Failed to send message";
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      } else if (error.message?.includes('Network')) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some(user => user.userId === userId);
  };

  const getOtherParticipant = () => {
    if (!conversation) return null;
    return conversation.members?.find(member => member !== currentUserId);
  };

  const getChatTitle = () => {
    if (conversation?.groupTitle) {
      return conversation.groupTitle;
    }
    
    if (conversation?._id) {
      return `Conversation ${conversation._id.slice(-8)}`;
    }
    
    return `${user?.name || 'Chat'}`;
  };

  const otherParticipant = getOtherParticipant();

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">Please log in to access this conversation</p>
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={()=>navigate("/shop-dashboard/all-messages")}
            className="p-2 hover:bg-gray-100 rounded-full text-black"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                {(currentUser?.name?.charAt(0) || getChatTitle().charAt(0) || 'C').toUpperCase()}
              </div>
              {isUserOnline(otherParticipant) && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">
                {getChatTitle()}
              </h3>
              <p className="text-sm text-gray-500">
                {isUserOnline(otherParticipant) ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Info className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            // Convert both to strings for comparison
            const messageSender = String(message.sender);
            const currentUserIdStr = String(currentUserId);
            const isMyMessage = messageSender === currentUserIdStr;
            
            console.log('Message render check:', {
              messageSender,
              currentUserIdStr,
              isMyMessage,
              messageId: message._id
            });

            return (
              <div
                key={message._id}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isMyMessage
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  {/* Images */}
                  {message.images && message.images.length > 0 && (
                    <div className="mb-2 space-y-2">
                      {message.images.map((image, index) => (
                        <img
                          key={index}
                          src={typeof image === 'string' ? 
                            `http://localhost:5000/uploads/${image}` : 
                            image.url || `http://localhost:5000/uploads/${image}`
                          }
                          alt="Message attachment"
                          className="max-w-full h-auto rounded-lg"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.png';
                          }}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Text */}
                  {message.text && (
                    <p className="break-words">{message.text}</p>
                  )}
                  
                  {/* Timestamp */}
                  <div className={`text-xs mt-1 ${
                    isMyMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatMessageTime(message.createdAt)}
                    {isMyMessage && (
                      <span className="ml-1">
                        {message.isRead ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2 overflow-x-auto">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Selected ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removeSelectedImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <Image className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="w-full text-black px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && selectedImages.length === 0) || sending}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageChat;