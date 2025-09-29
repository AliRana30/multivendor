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
  { name: "Best", url: "/best-selling" },
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
  const { wishlist } = useSelector((state) => state.wishlist);

  const totalCartItems = useMemo(() => 
    cart?.reduce((acc, item) => acc + item.quantity, 0) || 0, 
    [cart]
  );

  const totalWishlistItems = useMemo(() => 
    wishlist?.length || 0, 
    [wishlist]
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

  const SearchComponent = ({ isMobile = false, onClose = null }) => (
    <div className={`relative ${isMobile ? 'w-full' : 'flex-1 max-w-1xl'}`}>
      <motion.div className="relative">
        <div className={`relative ${
          isMobile 
            ? 'bg-gray-50 rounded-xl border border-gray-200' 
            : `bg-white rounded-xl transition-all duration-300 ${
                isSearchFocused
                  ? "shadow-lg ring-2 ring-gray-200 bg-white border border-gray-200"
                  : "shadow-sm hover:shadow-md border border-gray-100"
              }`
        }`}>
          
          <motion.div
            className="absolute left-4 top-1/2 transform -translate-y-1/2"
            animate={{ color: isSearchFocused ? "#374151" : "#9ca3af" }}
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
            placeholder="Search for products, brands or categories"
            className={`relative w-full py-3.5 pl-12 pr-12 rounded-xl text-sm border-0 focus:outline-none bg-transparent text-gray-800 placeholder-gray-500 font-light tracking-wide`}
          />
          
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ scale: 0, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, rotate: 90 }}
                whileHover={{ scale: 1.1, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  clearSearch();
                  onClose?.();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-all duration-200 p-1.5 rounded-full"
                type="button"
              >
                <FiX size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {searchData.length > 0 && (
          <motion.div
            variants={searchResultVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute top-full left-0 right-0 mt-3 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 ${
              isMobile ? 'max-h-48' : 'max-h-80'
            }`}
          >
            
            <div className="overflow-y-auto custom-scrollbar h-full">
              <div className="p-2">
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
                        className="flex items-center p-3 hover:bg-gray-50 transition-all duration-300 rounded-lg m-1 group border border-transparent hover:border-gray-100"
                        onClick={() => {
                          clearSearch();
                          onClose?.();
                        }}
                      >
                        <div className={`relative ${
                          isMobile ? 'w-12 h-12' : 'w-14 h-14'
                        } bg-gray-50 rounded-lg mr-4 flex-shrink-0 overflow-hidden border border-gray-100`}>
                          <img
                            src={getProductImageUrl(item)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-gray-900 truncate text-sm group-hover:text-gray-700 transition-colors duration-200 tracking-wide`}>
                            {item.name}
                          </h4>
                          <span className="text-xs text-gray-500 font-light tracking-wide">
                            {item.category || 'General'}
                          </span>
                          
                          {isReduxProduct && (
                            <div className="flex items-center mt-1.5">
                              <span className={`text-xs px-2.5 py-1 rounded-full font-light tracking-wide transition-all duration-200 ${
                                item.stock > 10 
                                  ? 'bg-green-50 text-green-700 border border-green-100' 
                                  : item.stock > 0 
                                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                    : 'bg-red-50 text-red-700 border border-red-100'
                              }`}>
                                {item.stock > 10 ? 'In Stock' : item.stock > 0 ? `${item.stock} left` : 'Out of Stock'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end flex-shrink-0 ml-3">
                          <div className="text-gray-900 font-medium text-sm tracking-wide">
                            ${item.discountPrice || item.originalPrice || item.price || 0}
                          </div>
                          {item.originalPrice && item.discountPrice && item.originalPrice !== item.discountPrice && (
                            <>
                              <div className="text-xs text-gray-400 line-through font-light tracking-wide">
                                ${item.originalPrice}
                              </div>
                              <div className="text-xs text-green-600 font-light tracking-wide">
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
                <div className="px-4 py-3 bg-gray-50 text-center border-t border-gray-100">
                  <p className="text-xs text-gray-600 font-light tracking-wide">
                    Showing {searchData.length} results • <span className="text-gray-900 font-medium">Refine your search for more</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchTerm.length > 0 && searchData.length === 0 && !isSearchFocused && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl shadow-xl border border-gray-100 p-6 z-50"
          >
            <div className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                <FiSearch className="text-gray-400" size={20} />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2 tracking-wide">No products found</h3>
              <p className="text-xs text-gray-600 mb-1 font-light">We couldn't find anything matching <span className="font-medium text-gray-900">"{searchTerm}"</span></p>
              <p className="text-xs text-gray-500 font-light">Try a different search term</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <motion.header 
        className={`sticky top-0 z-40 transition-all duration-300 ease-out ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100' 
            : 'bg-white'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        
        <div className="relative max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 border-b border-gray-200">          
          {/* Mobile Header */}
          <div className="flex lg:hidden items-center justify-between h-14">
            <motion.button
              onClick={() => setMobileMenuOpen(true)}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              type="button"
              aria-label="Open menu"
            >
              <FiMenu size={20} />
            </motion.button>

            <Link to="/" className="flex items-center">
              <img
                src="./MultiMart.png"
                className="w-10 h-auto"
                alt="MultiMart"
                loading="lazy"
              />
            </Link>

            <div className="flex items-center space-x-1">
              <motion.button
                onClick={() => setMobileSearchOpen(true)}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                type="button"
                aria-label="Search"
              >
                <FiSearch size={18} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpenWishList(true)}
                className="relative p-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                type="button"
                aria-label="Wishlist"
              >
                <FiHeart size={18} />
                {totalWishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium min-w-4">
                    {totalWishlistItems > 99 ? '99+' : totalWishlistItems}
                  </span>
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpenCart(true)}
                className="relative p-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                type="button"
                aria-label="Shopping cart"
              >
                <FiShoppingCart size={18} />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium min-w-4">
                    {totalCartItems > 99 ? '99+' : totalCartItems}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between gap-8 h-18">
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/" className="flex items-center">
                <img
                  src="./MultiMart.png"
                  className="w-12 h-auto"
                  alt="MultiMart"
                  loading="lazy"
                />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="flex-1 max-w-md">
              <div className="flex items-center justify-center space-x-8">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.url}
                    className="text-gray-700 hover:text-gray-900 font-light text-sm tracking-wide transition-colors duration-200 relative group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                ))}
              </div>
            </nav>

            {/* Search Component */}
            <SearchComponent />

            {/* Desktop Actions */}
            <div className="flex items-center space-x-6 flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpenWishList(true)}
                className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                type="button"
                aria-label="Wishlist"
              >
                <FiHeart size={20} />
                {totalWishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium min-w-4">
                    {totalWishlistItems > 99 ? '99+' : totalWishlistItems}
                  </span>
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpenCart(true)}
                className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                type="button"
                aria-label="Shopping cart"
              >
                <FiShoppingCart size={20} />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium min-w-4">
                    {totalCartItems > 99 ? '99+' : totalCartItems}
                  </span>
                )}
              </motion.button>

              <Link
                to={isCurrentlySeller ? `/shop/${seller?._id}` : "/create-shop"}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 flex items-center space-x-2 hover:bg-gray-800 shadow-sm tracking-wide"
              >
                <FiShoppingBag size={16} />
                <span>{isCurrentlySeller ? "My Shop" : "Start Selling"}</span>
              </Link>

              {/* User Avatar/Login */}
              {isAuthenticated ? (
                <Link to="/profile" className="flex-shrink-0">
                  <Avatar
                    src={currentUser?.avatar?.url ? `http://localhost:5000${currentUser.avatar.url}` : "/default-avatar.png"}
                    sx={{ width: 32, height: 32 }}
                    className="border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                  />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 font-light text-sm tracking-wide transition-colors duration-200"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileSearch}
          >
            <motion.div
              className="bg-white p-6 m-4 mt-20 rounded-xl shadow-xl border border-gray-100"
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 tracking-wide">Search Products</h3>
                  <p className="text-sm text-gray-500 font-light mt-1">Find what you're looking for</p>
                </div>
                <motion.button
                  onClick={closeMobileSearch}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
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
            className="lg:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
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
                  <div>
                    <h2 className="text-xl font-medium text-gray-900 tracking-wide">Menu</h2>
                  </div>
                  <motion.button
                    onClick={closeMobileMenu}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    type="button"
                    aria-label="Close menu"
                  >
                    <FiX size={22} className="text-gray-700" />
                  </motion.button>
                </div>

                <div className="mb-8">
                  <Link
                    to={isCurrentlySeller ? `/shop/${seller?._id}` : "/create-shop"}
                    className="flex items-center w-full bg-gray-900 text-white px-5 py-3.5 rounded-lg font-medium text-sm transition-all duration-300 hover:bg-gray-800 shadow-sm tracking-wide"
                    onClick={closeMobileMenu}
                  >
                    <FiShoppingBag size={16} className="mr-3" />
                    <span>{isCurrentlySeller ? "My Shop" : "Start Selling"}</span>
                  </Link>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2 tracking-wide">Browse Categories</label>
                  <select
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    className="w-full bg-gray-50 text-gray-800 px-4 py-3.5 rounded-lg font-light cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm border border-gray-200 tracking-wide"
                    defaultValue=""
                  >
                    <option value="">Select a category</option>
                    {categoriesData.map((cat, i) => (
                      <option key={i} value={cat.title}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 mb-8">
                  {navItems.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        to={item.url}
                        className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-light tracking-wide"
                        onClick={closeMobileMenu}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-6">
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