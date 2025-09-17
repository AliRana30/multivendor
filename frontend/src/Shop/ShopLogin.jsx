import { useEffect, useState } from "react"
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi"
import toast, { Toaster } from "react-hot-toast"
import { Link, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import api from "../components/axiosCongif"
import Cookies from "js-cookie"

const ShopLogin = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const { isSeller, seller } = useSelector((state) => state.seller)

  useEffect(() => {
    if (seller?._id) {
      navigate(`/shop/${seller._id}`, { replace: true })
    }
  }, [isSeller, seller, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Both fields are required.")
      return
    }

    if (isLoading) return

    try {
      setIsLoading(true)

      const res = await api.post("/shop-login", { email, password }, { withCredentials: true })
      window.location.reload()
      console.log("Login response:", res.data)

      if (res.data.success && res.data.seller) {
        if (res.data.token) {
          Cookies.set("seller_token", res.data.token)
        }
        toast.success("Login Successful!")
        setTimeout(() => {
          navigate(`/shop/${res.data.seller._id}`, { replace: true })
        }, 1500)
      } else {
        toast.error(res.data.message || "Login failed - Invalid credentials")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Login error:", error)

      if (error.response?.status === 401) {
        toast.error("Invalid email or password")
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.message || "Invalid credentials")
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Network error. Please check your connection.")
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen fixed top-0 left-0 flex items-center justify-center bg-gray-900 px-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Login To Your Shop</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="text-gray-300 block mb-1">
              Email
            </label>
            <div className="flex items-center bg-gray-700 rounded-md px-3">
              <FiMail className="text-gray-400 mr-2" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                className="bg-transparent w-full py-2 text-white focus:outline-none"
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="text-gray-300 block mb-1">
              Password
            </label>
            <div className="flex items-center bg-gray-700 rounded-md px-3 relative">
              <FiLock className="text-gray-400 mr-2" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent w-full py-2 text-white focus:outline-none pr-10"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 text-gray-400 hover:text-white"
                disabled={isLoading}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-medium py-2 rounded-md transition ${
              isLoading ? "bg-red-700 cursor-not-allowed opacity-50" : "bg-red-600 hover:bg-red-700"
            } text-white`}
          >
            {isLoading ? "Signing In..." : "Login"}
          </button>
        </form>

        <p className="text-gray-400 mt-4 text-sm text-center">
          Don't have any Shop?{" "}
          <Link to="/create-shop" className="text-red-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ShopLogin
