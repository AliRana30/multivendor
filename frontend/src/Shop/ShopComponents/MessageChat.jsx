import { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Send, ImageIcon, MoreVertical, Info } from "lucide-react"
import api from "../../components/axiosCongif"
import socketIo from "socket.io-client"
import Cookies from "js-cookie"

const ENDPOINT = "http://localhost:4000"
let socket = null

const MessageChat = ({ conversationId: propConversationId, onBack }) => {
  const params = useParams()
  const navigate = useNavigate()

  const conversationId = propConversationId || params.conversationId || params.id

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const conversationDataRef = useRef(null)
  const socketInitialized = useRef(false)

  const { seller } = useSelector((state) => state.seller)
  const { user } = useSelector((state) => state.user)

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [conversation, setConversation] = useState(null)
  const [selectedImages, setSelectedImages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [error, setError] = useState(null)
  const [otherUserInfo, setOtherUserInfo] = useState(null)

  const currentUserId = seller?._id || user?._id
  const isSeller = !!seller
  const userRole = isSeller ? "seller" : "user"

  // Initialize socket
  useEffect(() => {
    if (currentUserId && !socket && !socketInitialized.current) {
      console.log("Initializing socket connection...")
      socket = socketIo(ENDPOINT, {
        transports: ["websocket"],
        forceNew: true,
      })
      socketInitialized.current = true
    }

    return () => {
      // Don't disconnect socket here
    }
  }, [currentUserId])

  // Socket event setup
  useEffect(() => {
    if (!currentUserId || !socket || !conversationId || !socketInitialized.current) return

    console.log("Setting up socket listeners for conversation:", conversationId)

    socket.off("getUsers")
    socket.off("getMessage")
    socket.off("messageSeen")

    socket.emit("addUser", currentUserId)

    const handleUsers = (users) => {
      setOnlineUsers(users)
    }

    const handleMessage = (data) => {
      if (data.conversationId === conversationId && data.senderId !== currentUserId) {
        const newMessage = {
          _id: data.messageId || Date.now().toString(),
          conversationId: data.conversationId,
          text: data.text || data.message || "",
          sender: data.senderId || data.sender,
          images: data.images || [],
          createdAt: new Date(),
          isRead: false,
        }

        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === newMessage._id)
          if (exists) return prev
          return [...prev, newMessage]
        })

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      }
    }

    const handleMessageSeen = (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => prev.map((msg) => (msg._id === data.messageId ? { ...msg, isRead: true } : msg)))
      }
    }

    socket.on("getUsers", handleUsers)
    socket.on("getMessage", handleMessage)
    socket.on("messageSeen", handleMessageSeen)
    socket.emit("joinConversation", conversationId)

    return () => {
      if (socket) {
        socket.off("getUsers", handleUsers)
        socket.off("getMessage", handleMessageSeen)
        socket.off("messageSeen", handleMessageSeen)
        socket.emit("leaveConversation", conversationId)
      }
    }
  }, [currentUserId, conversationId, socketInitialized.current])

  // Fetch conversation and messages
  useEffect(() => {
    const fetchConversationData = async () => {
      if (!conversationId || !currentUserId) {
        setLoading(false)
        setError("Missing conversation ID or user information")
        return
      }

      try {
        setLoading(true)
        setError(null)

        const token = isSeller ? Cookies.get("seller_token") : localStorage.getItem("token")
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }

        let conversationData = null
        let messagesData = []

        //shared endpoint that works for both users and sellers
        try {
          const conversationResponse = await api.get(`/conversation/${conversationId}`, {
            withCredentials: true,
            headers,
          })

          if (conversationResponse.data && conversationResponse.data.success !== false) {
            conversationData = conversationResponse.data.conversation || conversationResponse.data
          }
        } catch (convError) {
          console.error("Conversation fetch failed:", convError)
          setError("Failed to load conversation")
          return
        }

        //role-specific message endpoints
        try {
          if (conversationData && conversationData.members?.includes(currentUserId)) {
            const messagesEndpoint = isSeller ? `/seller/messages/${conversationId}` : `/messages/${conversationId}`

            const messagesResponse = await api.get(messagesEndpoint, {
              withCredentials: true,
              headers,
            })

            if (messagesResponse.data && messagesResponse.data.success !== false) {
              messagesData = messagesResponse.data.messages || messagesResponse.data.data || []
            }
          }
        } catch (messagesError) {
          console.error("Messages fetch failed:", messagesError)
          messagesData = []
        }

        if (conversationData && conversationData.members) {
          const otherUserId = conversationData.members.find((member) => member !== currentUserId)
          if (otherUserId) {
            try {
              const otherUserEndpoint = isSeller ? `/user/${otherUserId}` : `/shop/${otherUserId}`

              const otherUserResponse = await api.get(otherUserEndpoint, { headers })
              if (otherUserResponse.data && otherUserResponse.data.success !== false) {
                setOtherUserInfo(otherUserResponse.data.user || otherUserResponse.data.seller)
              }
            } catch (userError) {
              console.warn("Failed to fetch other user info:", userError)
            }
          }
        }

        if (conversationData) {
          setConversation(conversationData)
          conversationDataRef.current = conversationData
          setMessages(Array.isArray(messagesData) ? messagesData : [])
        } else {
          setError("Conversation not found or inaccessible")
        }
      } catch (error) {
        console.error("Error in fetchConversationData:", error)
        setError("Failed to load conversation")
        toast.error("Failed to load conversation")
      } finally {
        setLoading(false)
      }
    }

    fetchConversationData()
  }, [conversationId, currentUserId, isSeller])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed")
      return
    }

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`)
        return false
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`)
        return false
      }
      return true
    })

    setSelectedImages(validFiles)
  }

  const removeSelectedImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Role-based message sending with endpoint selection
  const handleSendMessage = async () => {
    if (!newMessage.trim() && selectedImages.length === 0) return
    if (!currentUserId || !conversationId) {
      toast.error("Missing required information")
      return
    }

    const messageText = newMessage.trim()
    const tempMessageId = Date.now().toString()

    const tempMessage = {
      _id: tempMessageId,
      conversationId,
      text: messageText,
      sender: currentUserId,
      images: selectedImages.map((img) => URL.createObjectURL(img)),
      createdAt: new Date(),
      isRead: false,
      sending: true,
    }

    setMessages((prev) => [...prev, tempMessage])
    setNewMessage("")
    const imagesToSend = [...selectedImages]
    setSelectedImages([])

    try {
      setSending(true)

      const formData = new FormData()
      formData.append("conversationId", conversationId)
      formData.append("text", messageText)
      formData.append("sender", currentUserId)

      imagesToSend.forEach((image) => {
        formData.append("images", image)
      })

      //  Use role-specific endpoint
      const endpoint = isSeller ? "/seller/create-new-message" : "/create-new-message"
      const token = isSeller ? Cookies.get("seller_token") : Cookies.get("token")

      const response = await api.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        timeout: 15000,
      })

      if (response.data && response.data.success !== false) {
        const realMessage = {
          _id: response.data._id || response.data.message?._id || tempMessageId,
          conversationId,
          text: messageText,
          sender: currentUserId,
          images: response.data.images || [],
          createdAt: response.data.createdAt ? new Date(response.data.createdAt) : new Date(),
          isRead: false,
        }

        setMessages((prev) => prev.map((msg) => (msg._id === tempMessageId ? realMessage : msg)))

        // Send via socket with role information
        if (socket && socketInitialized.current) {
          const currentConversation = conversationDataRef.current || conversation
          const otherMembers = currentConversation?.members?.filter((member) => member !== currentUserId) || []

          otherMembers.forEach((receiverId) => {
            const socketData = {
              senderId: currentUserId,
              senderRole: userRole,
              receiverId: receiverId,
              conversationId: conversationId,
              text: messageText,
              message: messageText,
              images: response.data.images || [],
              messageId: realMessage._id,
              timestamp: realMessage.createdAt,
              source: "messageChat",
            }

            socket.emit("sendMessage", socketData)
          })
        }

        // Update conversation last message
        try {
          await api.put(
            `/conversation/${conversationId}/last-message`,
            {
              lastMessage: messageText || "Image",
              lastMessageId: realMessage._id,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
        } catch (updateError) {
          console.warn("Failed to update last message:", updateError)
        }

        toast.success(`Message sent successfully!`)
      } else {
        throw new Error(response.data?.message || "Failed to send message")
      }
    } catch (error) {
      console.error("Send message error:", error)

      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessageId))
      setNewMessage(messageText)
      setSelectedImages(imagesToSend)

      const errorMsg = error.response?.data?.message || error.message || "Failed to send message"
      toast.error(errorMsg)
    } finally {
      setSending(false)
    }
  }

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isUserOnline = (userId) => {
    return onlineUsers.some((user) => user.userId === userId)
  }

  const getOtherParticipant = () => {
    if (!conversation || !conversation.members) return null
    return conversation.members.find((member) => member !== currentUserId)
  }

  const handleBack = () => {
    if (onBack && typeof onBack === "function") {
      onBack()
    } else {
      const backPath = isSeller ? "/shop-dashboard/all-messages" : "/dashboard/messages"
      navigate(backPath)
    }
  }

  const otherParticipant = getOtherParticipant()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={handleBack} className="text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
            Back to Messages
          </button>
        </div>
      </div>
    )
  }

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">Please log in to access this conversation</p>
          <button
            onClick={() => navigate(isSeller ? "/shop-login" : "/login")}
            className="text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                {otherUserInfo?.name?.charAt(0).toUpperCase() || (isSeller ? "U" : "S")}
              </div>
              {otherParticipant && isUserOnline(otherParticipant) && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>

            <div>
              <h3 className="font-medium text-gray-900">
                {otherUserInfo?.name ||
                  otherUserInfo?.shopName ||
                  `${isSeller ? user?.name : "Shop"}`}
              </h3>
              <p className="text-sm text-gray-500">
                {otherParticipant && isUserOnline(otherParticipant) ? "Online" : "Offline"} •
                {isSeller ? " Customer" : " Seller"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {isSeller ? "Shop Chat" : "Customer Chat"}
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Info className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/*  Messages with distinct styling per role */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p>No messages yet. Start the conversation!</p>
              <p className="text-sm mt-2">
                {isSeller ? "Send a message to your customer" : "Send a message to the seller"}
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const messageSender = String(message.sender)
            const currentUserIdStr = String(currentUserId)
            const isMyMessage = messageSender === currentUserIdStr

            return (
              <div key={message._id} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isMyMessage
                      ? isSeller
                        ? "bg-green-600 text-white rounded-br-sm" // Seller messages in green
                        : "bg-blue-600 text-white rounded-br-sm" // User messages in blue
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  } ${message.sending ? "opacity-70" : ""}`}
                >
                  {message.images && message.images.length > 0 && (
                    <div className="mb-2 space-y-2">
                      {message.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={typeof img === "string" ? img : URL.createObjectURL(img)}
                          alt={`attachment-${idx}`}
                          className="rounded-lg max-h-40 object-cover w-full"
                        />
                      ))}
                    </div>
                  )}

                  {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}

                  <div className="flex items-center justify-between mt-1">
                    <p
                      className={`text-xs ${
                        isMyMessage ? (isSeller ? "text-green-100" : "text-blue-100") : "text-gray-500"
                      }`}
                    >
                      {formatMessageTime(message.createdAt)}
                    </p>
                    {message.sending && (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin ml-2"></div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2 overflow-x-auto">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={URL.createObjectURL(image) || "/placeholder.svg"}
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
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full flex-shrink-0"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder={isSeller ? "Type a message to your customer..." : "Type a message to the seller..."}
              rows={1}
              className="w-full text-gray-900 px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ minHeight: "40px", maxHeight: "120px" }}
            />
          </div>

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && selectedImages.length === 0) || sending}
            className={`p-2 text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 ${
              isSeller ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
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
  )
}

export default MessageChat
