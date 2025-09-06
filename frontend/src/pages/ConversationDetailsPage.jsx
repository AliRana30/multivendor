import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  MessageSquare, 
  Users, 
  Clock, 
  Trash2, 
  Archive,
  Info,
} from 'lucide-react';
import api from '../components/axiosCongif';
import MessageChat from '../Shop/ShopComponents/MessageChat';

const ConversationDetailsPage = ({onBack}) => {
  const navigate = useNavigate();
  const { seller } = useSelector((state) => state.seller);
  const { user } = useSelector((state) => state.user);
  const conversationId = useParams().id;
  
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [messageStats, setMessageStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    lastActivity: null
  });

  const currentUserId = seller?._id || user?._id;
  const currentUserType = seller ? 'seller' : 'user';

  useEffect(() => {
    if (!conversationId || !currentUserId) return;
    fetchConversationDetails();
  }, [conversationId, currentUserId, seller]);

  const fetchConversationDetails = async () => {
    try {
      setLoading(true);
      const conversationEndpoint = seller 
        ? `/all-conversations/${currentUserId}` 
        : `/conversations/${currentUserId}`;

      const conversationsResponse = await api.get(conversationEndpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      if (conversationsResponse.data.success) {
        const foundConversation = conversationsResponse.data.conversations.find(
          conv => conv._id === conversationId
        );
        
        if (!foundConversation) {
          toast.error("Conversation not found");
          return;
        }

        setConversation(foundConversation);

        const messagesResponse = await api.get(`/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        if (messagesResponse.data.success) {
          const msgs = messagesResponse.data.messages || [];
          setMessages(msgs);
          
          const unreadCount = msgs.filter(msg => 
            msg.sender !== currentUserId && !msg.isRead
          ).length;
          
          const lastMessage = msgs[msgs.length - 1];
          
          setMessageStats({
            totalMessages: msgs.length,
            unreadMessages: unreadCount,
            lastActivity: lastMessage ? new Date(lastMessage.createdAt) : new Date(foundConversation.updatedAt)
          });
        } else {
          setMessages([]);
          setMessageStats({
            totalMessages: 0,
            unreadMessages: 0,
            lastActivity: new Date(foundConversation.updatedAt)
          });
        }
      } else {
        toast.error("Failed to load conversations");
      }
    } catch (error) {
      toast.error("Failed to load conversation details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!window.confirm("Are you sure you want to delete this conversation?")) {
      return;
    }

    try {
      await api.delete(`/conversation/${conversationId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      toast.success("Conversation deleted successfully");
      navigate('/products');
    } catch (error) {
      toast.error("Failed to delete conversation");
    }
  };

  const handleArchiveConversation = async () => { 
    try {
      await api.put(`/conversation/${conversationId}`, { archived: true });
      toast.success("Conversation archived");
      navigate('/products');
    } catch (error) {
      toast.error("Failed to archive conversation");
    }
  };

  const getOtherParticipant = () => {
    if (!conversation?.members) return null;
    return conversation.members.find(memberId => memberId !== currentUserId);
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
  };

  const otherParticipant = getOtherParticipant();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Conversation Not Found</h2>
          <p className="text-gray-600 mb-6">The conversation you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(`/products`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
    
      <div className={`flex-1 flex flex-col ${showInfo ? 'lg:w-2/3' : 'w-full'}`}>
         <button
                  onClick={()=>navigate("/shop-dashboard/all-messages")}
                  className="p-2 hover:bg-gray-100 rounded-full text-black"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
        {showChat ? (
          <MessageChat 
            conversationId={conversationId} 
            onBack={() => navigate('/products')}
          />
        ) : (
          <div className="flex flex-col h-full bg-white">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/products')}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Conversation Details</h1>
                  <p className="text-gray-600">Manage your conversation</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowChat(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open Chat
                </button>
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-8 h-8" />
                    <div>
                      <p className="text-blue-100">Total Messages</p>
                      <p className="text-2xl font-bold">{messageStats.totalMessages}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8" />
                    <div>
                      <p className="text-orange-100">Unread Messages</p>
                      <p className="text-2xl font-bold">{messageStats.unreadMessages}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8" />
                    <div>
                      <p className="text-green-100">Last Activity</p>
                      <p className="text-lg font-semibold">{formatRelativeTime(messageStats.lastActivity)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{formatDate(conversation.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{formatDate(conversation.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      conversation.isActive !== false
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {conversation.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h3>
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {messages.slice(-5).map((message) => (
                      <div
                        key={message._id}
                        className={`p-3 rounded-lg border ${
                          message.sender === currentUserId
                            ? 'bg-blue-50 border-blue-200 ml-8'
                            : 'bg-gray-50 border-gray-200 mr-8'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-medium ${
                            message.sender === currentUserId ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {message.sender === currentUserId ? 'You' : 'Other'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(message.createdAt)}
                          </span>
                        </div>
                        {message.text && (
                          <p className="text-gray-900 text-sm">{message.text}</p>
                        )}
                        {message.images && message.images.length > 0 && (
                          <p className="text-gray-600 text-xs mt-1">
                            {message.images.length} image{message.images.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowChat(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Continue Chat
                  </button>
                  
                  <button
                    onClick={handleArchiveConversation}
                    className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                  
                  <button
                    onClick={handleDeleteConversation}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showInfo && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Conversation Info</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Participants</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {currentUserType === 'seller' ? 'S' : 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {seller?.name || user?.name} (You)
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{currentUserType}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium">
                    O
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Other Participant</p>
                    <p className="text-sm text-gray-600">ID: {otherParticipant}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Settings</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Notifications</span>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Sound</span>
                  <input 
                    type="checkbox" 
                    defaultChecked 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationDetailsPage;