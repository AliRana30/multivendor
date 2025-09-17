import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import { ArrowLeft, MessageSquare, Trash2 } from "lucide-react"
import api from "../components/axiosCongif"
import Cookies from "js-cookie"
import UserMessages from "./UserMessages"

const ConversationDetailsPage = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.user)
  const conversationId = useParams().id

  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sellerInfo, setSellerInfo] = useState(null)

  const currentUserId = user?._id
  const currentUserType = "user"

  useEffect(() => {
    scrollTo(0,0)
    if (!conversationId || !currentUserId) return
    fetchConversationDetails()
  }, [conversationId, currentUserId])

  const fetchConversationDetails = async () => {
    try {
      setLoading(true)
      const token = Cookies.get("token")

      // Fetch conversation details
      const conversationsResponse = await api.get(`/conversations/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (conversationsResponse.data.success) {
        const foundConversation = conversationsResponse.data.conversations.find((conv) => conv._id === conversationId)

        if (!foundConversation) {
          toast.error("Conversation not found")
          return
        }

        setConversation(foundConversation)

        const sellerId = foundConversation.members?.find(memberId => memberId !== currentUserId)

        // Fetch seller informations
        if (sellerId) {
              setSellerInfo(currentUserType)
        }

        // Fetch messages
        const messagesResponse = await api.get(`/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (messagesResponse.data.success) {
          const msgs = messagesResponse.data.messages || []
          setMessages(msgs)
        } else {
          setMessages([])
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
      const token = Cookies.get("token")
      
      await api.delete(`/conversation/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success("Conversation deleted successfully")
      navigate("/")
    } catch (error) {
      toast.error("Failed to delete conversation")
    }
  }

  const handleOpenChat = () => {
    navigate(`/user-messages/${conversationId}`)
  }

  const getOtherParticipant = () => {
    if (!conversation?.members) return null
    return conversation.members.find((memberId) => memberId !== currentUserId)
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
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Conversation with Seller</h1>
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
                <button
                  onClick={handleDeleteConversation}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <UserMessages
            messages={messages}
            currentUserId={currentUserId}
            otherParticipantId={otherParticipant}
            otherParticipantInfo={{
              name: sellerInfo?.name || sellerInfo?.shopname || "Seller",
              shopName: sellerInfo?.shopname || sellerInfo?.name || "Shop",
              role: "seller",
            }}
            conversationId={conversationId}
            loading={loading}
            isSeller={false}
          />
        </div>
      </div>
    </div>
  )
}

export default ConversationDetailsPage