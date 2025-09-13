import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      <nav className="hidden lg:block bg-blue-600 shadow-md sticky top-0 z-30 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            
            {/* Left - Category Dropdown */}
            <div className="relative">
              <select
                onChange={handleCategorySelect}
                className="bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="" className="text-black">
                  Categories
                </option>
                {categoriesData.map((cat, i) => (
                  <option key={i} value={cat.title} className="text-white">
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Center - Nav Links */}
            <div className="flex space-x-8">
              {navItems.map((item, i) => (
                <Link
                  key={i}
                  to={item.url}
                  className="text-white hover:text-blue-200 font-medium transition-colors duration-200 text-sm"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right - Icons */}
            <div className="flex items-center space-x-5 ">
              
              {/* Wishlist */}
              <div className="relaative">
                <FiHeart
                  size={20}
                  onClick={() => setOpenWishList(true)}
                  className="cursor-pointer text-white hover:text-red-300 transition-colors"
                />
                {totalWishlistItems > 0 && (
                  <span className="absolute top-[8px] right-[24vh] bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {totalWishlistItems > 99 ? '99+' : totalWishlistItems}
                  </span>
                )}
              </div>

              {/* Cart */}
              <div className="relative">
                <FiShoppingCart
                  size={20}
                  onClick={() => setOpenCart(true)}
                  className="cursor-pointer text-white hover:text-green-300 transition-colors"
                />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {totalCartItems > 99 ? '99+' : totalCartItems}
                  </span>
                )}
              </div>

              {/* User Profile/Login */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link to="/profile">
                    <Avatar
                      src={user?.avatar?.url ? `http://localhost:5000/uploads/${user?.avatar?.url}` : "/default-avatar.png"}
                      className="cursor-pointer"
                      sx={{ width: 28, height: 28 }}
                    />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-red-300 transition-colors"
                    title="Logout"
                  >
                    <FaPowerOff size={14} />
                  </button>
                </div>
              ) : (
                <Link to="/login">
                  <div className="bg-blue-700 p-2 rounded-md text-white hover:bg-blue-800 transition-colors">
                    <FiUser size={16} />
                  </div>
                </Link>
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