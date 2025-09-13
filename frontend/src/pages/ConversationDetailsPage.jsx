import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import { ArrowLeft, MessageSquare, Users, Clock, Trash2, Info, Eye } from "lucide-react"
import api from "../components/axiosCongif"
import Cookies from "js-cookie"
import UserMessages from "./UserMessages"

const ConversationDetailsPage = () => {
  const navigate = useNavigate()
  const { seller } = useSelector((state) => state.seller)
  const { user } = useSelector((state) => state.user)
  const conversationId = useParams().id

  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [messageStats, setMessageStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    lastActivity: null,
  })

  const currentUserId =  user?._id
  const currentUserType = user ? "user" : "seller"

  useEffect(() => {
    if (!conversationId || !currentUserId) return
    fetchConversationDetails()
  }, [conversationId, currentUserId, seller])

  const fetchConversationDetails = async () => {
    try {
      setLoading(true)
      const conversationEndpoint = seller ? `/all-conversations/${currentUserId}` : `/conversations/${currentUserId}`

      const conversationsResponse = await api.get(conversationEndpoint, {
        headers: { Authorization: `Bearer ${Cookies.get("seller_token")}` },
      })

      if (conversationsResponse.data.success) {
        const foundConversation = conversationsResponse.data.conversations.find((conv) => conv._id === conversationId)

        if (!foundConversation) {
          toast.error("Conversation not found")
          return
        }

        setConversation(foundConversation)

        // Fetch messages for display only
        const messagesResponse = await api.get(`/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        })

        if (messagesResponse.data.success) {
          const msgs = messagesResponse.data.messages || []
          setMessages(msgs)

          const unreadCount = msgs.filter((msg) => msg.sender !== currentUserId && !msg.isRead).length

          const lastMessage = msgs[msgs.length - 1]

          setMessageStats({
            totalMessages: msgs.length,
            unreadMessages: unreadCount,
            lastActivity: lastMessage ? new Date(lastMessage.createdAt) : new Date(foundConversation.updatedAt),
          })
        } else {
          setMessages([])
          setMessageStats({
            totalMessages: 0,
            unreadMessages: 0,
            lastActivity: new Date(foundConversation.updatedAt),
          })
        }
      } else {
        toast.error("Failed to load conversations")
      }
    } catch (error) {
      toast.error("Failed to load conversation details")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConversation = async () => {
    if (!window.confirm("Are you sure you want to delete this conversation?")) {
      return
    }

    try {
      await api.delete(`/conversation/${conversationId}`, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      })

      toast.success("Conversation deleted successfully")
      navigate("/products")
    } catch (error) {
      toast.error("Failed to delete conversation")
    }
  }

  // Navigate to chat
  const handleOpenChat = () => {
    const chatPath = seller ? `/user-messages/${conversationId}` : `/dashboard/messages/${conversationId}`
    navigate(chatPath)
  }

  const getOtherParticipant = () => {
    if (!conversation?.members) return null
    return conversation.members.find((memberId) => memberId !== currentUserId)
  }

  const formatDate = (date) => {
    if (!date) return "Unknown"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatRelativeTime = (date) => {
    if (!date) return "Unknown"
    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return formatDate(date)
  }

  const otherParticipant = getOtherParticipant()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    )
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
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate("/products")} className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Conversation Details</h1>
                  <p className="text-gray-600">View conversation information and message history</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenChat}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open Chat
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Stats Cards */}
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
                <Eye className="w-8 h-8" />
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

          {/* Conversation Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 text-black">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Conversation Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Conversation ID:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{conversationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatDate(conversation.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{formatDate(conversation.updatedAt)}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Participants:</span>
                  <span className="font-medium">{conversation.members?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      conversation.isActive !== false ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {conversation.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Role:</span>
                  <span className="font-medium capitalize">{currentUserType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Participants
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {(user?.name?.charAt(0) || "U").toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {user?.name} <span className="text-blue-600 text-sm">(You)</span>
                  </p>
                  <p className="text-sm text-gray-600 capitalize">Role: {currentUserType}</p>
                  <p className="text-xs text-gray-500">ID: {currentUserId}</p>
                </div>
              </div>

              {otherParticipant && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                    O
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{seller?.name}</p>
                    <p className="text-sm text-gray-600">Role: {currentUserType === "seller" ? "User" : `Seller`}</p>
                    <p className="text-xs text-gray-500">ID: {otherParticipant}</p>
                  </div>
                </div>
              )}
            </div>
          </div>


          <UserMessages
            messages={messages}
            currentUserId={currentUserId}
            otherParticipantId={otherParticipant}
            otherParticipantInfo={{
              name: currentUserType === "seller" ? "Customer" : `${seller?.name || "Seller"}`,
              role: currentUserType === "seller" ? "user" : "seller",
            }}
            conversationId={conversationId}
            loading={loading}
          />

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleOpenChat}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <MessageSquare className="w-4 h-4" />
                Continue Chat
              </button>

              <button
                onClick={handleDeleteConversation}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete Conversation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConversationDetailsPage
