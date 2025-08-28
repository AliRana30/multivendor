import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../../redux/actions/product";
import { addToCart } from "../../redux/actions/cart";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FiEye, FiStar } from "react-icons/fi";
import { BsCartPlus } from "react-icons/bs";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import styles from "../../styles/styles";
import ProductDetailsCard from "../Cards/ProductDetailsCard";
import { useNavigate } from "react-router-dom";
import Loader from '../components/Loader';
import { toast } from "react-hot-toast";

const BestDeals = () => {
  const dispatch = useDispatch();
  const { seller } = useSelector((state) => state.seller);
  const navigate = useNavigate();
  const { loading, products } = useSelector((state) => state.product);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.user);
  const [showDetails, setShowDetails] = useState(null);

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllProducts(seller._id));
    }
  }, [dispatch, seller]);

  const bestDeals = products?.slice(0, 6) || [];

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlist && wishlist.some(item => item._id === productId);
  };

  // Handle wishlist toggle
  const toggleFavorite = (e, product) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    if (isInWishlist(product._id)) {
      dispatch(removeFromWishlist(product._id));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishlist({...product}));
      toast.success("Added to wishlist");
    }
  };

  const handleShowDetails = (e, product) => {
    e.stopPropagation();
    setShowDetails(product);
  };

  // Handle add to cart
  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }

    const isItemExists = cart && cart.find(item => item._id === product._id);
    if (isItemExists) {
      toast.error("Product already in cart");
      return;
    }

    if (product.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    const cartData = { ...product, quantity: 1 };
    dispatch(addToCart(cartData));
    toast.success("Item added to cart successfully!");
  };

  const handleProductClick = (product) => {
    const productSlug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    navigate(`/products/${productSlug}`, { state: { productId: product._id } });
  };

  // Fixed image URL function
  const getImageUrl = (product) => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      
      if (typeof firstImage === 'string' && (firstImage.startsWith('http://') || firstImage.startsWith('https://'))) {
        return firstImage;
      }
      
      if (typeof firstImage === 'object' && firstImage.url) {
        return firstImage.url.startsWith('http') ? firstImage.url : `http://localhost:5000${firstImage.url}`;
      }
      
      if (typeof firstImage === 'string') {
        if (firstImage.startsWith('/')) {
          return `http://localhost:5000${firstImage}`;
        }
        return `http://localhost:5000/uploads/${firstImage}`;
      }
    }
    
    return '/placeholder-image.png';
  };

  const getDiscountPercentage = (product) => {
    if (!product.originalPrice || !product.discountPrice) return 0;
    return Math.floor(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={`${styles.section} relative bg-gray-50 py-16`}>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Best Selling</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our handpicked selection of amazing products at unbeatable prices
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {bestDeals.map((product) => {
          const discountPercentage = getDiscountPercentage(product);
          const inWishlist = isInWishlist(product._id);

          return (
            <div
              key={product._id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 h-[480px] cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              {/* Discount Badge */}
              {discountPercentage > 0 && (
                <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  -{discountPercentage}% OFF
                </div>
              )}

              {/* Best Seller Badge */}
              {product.sold_out > 75 && (
                <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <span>🔥</span>
                  <span>Bestseller</span>
                </div>
              )}

              {/* Product Image */}
              <div className="relative overflow-hidden bg-gray-50 h-48">
                <img
                  src={getImageUrl(product)}
                  alt={product.name || 'Product image'}
                  className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    console.error('Image failed to load:', getImageUrl(product));
                    e.target.src = '/placeholder-image.png';
                  }}
                
                />

                {/* Hover Icons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <button
                    onClick={(e) => toggleFavorite(e, product)}
                    className="bg-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {inWishlist ? (
                      <AiFillHeart className="text-red-500 text-lg" />
                    ) : (
                      <AiOutlineHeart className="text-gray-600 text-lg hover:text-red-500 transition-colors" />
                    )}
                  </button>

                  <button
                    onClick={(e) => handleShowDetails(e, product)}
                    className="bg-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    title="Quick view"
                  >
                    <FiEye className="text-gray-600 text-lg hover:text-blue-500 transition-colors" />
                  </button>

                  <button 
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={product.stock === 0}
                    className={`bg-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 ${
                      product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title={product.stock === 0 ? "Out of stock" : "Add to cart"}
                  >
                    <BsCartPlus className={`text-lg transition-colors ${
                      product.stock === 0 
                        ? 'text-gray-400' 
                        : 'text-gray-600 hover:text-green-500'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Product Content */}
              <div className="p-4 space-y-3 flex flex-col justify-between h-[232px]">
                <div>
                  {/* Product Name */}
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors duration-200 mb-2">
                    {product.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {product.description}
                  </p>

                  {/* Rating and Sales */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating || 0)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({product.rating || 0})
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {product.sold_out || 0} sold
                    </span>
                  </div>

                  {/* Price Section */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-bold text-gray-900">
                        ${product.discountPrice || product.originalPrice || 0}
                      </span>
                      {product.originalPrice && product.discountPrice && product.originalPrice !== product.discountPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    
                    {discountPercentage > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        Save ${(product.originalPrice - product.discountPrice).toFixed(2)}
                      </div>
                    )}

                    <div className="flex items-center text-xs text-green-600 mt-1">
                      <HiOutlineBadgeCheck className="w-3 h-3 mr-1" />
                      <span>Free shipping</span>
                    </div>
                  </div>

                  {/* Stock Status */}
                  {product.stock !== undefined && (
                    <div className="text-xs mb-2">
                      {product.stock > 10 ? (
                        <span className="text-green-600">✓ In Stock</span>
                      ) : product.stock > 0 ? (
                        <span className="text-orange-600">⚠ Only {product.stock} left</span>
                      ) : (
                        <span className="text-red-600">✗ Out of Stock</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button 
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={product.stock === 0}
                    className={`w-full font-semibold py-2.5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 ${
                      product.stock === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed opacity-60'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    }`}
                  >
                    <BsCartPlus className="text-lg" />
                    <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Products Message */}
      {(!bestDeals || bestDeals.length === 0) && (
        <div className="text-center text-gray-500 py-20">
          <div className="text-6xl mb-4">🛍️</div>
          <p className="text-lg mb-2">No deals available at the moment</p>
          <p className="text-sm">Check back later for amazing offers!</p>
        </div>
      )}

      {/* Product Details Modal */}
      {showDetails && (
        <div 
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 z-50 flex justify-center items-start overflow-auto pt-10"
          onClick={() => setShowDetails(null)}
        >
          <div 
            className="relative bg-white w-full md:w-4/5 lg:w-3/4 xl:w-2/3 max-w-6xl rounded-lg shadow-xl p-6 m-4 max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDetails(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-3xl z-10 font-bold leading-none bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
            >
              ×
            </button>
            <ProductDetailsCard product={showDetails} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BestDeals;