import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiShoppingBag, FiHeart, FiShoppingCart, FiUser, FiMenu } from "react-icons/fi";
import { FaPowerOff } from "react-icons/fa";
import { categoriesData } from "../../static/data";
import { useSelector, useDispatch } from "react-redux";
import { getAllProductsFromAllSellers } from "../../redux/actions/product";
import { Avatar } from "@mui/material";
import Cart from "../components/Cart";
import WishList from "../components/WishList";
import api from "../components/axiosCongif";
import toast from "react-hot-toast";

const navItems = [
  { name: "Home", url: "/" },
  { name: "Best Selling", url: "/best-selling" },
  { name: "Products", url: "/products" },
  { name: "Events", url: "/events" },
  { name: "FAQ", url: "/faq" },
];

const searchResultVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      staggerChildren: 0.03
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
};

const mobileMenuVariants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [searchData, setSearchData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openWishList, setOpenWishList] = useState(false);
  
  const { seller } = useSelector((state) => state.seller);
  const { allProducts } = useSelector((state) => state.product);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);

  const totalCartItems = useMemo(() => 
    cart?.reduce((acc, item) => acc + item.quantity, 0) || 0, 
    [cart]
  );

  const Products = useMemo(() => {
    if (!allProducts?.length) return [];
    
    return allProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.name === product.name)
    );
  }, [allProducts]);

  const currentUser = useMemo(() => seller || user, [seller, user]);
  const isCurrentlySeller = useMemo(() => !!seller?._id, [seller?._id]);

  useEffect(() => {
    if ((!Products || Products.length === 0)) {
      dispatch(getAllProductsFromAllSellers());
    }
  }, [dispatch, Products?.length]);

  useEffect(() => {
    let timeoutId;
    
    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        setIsScrolled(window.scrollY > 20);
      }, 10);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Utility functions
  const getProductImageUrl = useCallback((product) => {
    if (product.image_Url && typeof product.image_Url === 'string') {
      return product.image_Url;
    }

    if (product.images?.length > 0) {
      const firstImage = product.images[0];
      
      if (typeof firstImage === 'string' && firstImage.startsWith('http')) {
        return firstImage;
      }
      
      if (typeof firstImage === 'object' && firstImage.url) {
        return firstImage.url.startsWith('http') ? firstImage.url : `http://localhost:5000${firstImage.url}`;
      }
      
      if (typeof firstImage === 'string') {
        return firstImage.startsWith('/') 
          ? `http://localhost:5000${firstImage}`
          : `http://localhost:5000/uploads/${firstImage}`;
      }
    }
    
    return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&q=80';
  }, []);

  const createProductSlug = useCallback((name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  // handleSearch
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);

    if (term.trim() === "") {
      setSearchData([]);
      return;
    }

    const filteredProducts = allProducts.filter((product) =>
      product.name.toLowerCase().includes(term.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(term.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(term.toLowerCase()))
    );
    
    setSearchData(filteredProducts.slice(0, 8));
  }, [allProducts]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setSearchData([]);
    setIsSearchFocused(false);
    setMobileSearchOpen(false);
  }, []);

  const handleCategorySelect = useCallback((selectedTitle) => {
    if (selectedTitle) {
      const formattedTitle = selectedTitle.toLowerCase().replace(/\s+/g, "-");
      navigate(`/product/${formattedTitle}`);
      setMobileMenuOpen(false);
    }
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await api.get("/logout");
      toast.success("Logged out successfully");
      navigate("/login");
      window.location.reload();
    } catch (error) {
      toast.error("Logout failed");
    }
  }, [navigate]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const closeMobileSearch = useCallback(() => {
    setMobileSearchOpen(false);
  }, []);

  // Search Component 
  const SearchComponent = ({ isMobile = false, onClose = null }) => (
    <div className={`relative ${isMobile ? 'w-full' : 'flex-1 max-w-2xl'}`}>
      <motion.div className="relative">
        <div className={`relative ${
          isMobile 
            ? 'bg-gray-100 rounded-lg' 
            : `bg-white/80 backdrop-blur-sm rounded-lg transition-all duration-300 ${
                isSearchFocused
                  ? "shadow-lg ring-2 ring-blue-200/50 bg-white"
                  : "shadow-md hover:shadow-lg"
              }`
        }`}>
          {!isMobile && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-lg"></div>
          )}
          
          <motion.div
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            animate={{ color: isSearchFocused ? "#3b82f6" : "#9ca3af" }}
            transition={{ duration: 0.2 }}
          >
            <FiSearch size={18} />
          </motion.div>
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            placeholder="Search products..."
            className={`relative w-full py-2.5 pl-10 pr-10 rounded-lg text-sm border-0 focus:outline-none bg-transparent text-gray-800 placeholder-gray-500 font-medium`}
          />
          
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ scale: 0, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, rotate: 90 }}
                whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  clearSearch();
                  onClose?.();
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-all duration-200 p-1 rounded-full"
                type="button"
              >
                <FiX size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Search Results */}
      <AnimatePresence>
        {searchData.length > 0 && (
          <motion.div
            variants={searchResultVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100/50 overflow-hidden z-50 ${
              isMobile ? 'max-h-40' : 'max-h-80'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 rounded-xl"></div>
            
            <div className="relative overflow-y-auto custom-scrollbar h-full">
              <div className="p-1">
                {searchData.map((item, index) => {
                  const productSlug = createProductSlug(item.name);
                  const isReduxProduct = item._id;
                  
                  return (
                    <motion.div
                      key={`${item.name}-${index}`}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ 
                        scale: 1.01,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <Link
                        to={isReduxProduct ? `/products/${productSlug}` : `/product/${productSlug}`}
                        state={isReduxProduct ? { productId: item._id } : undefined}
                        className="flex items-center p-2.5 hover:bg-white/70 transition-all duration-300 rounded-lg m-1 group border border-transparent hover:border-gray-100/50"
                        onClick={() => {
                          clearSearch();
                          onClose?.();
                        }}
                      >
                        <div className={`relative ${
                          isMobile ? 'w-10 h-10' : 'w-12 h-12'
                        } bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mr-3 flex-shrink-0 overflow-hidden`}>
                          <img
                            src={getProductImageUrl(item)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-gray-900 truncate text-sm group-hover:text-indigo-600 transition-colors duration-200`}>
                            {item.name}
                          </h4>
                          <span className="text-xs text-gray-500 font-medium">
                            {item.category || 'General'}
                          </span>
                          
                          {isReduxProduct && (
                            <div className="flex items-center mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all duration-200 ${
                                item.stock > 10 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : item.stock > 0 
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-red-100 text-red-700'
                              }`}>
                                {item.stock > 10 ? '✓ In Stock' : item.stock > 0 ? `${item.stock} left` : 'Out of Stock'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end flex-shrink-0 ml-2">
                          <div className="text-indigo-600 font-bold text-sm">
                            ${item.discountPrice || item.originalPrice || item.price || 0}
                          </div>
                          {item.originalPrice && item.discountPrice && item.originalPrice !== item.discountPrice && (
                            <>
                              <div className="text-xs text-gray-400 line-through font-medium">
                                ${item.originalPrice}
                              </div>
                              <div className="text-xs text-green-600 font-semibold">
                                {Math.round(((item.originalPrice - item.discountPrice) / item.originalPrice) * 100)}% OFF
                              </div>
                            </>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              
              {searchData.length >= 8 && (
                <div className="px-3 py-2 bg-gradient-to-r from-gray-50/80 to-gray-100/80 text-center border-t border-gray-100/50">
                  <p className="text-xs text-gray-600 font-medium">
                    Showing {searchData.length} results • <span className="text-indigo-600">Refine your search for more</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      <AnimatePresence>
        {searchTerm.length > 0 && searchData.length === 0 && !isSearchFocused && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100/50 p-4 z-50"
          >
            <div className="text-center">
              <div className="mx-auto mb-3 w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <FiSearch className="text-gray-400" size={18} />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">No products found</h3>
              <p className="text-xs text-gray-600 mb-1">We couldn't find anything matching <span className="font-semibold text-indigo-600">"{searchTerm}"</span></p>
              <p className="text-xs text-gray-500">Try a different search term</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

   // main header
  return (
    <>
      <motion.header 
        className={`sticky top-0 z-40 transition-all duration-300 ease-out ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100/50' 
            : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/3 to-pink-500/3"></div>
        
        <div className="relative max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
          
          {/* Mobile Layout */}
          <div className="flex lg:hidden items-center justify-between h-14">
            <motion.button
              onClick={() => setMobileMenuOpen(true)}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-700"
              type="button"
              aria-label="Open menu"
            >
              <FiMenu size={22} />
            </motion.button>

            <Link to="/" className="flex items-center">
              <img
                src="./MultiMart.png"
                className="w-12 h-auto"
                alt="MultiMart"
                loading="lazy"
              />
            </Link>

            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => setMobileSearchOpen(true)}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-700"
                type="button"
                aria-label="Search"
              >
                <FiSearch size={20} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpenWishList(true)}
                className="p-2 text-gray-700"
                type="button"
                aria-label="Wishlist"
              >
                <FiHeart size={20} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpenCart(true)}
                className="relative p-2 text-gray-700"
                type="button"
                aria-label="Shopping cart"
              >
                <FiShoppingCart size={20} />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium min-w-4">
                    {totalCartItems > 99 ? '99+' : totalCartItems}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between gap-6 h-16">
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/" className="flex items-center">
                <img
                  src="./MultiMart.png"
                  className="w-14 h-auto"
                  alt="MultiMart"
                  loading="lazy"
                />
              </Link>
            </motion.div>

            <SearchComponent />

            <div className="flex-shrink-0">
              <Link
                to={isCurrentlySeller ? `/shop/${seller?._id}` : "/create-shop"}
                className="bg-black text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center space-x-2 hover:bg-gray-800 shadow-md"
              >
                <FiShoppingBag size={16} />
                <span>{isCurrentlySeller ? "My Shop" : "Start Selling"}</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileSearch}
          >
            <motion.div
              className="bg-white p-4 m-4 mt-20 rounded-xl shadow-xl"
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Search Products</h3>
                <motion.button
                  onClick={closeMobileSearch}
                  whileTap={{ scale: 0.9 }}
                  className="p-2"
                  type="button"
                  aria-label="Close search"
                >
                  <FiX size={20} className="text-gray-700" />
                </motion.button>
              </div>
              
              <SearchComponent isMobile={true} onClose={closeMobileSearch} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
          >
            <motion.div
              className="absolute left-0 top-0 h-full w-full max-w-sm bg-white shadow-xl overflow-y-auto"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                  <motion.button
                    onClick={closeMobileMenu}
                    whileTap={{ scale: 0.9 }}
                    className="p-2"
                    type="button"
                    aria-label="Close menu"
                  >
                    <FiX size={24} className="text-gray-700" />
                  </motion.button>
                </div>

                <div className="mb-6">
                  <Link
                    to={isCurrentlySeller ? `/shop/${seller?._id}` : "/create-shop"}
                    className="flex items-center w-full bg-black text-white px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 hover:bg-gray-800 shadow-md"
                    onClick={closeMobileMenu}
                  >
                    <FiShoppingBag size={16} className="mr-3" />
                    <span>{isCurrentlySeller ? "My Shop" : "Start Selling"}</span>
                  </Link>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <select
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    className="w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-xl font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                    defaultValue=""
                  >
                    <option value="">Browse Categories</option>
                    {categoriesData.map((cat, i) => (
                      <option key={i} value={cat.title}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2 mb-6">
                  {navItems.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        to={item.url}
                        className="block py-3 px-4 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 font-medium"
                        onClick={closeMobileMenu}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Auth Section */}
                <div className="border-t border-gray-200 pt-6">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <Link
                        to="/profile"
                        className="flex items-center py-3 px-4 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        onClick={closeMobileMenu}
                      >
                        <Avatar
                          src={currentUser?.avatar?.url ? `http://localhost:5000${currentUser.avatar.url}` : "/default-avatar.png"}
                          className="mr-3"
                          sx={{ width: 24, height: 24 }}
                        />
                        <span className="font-medium">Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          closeMobileMenu();
                        }}
                        className="flex items-center py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 w-full text-left"
                        type="button"
                      >
                        <FaPowerOff className="mr-3" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center py-3 px-4 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      onClick={closeMobileMenu}
                    >
                      <FiUser size={20} className="mr-3" />
                      <span className="font-medium">Login</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebars */}
      <Cart openCart={openCart} setOpenCart={setOpenCart} />
      <WishList openWishList={openWishList} setOpenWishList={setOpenWishList} />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #e5e7eb, #d1d5db);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #d1d5db, #9ca3af);
        }
      `}</style>
    </>
  );
};

export default Header;