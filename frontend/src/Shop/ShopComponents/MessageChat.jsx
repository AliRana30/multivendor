import React, { useState, useEffect, useRef } from 'react';
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

const MessageChat = ({ conversationId, onBack }) => {
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const { seller } = useSelector((state) => state.seller);
  const { user } = useSelector((state) => state.user);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const currentUserId = seller?._id || user?._id;
  const currentUser = seller || user;
  const navigate = useNavigate();

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
    if (currentUserId && socket) {
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

  useEffect(() => {
    const fetchConversationData = async () => {
      if (!conversationId || !currentUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        try {
          const specificConvResponse = await api.get(`/conversation/${conversationId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          
          if (specificConvResponse.data && specificConvResponse.data.success !== false) {
            const conversationData = specificConvResponse.data.conversation || specificConvResponse.data;
            setConversation(conversationData);
          } else {
            throw new Error("Specific conversation fetch failed");
          }
        } catch (specificError) {
          const conversationEndpoint = seller 
            ? `/all-conversations/${currentUserId}` 
            : `/conversations/${currentUserId}`;
          
          const conversationResponse = await api.get(conversationEndpoint, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });

          if (conversationResponse.data && conversationResponse.data.success !== false) {
            const conversationData = conversationResponse.data.conversations || conversationResponse.data || [];
            const foundConversation = Array.isArray(conversationData) 
              ? conversationData.find(conv => conv._id === conversationId)
              : null;
            
            if (foundConversation) {
              setConversation(foundConversation);
            } else {
              toast.error("Conversation not found");
              setLoading(false);
              return;
            }
          } else {
            toast.error("Failed to fetch conversation data");
            setLoading(false);
            return;
          }
        }

        const messagesResponse = await api.get(`/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        if (messagesResponse.data && messagesResponse.data.success !== false) {
          const messagesData = messagesResponse.data.messages || messagesResponse.data || [];
          setMessages(Array.isArray(messagesData) ? messagesData : []);
        } else {
          setMessages([]);
        }

      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            toast.error("Authentication failed. Please log in again.");
          } else if (error.response.status === 404) {
            toast.error("Conversation not found");
          } else {
            toast.error("Failed to load conversation");
          }
        } else {
          toast.error("Network error. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConversationData();
  }, [conversationId, currentUserId, seller]);

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
    if (!currentUserId || !conversationId) {
      toast.error("Missing user information");
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
          images: response.data.images || [],
          createdAt: new Date(),
          isRead: false
        };

        setMessages(prev => [...prev, messageData]);

        const otherMember = conversation?.members?.find(member => member !== currentUserId);
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
        }
        
        toast.success("Message sent!");
      } else {
        toast.error(response.data?.message || "Failed to send message");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Authentication failed. Please log in again.");
        } else if (error.response.status === 403) {
          toast.error("You don't have permission to send messages");
        } else if (error.response.status === 404) {
          toast.error("Conversation not found");
        } else {
          toast.error(error.response?.data?.message || "Failed to send message");
        }
      } else if (error.code === 'ECONNABORTED') {
        toast.error("Request timeout. Please try again.");
      } else if (error.message.includes('Network')) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred");
      }
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
    
    if (currentUser?.name) {
      return `Chat with ${currentUser.name}`;
    }
    
    return `Chat ${conversation?._id?.slice(-8) || ''}`;
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

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Conversation not found</h3>
          <p className="text-gray-600 mb-4">Unable to load conversation details</p>
          <button
            onClick={() => navigate(seller ? "/shop-dashboard/messages" : "/dashboard/messages")}
            className="text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg"
          >
            Go back
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
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                {(currentUser?.name?.charAt(0) || 'C').toUpperCase()}
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
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
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
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender === currentUserId
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
                  message.sender === currentUserId ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatMessageTime(message.createdAt)}
                  {message.sender === currentUserId && (
                    <span className="ml-1">
                      {message.isRead ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
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