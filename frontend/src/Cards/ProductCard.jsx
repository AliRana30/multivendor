import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FiEye, FiStar } from "react-icons/fi";
import { BsCartPlus } from "react-icons/bs";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../redux/actions/cart';
import { toast } from 'react-hot-toast';
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";
import ProductDetailsCard from "./ProductDetailsCard";

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
        return firstImage.url.startsWith('http') ? firstImage.url : `https://multivendors-7cy2.onrender.com${firstImage.url}`;
      }

      if (typeof firstImage === 'string') {
        if (firstImage.startsWith('/')) {
          return `https://multivendors-7cy2.onrender.com${firstImage}`;
        }
        return `https://multivendors-7cy2.onrender.com/uploads/${firstImage}`;
      }
    }

    return '/placeholder-image.png';
  };

  const createProductSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')      
      .replace(/[^a-z0-9-]/g, '') 
      .trim();
  };

  const getAverageRating = () => {
    if (!product.reviews || !Array.isArray(product.reviews) || product.reviews.length === 0) return 0;
    const total = product.reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return total / product.reviews.length;
  };

  const averageRating = getAverageRating();
  const reviewCount = product.reviews ? product.reviews.length : 0;
  const productSlug = createProductSlug(product.name);
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
      
      <div className="group relative bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full min-h-[450px]">

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 mono">
            -{discountPercentage}%
          </div>
        )}

        {/* Product Image */}
        <div className="relative overflow-hidden bg-gray-50 h-56 flex-shrink-0">
          <Link to={`/products/${productSlug}`} state={{ productId: product._id }}>
            <img
              src={getImageUrl(product)}
              alt={product.name}
              className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
              }}
            />
          </Link>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={handleWishlistToggle} 
              className="bg-white/95 backdrop-blur-sm p-2.5 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100"
            >
              {isInWishlist ? (
                <AiFillHeart className="text-red-500 text-lg" />
              ) : (
                <AiOutlineHeart className="text-gray-600 text-lg hover:text-red-500 transition-colors" />
              )}
            </button>
            <button 
              onClick={() => setShowDetails(true)} 
              className="bg-white/95 backdrop-blur-sm p-2.5 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100"
            >
              <FiEye className="text-gray-600 text-lg hover:text-blue-500 transition-colors" />
            </button>
            <button 
              onClick={addToCartHandler} 
              disabled={product.stock === 0}
              className={`bg-white/95 backdrop-blur-sm p-2.5 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 ${
                product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <BsCartPlus className={`text-lg transition-colors ${
                product.stock === 0 ? 'text-gray-400' : 'text-gray-600 hover:text-green-500'
              }`} />
            </button>
          </div>
        </div>

        {/* Product Information */}
        <div className="p-6 space-y-4 flex-grow flex flex-col">
          {/* Product Name */}
          <Link to={`/products/${productSlug}`} state={{ productId: product._id }}>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors duration-200 leading-relaxed">
              {product.name}
            </h3>
          </Link>

          {/* Ratings & Reviews */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
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
              <span className="text-sm font-medium text-gray-700">
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>{product.sold_out || 0} sold</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3 flex-grow">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-gray-900">
                ${product.discountPrice || product.originalPrice || 0}
              </span>
              {product.originalPrice && product.discountPrice && product.originalPrice !== product.discountPrice && (
                <span className="text-lg text-gray-500 line-through font-medium">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            
            <div className="flex items-center text-sm text-green-600 font-medium">
              <HiOutlineBadgeCheck className="w-4 h-4 mr-2" />
              <span>Free shipping</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="pt-4 border-t border-gray-100">
            <button 
              onClick={addToCartHandler}
              disabled={product.stock === 0}
              className={`w-full font-semibold py-2 px-2 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-3 ${
                product.stock === 0
                  ? 'bg-gray-400 text-white cursor-not-allowed opacity-60'
                  : 'bg-black text-white hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <BsCartPlus className="text-lg" />
              <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-light w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
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
