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
      <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 h-[470px]">

        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            -{discountPercentage}%
          </div>
        )}

        {product.sold_out > 50 && (
          <div className="absolute bottom-3 left-3 z-10 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <span>🔥</span>
            <span>Best Selling</span>
          </div>
        )}

        <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-700 h-48">
          <Link to={`/product/${productNameSlug}`} state={{ productId: product._id }}>
            <img
              src={getImageUrl(product)}
              alt={product.name}
              className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
              }}
            />
          </Link>
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <button onClick={handleWishlistToggle} className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
            {isInWishlist ? (
              <AiFillHeart className="text-red-500 text-lg" />
            ) : (
              <AiOutlineHeart className="text-gray-600 dark:text-gray-300 text-lg hover:text-red-500 transition-colors" />
            )}
          </button>
          <button onClick={() => setShowDetails(true)} className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
            <FiEye className="text-gray-600 dark:text-gray-300 text-lg hover:text-blue-500 transition-colors" />
          </button>
          <button onClick={addToCartHandler} disabled={product.stock === 0}
            className={`bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 ${
              product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}>
            <BsCartPlus className={`text-lg transition-colors ${
              product.stock === 0 ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300 hover:text-green-500'
            }`} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <Link to={`/products/${productNameSlug}`} state={{ productId: product._id }}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
              {product.name}
            </h3>
          </Link>

          {/* Rating and count */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(averageRating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({averageRating > 0 ? averageRating.toFixed(1) : '0.0'})
            </span>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span>•</span>
              <span className="ml-1">
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span>•</span>
              <span className="ml-1">{product.sold_out || 0} sold</span>
            </div>
          </div>

          {/* Review Summary - Only show if there are reviews */}
          {reviewCount > 0 ? (
            <div className="text-xs text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
              ⭐ {averageRating.toFixed(1)} stars from {reviewCount} {reviewCount === 1 ? 'customer' : 'customers'}
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">
              No reviews yet - Be the first to review!
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${product.discountPrice || product.originalPrice || 0}
                </span>
                {product.originalPrice && product.discountPrice && product.originalPrice !== product.discountPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400">
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

          {/* Add to Cart Button */}
          <button 
            disabled={product.stock === 0}
            className={`w-full font-semibold py-3 mb-10 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 ${
              product.stock === 0
                ? 'bg-gray-400 text-white cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
            }`}
            onClick={addToCartHandler}
          >
            <BsCartPlus className="text-lg" />
            <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>

      {/* Product Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Details</h2>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
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