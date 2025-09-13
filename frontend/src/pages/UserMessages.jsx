import { useState, useMemo, useEffect } from "react"
import { Search, Filter, MessageCircle, Clock, CheckCircle2, User, Store } from "lucide-react"

const UserMessages = ({
  messages = [],
  currentUserId ,
  isSeller = false,
  otherUserInfo = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all") 
  const [sortBy, setSortBy] = useState("newest") 


  useEffect(()=>{
    console.log(currentUserId)
  },[])
  
  const filteredMessages = useMemo(() => {
    const filtered = messages.filter((message) => {
      if (searchTerm && !message.text?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      const isMyMessage = String(message.sender) === String(currentUserId)
      switch (filterType) {
        case "sent":
          return isMyMessage
        case "received":
          return !isMyMessage
        case "unread":
          return !message.isRead
        default:
          return true
      }
    })

    // Sort messages
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt)
      const dateB = new Date(b.createdAt)
      return sortBy === "newest" ? dateB - dateA : dateA - dateB
    })
  }, [messages, searchTerm, filterType, sortBy, currentUserId])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = messages.length
    const sent = messages.filter((msg) => String(msg.sender) === String(currentUserId)).length
    const received = total - sent
    const unread = messages.filter((msg) => !msg.isRead).length

    return { total, sent, received, unread }
  }, [messages, currentUserId])

  const formatMessageTime = (date) => {
    const messageDate = new Date(date)
    const now = new Date()
    const diffInHours = (now - messageDate) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else if (diffInHours < 168) {
      // 7 days
      return messageDate.toLocaleDateString([], {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    } else {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  const getMessagePreview = (message) => {
    if (message.text) {
      return message.text.length > 100 ? message.text.substring(0, 100) + "..." : message.text
    }
    if (message.images && message.images.length > 0) {
      return `📷 ${message.images.length} image${message.images.length > 1 ? "s" : ""}`
    }
    return "No content"
  }

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Please log in to view messages</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
              {otherUserInfo?.name?.charAt(0).toUpperCase() ||
                otherUserInfo?.shopName?.charAt(0).toUpperCase() ||
                (isSeller ? "U" : "S")}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {otherUserInfo?.name || otherUserInfo?.shopName || "Conversation"}
              </h3>
              <p className="text-sm text-gray-500">{isSeller ? "Customer Messages" : "Seller Messages"}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{stats.total} Messages</p>
            <p className="text-xs text-gray-500">{stats.unread > 0 && `${stats.unread} unread`}</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <MessageCircle className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-semibold text-blue-900">{stats.total}</p>
            <p className="text-xs text-blue-600">Total</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <User className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-semibold text-green-900">{stats.sent}</p>
            <p className="text-xs text-green-600">Sent</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <Store className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-semibold text-purple-900">{stats.received}</p>
            <p className="text-xs text-purple-600">Received</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <Clock className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-semibold text-orange-900">{stats.unread}</p>
            <p className="text-xs text-orange-600">Unread</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Messages</option>
            <option value="sent">Sent by Me</option>
            <option value="received">Received</option>
            <option value="unread">Unread</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span>
              {filteredMessages.length} of {messages.length}
            </span>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">
                {searchTerm || filterType !== "all" ? "No messages match your filters" : "No messages yet"}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMessages.map((message) => {
              const isMyMessage = String(message.sender) === String(currentUserId)

              return (
                <div key={message._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Message Direction Indicator */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        isMyMessage ? (isSeller ? "bg-green-500" : "bg-blue-500") : "bg-gray-400"
                      }`}
                    >
                      {isMyMessage ? "You" : isSeller ? "C" : "S"}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {isMyMessage
                            ? "You"
                            : otherUserInfo?.name || otherUserInfo?.shopName || (isSeller ? "Customer" : "Seller")}
                        </p>
                        <div className="flex items-center gap-2">
                          {!message.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          <span className="text-xs text-gray-500">{formatMessageTime(message.createdAt)}</span>
                        </div>
                      </div>

                      {/* Message Preview */}
                      <p className="text-sm text-gray-600 mb-2">{getMessagePreview(message)}</p>

                      {/* Message Images Preview */}
                      {message.images && message.images.length > 0 && (
                        <div className="flex gap-1 mb-2">
                          {message.images.slice(0, 3).map((img, idx) => (
                            <div key={idx} className="w-12 h-12 bg-gray-200 rounded border overflow-hidden">
                              <img
                                src={img || "/placeholder.svg"}
                                alt={`attachment-${idx}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none"
                                }}
                              />
                            </div>
                          ))}
                          {message.images.length > 3 && (
                            <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                              +{message.images.length - 3}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message Status */}
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            isMyMessage ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isMyMessage ? "Sent" : "Received"}
                        </span>
                        {message.isRead && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-3 h-3" />
                            Read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Summary */}
      {filteredMessages.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            Showing {filteredMessages.length} of {messages.length} messages
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
      )}
    </div>
  )
}

export default UserMessages
