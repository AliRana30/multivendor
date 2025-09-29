import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import api from "../components/axiosCongif"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import ShopSettings from "./ShopSettings"
import { getAllProducts } from "../../redux/actions/product"

const ShopInfo = ({ isOwner }) => {
  const { seller ,isSeller} = useSelector((state) => state.seller)
  const { products } = useSelector((state) => state.product)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const dispatch = useDispatch()

  const LogOutHandler = async () => {
    if (isLoggingOut) return

    try {
      setIsLoggingOut(true)
      const { data } = await api.get("/shop-logout", { withCredentials: true })
      window.location.reload()

      if (data.success) {
        toast.success(data.message || "Logged out successfully")
        Cookies.remove("seller_token")
        setTimeout(() => {
          navigate("/shop-login", { replace: true })
        }, 1000)
      } else {
        toast.error(data.message || "Logout failed")
        setIsLoggingOut(false)
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error(error.response?.data?.message || "Logout failed. Please try again.")
      setIsLoggingOut(false)
    }
  }

  const handleEditShop = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllProducts(seller._id))
    }
  }, [dispatch, seller?._id])

  useEffect(() => {
    if (!seller?._id) {
      navigate("/shop-login", { replace: true })
    }
  }, [seller?._id])

  return (
    <>
      <div className="p-4 sm:p-6 relative">
        <div className="flex justify-center mb-4 sm:mb-6">
          {seller?.avatar?.url ? (
            <img
              src={`https://multivendors-7cy2.onrender.com/${seller.avatar.url}`}
              alt="Shop Avatar"
              className="w-16 sm:w-20 h-16 sm:h-20 rounded-full object-cover border-4 border-gray-100 shadow-sm"
            />
          ) : (
            <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0v-3.28a1 1 0 01.684-.948l1.923-.641M7 21V5a2 2 0 012-2h2a2 2 0 012 2v16"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="text-center border-b border-gray-100 pb-3 sm:pb-4">
            <h3 className="font-bold text-base sm:text-lg text-gray-900">{seller?.name || "Shop Name"}</h3>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div>
              <h5 className="font-medium text-gray-700 text-xs sm:text-sm mb-1">Email</h5>
              <p className="text-gray-600 text-xs sm:text-sm break-words">{seller?.email || "Not provided"}</p>
            </div>

            <div>
              <h5 className="font-medium text-gray-700 text-xs sm:text-sm mb-1">Address</h5>
              <p className="text-gray-600 text-xs sm:text-sm break-words">{seller?.address || "Not provided"}</p>
            </div>

            <div>
              <h5 className="font-medium text-gray-700 text-xs sm:text-sm mb-1">Phone Number</h5>
              <p className="text-gray-600 text-xs sm:text-sm">{seller?.phoneNumber || "Not provided"}</p>
            </div>

            <div>
              <h5 className="font-medium text-gray-700 text-xs sm:text-sm mb-1">Total Products</h5>
              <p className="text-gray-600 text-xs sm:text-sm">{products?.length || "No Product"}</p>
            </div>

            <div>
              <h5 className="font-medium text-gray-700 text-xs sm:text-sm mb-1">Joined On</h5>
              <p className="text-gray-600 text-xs sm:text-sm">
                {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString() : "Not available"}
              </p>
            </div>
          </div>

          {isOwner && isSeller && (
            <div className="pt-3 sm:pt-4 border-t border-gray-100 space-y-2 sm:space-y-3">
              <button
                className="w-full text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 border border-blue-200 relative z-10"
                onClick={handleEditShop}
              >
                Edit Shop
              </button>
              <button
                onClick={LogOutHandler}
                disabled={isLoggingOut}
                className={`w-full py-2 px-3 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium relative z-10 ${
                  isLoggingOut ? "bg-gray-600 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-900"
                } text-white`}
              >
                {isLoggingOut ? "Logging Out..." : "Log Out"}
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCloseModal} />
          <div className="relative z-10 w-full max-w-2xl mx-4">
            <ShopSettings isOpen={isModalOpen} onClose={handleCloseModal} />
          </div>
        </div>
      )}
    </>
  )
}

export default ShopInfo


