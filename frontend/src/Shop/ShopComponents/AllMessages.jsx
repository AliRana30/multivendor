import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../components/axiosCongif";
import { toast } from "react-hot-toast";
import socketIo from "socket.io-client";
import { MessageCircle, Clock, Users, Search, Plus, Filter } from "lucide-react";

const ENDPOINT = "http://localhost:4000";
let socket = null;

const AllMessages = ({ onSelectConversation, currentUserId }) => {
  const { seller } = useSelector((state) => state.seller);
  const { user } = useSelector((state) => state.user);

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [filter, setFilter] = useState('all');

  const currentUser = seller || user;

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
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId || !socket) return;

    socket.emit("addUser", currentUserId);

    const handleGetUsers = (users) => setOnlineUsers(users);

    const handleGetMessage = (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.message || data.text,
        conversationId: data.conversationId,
        createdAt: new Date(),
      });
    };

    const handleGetLastMessage = ({ lastMessage, conversationId }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId
            ? { ...conv, lastMessage, updatedAt: new Date() }
            : conv
        )
      );
    };

    socket.on("getUsers", handleGetUsers);
    socket.on("getMessage", handleGetMessage);
    socket.on("getLastMessage", handleGetLastMessage);

    return () => {
      if (socket) {
        socket.off("getUsers", handleGetUsers);
        socket.off("getMessage", handleGetMessage);
        socket.off("getLastMessage", handleGetLastMessage);
      }
    };
  }, [currentUserId]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const endpoint = seller
          ? `/all-conversations/${currentUserId}`
          : `/conversations/${currentUserId}`;

        const response = await api.get(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.data && response.data.success !== false) {
          const conversationData = response.data.conversations || response.data || [];
          const sortedConversations = Array.isArray(conversationData) 
            ? conversationData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            : [];
          setConversations(sortedConversations);
        } else {
          toast.error(response.data?.message || "Failed to fetch conversations");
          setConversations([]);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Authentication failed. Please log in again.");
        } else {
          toast.error("Failed to load conversations");
        }
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [seller, user, currentUserId]);

  useEffect(() => {
    if (arrivalMessage && arrivalMessage.sender !== currentUserId) {
      setConversations((prev) => {
        const updatedConversations = prev.map((conv) => {
          if (conv._id === arrivalMessage.conversationId) {
            return {
              ...conv,
              lastMessage: arrivalMessage.text,
              updatedAt: arrivalMessage.createdAt,
            };
          }
          return conv;
        });

        return updatedConversations.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });
    }
  }, [arrivalMessage, currentUserId]);

  const getFilteredConversations = () => {
    let filtered = conversations;

    if (searchTerm) {
      filtered = filtered.filter((conversation) =>
        conversation.groupTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation._id.includes(searchTerm)
      );
    }

    switch (filter) {
      case 'active':
        filtered = filtered.filter(conv => isConversationActive(conv));
        break;
      case 'recent':
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        filtered = filtered.filter(conv => new Date(conv.updatedAt) > dayAgo);
        break;
      default:
        break;
    }

    return filtered;
  };

  const isConversationActive = (conversation) => {
    return conversation.members?.some((memberId) =>
      onlineUsers.some((user) => user.userId === memberId && memberId !== currentUserId)
    );
  };

  const getConversationInfo = (conversation) => {
    const otherMember = conversation.members?.find((member) => member !== currentUserId);
    
    return {
      name: conversation.groupTitle || `Chat ${conversation._id?.slice(-8) || 'Unknown'}`,
      isOnline: isConversationActive(conversation),
      memberCount: conversation.members?.length || 0,
      otherMember
    };
  };

  const formatDate = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const messageDate = new Date(date);
    const diffTime = Math.abs(now - messageDate);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return messageDate.toLocaleDateString([], { weekday: "short" });
    return messageDate.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const handleConversationClick = (conversationId) => {
    if (onSelectConversation && conversationId) {
      onSelectConversation(conversationId);
    }
  };

  const filteredConversations = getFilteredConversations();
  const activeConversationsCount = conversations.filter(conv => isConversationActive(conv)).length;
  const recentConversationsCount = conversations.filter(conv => {
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return new Date(conv.updatedAt) > dayAgo;
  }).length;

  if (!currentUserId || !currentUser) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in</h3>
          <p className="text-gray-600">You need to be logged in to view your messages</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center p-12">
        <div className="text-gray-400 mb-6">
          <MessageCircle className="w-20 h-20 mx-auto" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-700 mb-3">No Messages Yet</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          You don't have any conversations yet.
        </p>
      
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="all">All Conversations</option>
            <option value="active">Active Now</option>
            <option value="recent">Recent (24h)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Conversations</p>
              <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Now</p>
              <p className="text-2xl font-bold text-gray-900">{activeConversationsCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recent (24h)</p>
              <p className="text-2xl font-bold text-gray-900">{recentConversationsCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `No conversations match "${searchTerm}"` 
                : "No conversations match your current filter."
              }
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const info = getConversationInfo(conversation);
            return (
              <div
                key={conversation._id}
                onClick={() => handleConversationClick(conversation._id)}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:border-gray-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {(currentUser?.name?.charAt(0) || 'U').toUpperCase()}
                      </div>
                      {info.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate text-lg">
                          {currentUser?.name || 'Unknown User'}
                        </h3>
                        <span className="text-sm text-gray-400 flex-shrink-0 ml-2">
                          {formatDate(conversation.updatedAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{info.memberCount} participant{info.memberCount > 1 ? 's' : ''}</span>
                        </div>

                        {info.isOnline && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                            Online
                          </span>
                        )}
                      </div>

                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          <span className="font-medium text-gray-700">Last message:</span>{" "}
                          {conversation.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AllMessages;