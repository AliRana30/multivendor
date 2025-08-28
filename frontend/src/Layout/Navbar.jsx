import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart, FiShoppingCart, FiUser } from "react-icons/fi";
import { useSelector } from "react-redux";
import { Avatar } from "@mui/material";
import { categoriesData } from "../../static/data";
import Cart from "../components/Cart";
import WishList from "../components/WishList";
import { FaPowerOff } from "react-icons/fa";
import api from "../components/axiosCongif";
import toast from "react-hot-toast";

const navItems = [
  { name: "Home", url: "/" },
  { name: "Best Selling", url: "/best-selling" },
  { name: "Products", url: "/products" },
  { name: "Events", url: "/events" },
  { name: "FAQ", url: "/faq" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const [openCart, setOpenCart] = useState(false);
  const [openWishList, setOpenWishList] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate total cart items
  const totalCartItems = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  
  // Calculate total wishlist items
  const totalWishlistItems = wishlist?.length || 0;

  const handleCategorySelect = (e) => {
    const selectedTitle = e.target.value;
    if (selectedTitle) {
      const formattedTitle = selectedTitle.toLowerCase().replace(/\s+/g, "-");
      navigate(`/product/${formattedTitle}`);
    }
  };

  const handleLogout = async () => {
    try {
      await api.get("/logout");
      toast.success("Logged out successfully");
      navigate("/login");
      window.location.reload(true);
    } catch (error) {
      toast.error("Logout failed");
    }
  };


  return (
    <>
      <nav className="z-0 hidden lg:block bg-gradient-to-r from-blue-600 via-purple-700 to-blue-800 dark:bg-gray-900 shadow-lg sticky top-0  border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left - Category Dropdown */}
            <div className="relative">
              <motion.div className="relative" whileHover={{ scale: 1.02 }}>
                <select
                  onChange={handleCategorySelect}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-2 rounded-full font-medium cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                >
                  <option value="" className="text-black">
                    Categories
                  </option>
                  {categoriesData.map((cat, i) => (
                    <option key={i} value={cat.title} className="text-gray-800">
                      {cat.title}
                    </option>
                  ))}
                </select>
              </motion.div>
            </div>

            {/* Center - Nav Links */}
            <div className="flex space-x-6 xl:space-x-8">
              {navItems.map((item, i) => (
                <motion.div key={i} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                  <Link
                    to={item.url}
                    className="text-white dark:text-gray-300 hover:text-blue-200 dark:hover:text-white font-medium transition-colors duration-200 relative group text-sm xl:text-base"
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Right - Icons */}
            <div className="flex items-center space-x-6">
              {/* Wishlist with Badge */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <FiHeart
                  size={20}
                  onClick={() => setOpenWishList(true)}
                  className="cursor-pointer text-white dark:text-gray-300 hover:text-red-400 transition-colors duration-200"
                />
                {/* Wishlist Badge */}
                {totalWishlistItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {totalWishlistItems > 99 ? '99+' : totalWishlistItems}
                  </span>
                )}
              </motion.div>

              {/* Cart with Badge */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <FiShoppingCart
                  size={20}
                  onClick={() => setOpenCart(true)}
                  className="cursor-pointer text-white dark:text-gray-300 hover:text-green-400 transition-colors duration-200"
                />
                {/* Cart Badge */}
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {totalCartItems > 99 ? '99+' : totalCartItems}
                  </span>
                )}
              </motion.div>

              {/* User Profile/Login */}
              {isAuthenticated ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center space-x-3"
                >
                  <Link to="/profile">
                    <Avatar
                      src={user?.avatar?.url ? `http://localhost:5000/uploads/${user?.avatar?.url}` : "/default-avatar.png"}
                      className="cursor-pointer border-2 border-blue-400"
                      sx={{ width: 32, height: 32 }}
                    />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-red-300 transition-colors duration-200"
                    title="Logout"
                  >
                    <FaPowerOff size={16} />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link to="/login">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
                      <FiUser size={16} />
                    </div>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebars */}
      <Cart openCart={openCart} setOpenCart={setOpenCart} />
      <WishList openWishList={openWishList} setOpenWishList={setOpenWishList} />
    </>
  );
};

export default Navbar;