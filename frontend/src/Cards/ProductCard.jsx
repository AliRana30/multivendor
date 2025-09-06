import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FiEye, FiStar } from "react-icons/fi";
import { BsCartPlus } from "react-icons/bs";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import ProductDetailsCard from "./ProductDetailsCard";
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../redux/actions/cart';
import { toast } from 'react-hot-toast';
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";

const ProductCard = ({ product }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  if (!product) return null;

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

  const createProductSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') 
      .trim();
  };

  const getAverageRating = () => {
    if (!product.reviews || !Array.isArray(product.reviews) || product.reviews.length === 0) return 0;
    const total = product.reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return total / product.reviews.length;
  };

  const getReviewCount = () => {
    if (!product.reviews || !Array.isArray(product.reviews)) return 0;
    return product.reviews.length;
  };

  const averageRating = getAverageRating();
  const reviewCount = getReviewCount();
  const productNameSlug = createProductSlug(product.name);
  const discountPercentage = product.originalPrice && product.discountPrice
    ? Math.floor(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
    : 0;

  const isInWishlist = wishlist && wishlist.some(item => item._id === product._id);

  const addToCartHandler = () => {
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

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishlist({ ...product }));
      toast.success("Added to wishlist");
    }
  };

  return (
    <>
      <div className="group relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full min-h-[500px] sm:min-h-[520px]">

        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            -{discountPercentage}%
          </div>
        )}

        {product.sold_out > 50 && (
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-10 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
            <span>🔥</span>
            <span className="hidden sm:inline">Best Selling</span>
            <span className="sm:hidden">Hot</span>
          </div>
        )}

        {/* Image Container */}
        <div className="relative overflow-hidden bg-gray-50 h-40 sm:h-48 flex-shrink-0">
          <Link to={`/products/${productNameSlug}`} state={{ productId: product._id }}>
            <img
              src={getImageUrl(product)}
              alt={product.name}
              className="w-full h-full object-contain p-3 sm:p-4 group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
              }}
            />
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={handleWishlistToggle} className="bg-white p-1.5 sm:p-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
            {isInWishlist ? (
              <AiFillHeart className="text-red-500 text-base sm:text-lg" />
            ) : (
              <AiOutlineHeart className="text-gray-600 text-base sm:text-lg hover:text-red-500 transition-colors" />
            )}
          </button>
          <button onClick={() => setShowDetails(true)} className="bg-white p-1.5 sm:p-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
            <FiEye className="text-gray-600 text-base sm:text-lg hover:text-blue-500 transition-colors" />
          </button>
          <button onClick={addToCartHandler} disabled={product.stock === 0}
            className={`bg-white p-1.5 sm:p-2 rounded-full shadow-md hover:shadow-lg transition-shadow ${
              product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}>
            <BsCartPlus className={`text-base sm:text-lg transition-colors ${
              product.stock === 0 ? 'text-gray-400' : 'text-gray-600 hover:text-green-500'
            }`} />
          </button>
        </div>

        {/* Content Container - Flexible */}
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-grow flex flex-col">
          
          {/* Product Name */}
          <Link to={`/products/${productNameSlug}`} state={{ productId: product._id }}>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors duration-200 leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Rating and count */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                      i < Math.round(averageRating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                ({averageRating > 0 ? averageRating.toFixed(1) : '0.0'})
              </span>
            </div>
            
            <div className="flex items-center text-gray-500 gap-2 sm:gap-1">
              <span className="hidden sm:inline">•</span>
              <span>
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </span>
              <span>•</span>
              <span>{product.sold_out || 0} sold</span>
            </div>
          </div>

          {/* Review Summary */}
          <div className="text-xs">
            {reviewCount > 0 ? (
              <div className="text-gray-600 bg-yellow-50 px-2 py-1 rounded">
                ⭐ {averageRating.toFixed(1)} stars from {reviewCount} {reviewCount === 1 ? 'customer' : 'customers'}
              </div>
            ) : (
              <div className="text-gray-500 bg-gray-50 px-2 py-1 rounded">
                No reviews yet - Be the first to review!
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg sm:text-2xl font-bold text-gray-900">
                  ${product.discountPrice || product.originalPrice || 0}
                </span>
                {product.originalPrice && product.discountPrice && product.originalPrice !== product.discountPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <div className="flex items-center text-xs text-green-600">
                <HiOutlineBadgeCheck className="w-3 h-3 mr-1" />
                <span>Free shipping</span>
              </div>
            </div>
          </div>

          {/* Stock Info */}
          {product.stock !== undefined && (
            <div className="text-xs">
              {product.stock > 10 ? (
                <span className="text-green-600">✓ In Stock ({product.stock} available)</span>
              ) : product.stock > 0 ? (
                <span className="text-orange-600">⚠ Only {product.stock} left</span>
              ) : (
                <span className="text-red-600">✗ Out of Stock</span>
              )}
            </div>
          )}

          {/* Add to Cart Button - Always at bottom */}
          <div className="mt-auto pt-2">
            <button 
              disabled={product.stock === 0}
              className={`w-full font-medium py-2 sm:py-2.5 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                product.stock === 0
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              onClick={addToCartHandler}
            >
              <BsCartPlus className="text-base sm:text-lg" />
              <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <ProductDetailsCard product={product} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;