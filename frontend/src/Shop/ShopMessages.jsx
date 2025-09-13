import { useState, useEffect, useCallback } from "react"
import { useSelector } from "react-redux"
import { useParams, useNavigate } from "react-router-dom"
import DashboardHeader from "./ShopLayout/DashboardHeader"
import DashboardSideBar from "./ShopLayout/DashboardSideBar"
import AllMessages from "./ShopComponents/AllMessages"
import MessageChat from "./ShopComponents/MessageChat"

const ShopMessages = () => {
  const navigate = useNavigate()
  const params = useParams()

  const conversationIdFromUrl = params.conversationId || params.id

  const { seller } = useSelector((state) => state.seller)
  const { user } = useSelector((state) => state.user)

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [currentView, setCurrentView] = useState("list")
  const [activeConversationId, setActiveConversationId] = useState(conversationIdFromUrl || null)
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const currentUserId = seller?._id || user?._id

  const handleBackToMessages = useCallback(() => {
    setCurrentView("list")
    setActiveConversationId(null)

    const backPath = seller ? "/shop-dashboard/all-messages" : "/dashboard/messages"
    navigate(backPath, { replace: true })
  }, [navigate, seller])

  const handleSelectConversation = useCallback(
    (selectedConversationId) => {
      if (!selectedConversationId) return

      if (typeof selectedConversationId !== "string" || selectedConversationId.length < 12) {
        console.warn("Invalid conversation ID:", selectedConversationId)
        return
      }

      setCurrentView("chat")
      setActiveConversationId(selectedConversationId)

      const navigationPath = seller
        ? `/shop-dashboard/messages/${selectedConversationId}`
        : `/dashboard/messages/${selectedConversationId}`

      navigate(navigationPath)
    },
    [navigate, seller],
  )

  // Authentication check
  useEffect(() => {
    const checkAuth = () => {
      if (!currentUserId && !localStorage.getItem("token")) {
        const loginPath = seller ? "/shop-login" : "/login"
        navigate(loginPath, { replace: true })
        return
      }
      setIsAuthChecked(true)
    }

    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [currentUserId, navigate, seller])

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth < 768
      setIsMobile(isNowMobile)
      setIsSidebarOpen(!isNowMobile)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // FIXED: Initialize conversation ID from URL only once
  useEffect(() => {
    if (!isAuthChecked || !currentUserId) return

    // Only set the conversation ID if we haven't initialized yet
    if (!isInitialized) {
      if (
        conversationIdFromUrl &&
        conversationIdFromUrl !== "undefined" &&
        conversationIdFromUrl !== "null" &&
        conversationIdFromUrl !== "messages" &&
        typeof conversationIdFromUrl === "string" &&
        conversationIdFromUrl.length >= 12
      ) {
        setCurrentView("chat")
        setActiveConversationId(conversationIdFromUrl)
      } else {
        setCurrentView("list")
        setActiveConversationId(null)
      }
      setIsInitialized(true)
    }
  }, [conversationIdFromUrl, isAuthChecked, currentUserId, isInitialized])

  useEffect(() => {
    if (!isInitialized) return

    if (
      conversationIdFromUrl &&
      conversationIdFromUrl !== "undefined" &&
      conversationIdFromUrl !== "null" &&
      conversationIdFromUrl !== "messages" &&
      typeof conversationIdFromUrl === "string" &&
      conversationIdFromUrl.length >= 12
    ) {
      if (activeConversationId !== conversationIdFromUrl) {
        setCurrentView("chat")
        setActiveConversationId(conversationIdFromUrl)
      }
    } else if (conversationIdFromUrl === undefined && currentView === "chat") {
      setCurrentView("list")
      setActiveConversationId(null)
    }
  }, [conversationIdFromUrl, isInitialized, activeConversationId, currentView])

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const stableConversationId = activeConversationId

  console.log("Debug Info:", {
    conversationIdFromUrl,
    activeConversationId,
    stableConversationId,
    currentView,
    params,
    isInitialized,
  })

  if (!isAuthChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!currentUserId && localStorage.getItem("token")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="flex flex-col h-screen text-black bg-gray-50">
        <DashboardHeader onToggleSidebar={toggleSidebar} isMobile={isMobile} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Initializing messages...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen text-black bg-gray-50">
      <DashboardHeader onToggleSidebar={toggleSidebar} isMobile={isMobile} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`bg-white border-r border-gray-200 transition-all duration-300 shadow-sm ${
            isMobile
              ? isSidebarOpen
                ? "fixed z-50 top-0 left-0 w-64 h-full"
                : "hidden"
              : isSidebarOpen
                ? "w-64"
                : "w-0"
          }`}
        >
          {(isSidebarOpen || !isMobile) && <DashboardSideBar isCollapsed={!isSidebarOpen && !isMobile} />}
        </div>

        {isMobile && isSidebarOpen && (
          <div className="fixed inset-0 bg-black opacity-50 z-40" onClick={toggleSidebar}></div>
        )}

        {/* MessageChat */}
        <div className="flex-1 overflow-hidden bg-white">
          {currentView === "chat" && stableConversationId ? (
            <MessageChat
              key={stableConversationId}
              conversationId={stableConversationId}
              onBack={handleBackToMessages}
            />
          ) : currentView === "list" ? (
            <div className="h-full flex flex-col">
              {/* Messages Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                    <p className="text-gray-600 mt-1">Manage your conversations and messages</p>
                  </div>
                  <div className="text-sm text-gray-500">{seller ? "Shop Dashboard" : "User Dashboard"}</div>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto bg-gray-50">
                <AllMessages
                  key={`${currentUserId}`}
                  onSelectConversation={handleSelectConversation}
                  currentUserId={currentUserId}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShopMessages
