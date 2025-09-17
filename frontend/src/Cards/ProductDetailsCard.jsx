import React, { useState } from "react";
import { BsCartPlus } from "react-icons/bs";
import { FiStar, FiTruck, FiShield, FiRefreshCw } from "react-icons/fi";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { addToCart } from "../../redux/actions/cart";
import { toast } from "react-hot-toast";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";
import api from "../components/axiosCongif";

const ProductDetailsCard = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  
  const { seller } = useSelector((state) => state.seller);
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();

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

    const cartData = { ...product, quantity: quantity };
    dispatch(addToCart(cartData));
    toast.success("Item added to cart successfully!");
  };

  const handleQuantityIncrease = () => {
    if (quantity < (product.stock || 999)) {
      setQuantity(quantity + 1);
    } else {
      toast.error("Cannot exceed available stock");
    }
  };

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
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
      dispatch(addToWishlist({...product}));
      toast.success("Added to wishlist");
    }
  };

  const handleMessage = async () => {
    try {
      if (!product?._id) {
        toast.error("Missing Product info");
        return;
      }
      if (!user?._id) {
        toast.error("Login first to send message");
        return;
      }

      const loadingToast = toast.loading("Creating conversation...");

      const response = await api.post('/create-new-conversation', {
        groupTitle: `${product?._id}_${user?._id}_${product?.shop?._id}`, 
        userId: user?._id,
        sellerId: product?.shopId,
      });
      toast.dismiss(loadingToast);

      if (response?.data?.success) {
        const conversationId = response.data.conversationId;
        navigate(`/conversation/${conversationId}`);
        
        if (response.data.message === "Conversation already exists") {
          toast.success("Opening existing conversation");
        } else {
          toast.success("Conversation created successfully");
        }
      } else {
        toast.error(response?.data?.message || "Failed to create conversation");
      }
      
    } catch (error) {
      console.error("Error creating conversation:", error);
      
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Invalid request");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("Network error. Please check your connection.");
      }
    }
  };

  if (!product) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">No Product Found</h2>
          <p className="text-gray-600">The product you're looking for is not available.</p>
        </div>
      </div>
    );
  }

  const getImageUrl = (imageObj) => {
    if (!imageObj) return '/placeholder-image.png';
    
    if (imageObj && typeof imageObj === 'object' && imageObj.url) {
      return imageObj.url;
    }
    
    if (typeof imageObj === 'string') {
      if (imageObj.startsWith('http://') || imageObj.startsWith('https://')) {
        return imageObj;
      }
      if (imageObj.startsWith('/')) {
        return `http://localhost:5000${imageObj}`;
      }
      return `http://localhost:5000/uploads/${imageObj}`;
    }
    
    return '/placeholder-image.png';
  };

  const getDiscountPercentage = () => {
    if (!product.originalPrice || !product.discountPrice) return 0;
    return Math.floor(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100);
  };

  const getReviewCount = () => {
    if (!product.reviews) return 0;
    if (Array.isArray(product.reviews)) return product.reviews.length;
    return product.numOfReviews || 0;
  };

  const getRating = () => {
    if (Array.isArray(product.reviews) && product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      return totalRating / product.reviews.length;
    }
    return product.rating || 0;
  };

  const getSellerName = () => {
    if (product.shop) {
      if (typeof product.shop === 'object') {
        return product.shop.name || "Unknown Seller";
      }
      if (typeof product.shop === 'string') {
        return product.shop;
      }
    }
    return seller?.name || seller?.shopname || "Unknown Seller";
  };

  const getSellerAvatar = () => {
  if (product.shopLogo) {
    return `http://localhost:5000/${product.shopLogo}`;
  }
  return null;
};



  const getSellerId = () => {
    if (product.shop && typeof product.shop === 'object') {
      return product.shop._id;
    }
    return seller?._id;
  };

  const discountPercentage = getDiscountPercentage();
  const images = product.images && Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [null];

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
      <div className="flex-shrink-0 w-full lg:w-1/2">
        <div className="space-y-4">
          <div className="relative bg-gray-50 rounded-2xl overflow-hidden">
            <img
              src={getImageUrl(images[selectedImage])}
              alt={product.name}
              className="w-full h-80 lg:h-96 object-contain p-6"
            />
            
            {discountPercentage > 0 && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                -{discountPercentage}% OFF
              </div>
            )}

            {product.sold_out > 75 && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <span>🔥</span>
                <span>Bestseller</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-blue-500 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-contain bg-gray-50"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-black mt-10 flex flex-col">
          <h1 className="font-semibold text-xl mb-4">Seller Details:</h1>
          
          <div className="mb-2">
            Seller Name: {getSellerName()}
          </div>

          <div>
            {getSellerId() && (
              <Link to={`/shop/${getSellerId()}`}>
                {getSellerAvatar() && (
                  <img
                    src={getSellerAvatar()}
                    alt="Shop Avatar"
                    className="rounded-xl w-24 h-24 object-cover mb-4 hover:opacity-80 transition-opacity"
                  />
                )}
              </Link>
            )}
            <button
              className="text-white bg-black p-4 rounded-xl"
              onClick={handleMessage}
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
 
      <div className="flex-grow space-y-6">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 pr-4">
              {product.name}
            </h1>
            <div className="flex gap-2 flex-shrink-0">
              <button 
                className="p-2 rounded-full text-black bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={handleWishlistToggle}
              >
                {isInWishlist ? (
                  <AiFillHeart className="w-5 h-5 text-red-500" />
                ) : (
                  <AiOutlineHeart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            {product.category && (
              <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                {product.category}
              </span>
            )}
            {product.brand && (
              <span className="text-sm text-gray-500">
                Brand: <span className="font-medium text-gray-700">{product.brand}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(getRating())
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="font-medium text-gray-900">
              {getRating().toFixed(1)}
            </span>
            <span className="text-gray-500">
              ({getReviewCount()} {getReviewCount() === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium text-green-600">{product.sold_out || 0}</span> sold
          </div>
        </div>

        {getReviewCount() > 0 && (
          <div className="bg-yellow-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Customer Reviews</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-yellow-600">{getRating().toFixed(1)}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(getRating())
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  Based on {getReviewCount()} {getReviewCount() === 1 ? 'review' : 'reviews'}
                </span>
              </div>
              
              {Array.isArray(product.reviews) && product.reviews.length > 0 && (
                <div className="space-y-1 mt-3">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = product.reviews.filter(review => review.rating === rating).length;
                    const percentage = getReviewCount() > 0 ? (count / getReviewCount()) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center gap-2 text-xs">
                        <span className="w-8">{rating}★</span>
                        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-gray-600">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {Array.isArray(product.reviews) && product.reviews.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Reviews</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {product.reviews.slice(0, 3).map((review, index) => (
                <div key={review._id || index} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {review.rating}/5
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-700 line-clamp-2">
                      <div className="font-bold">
                        {review.user?.name || user?.name || "Anonymous"}
                      </div>
                      Comment: {review.comment}
                    </p>
                  )}
                </div>
              ))}
              {product.reviews.length > 3 && (
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View all {getReviewCount()} reviews
                </button>
              )}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed">
            {product.description || "No description available for this product."}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-3xl font-bold text-gray-900">
              ${product.discountPrice || product.originalPrice || 0}
            </span>
            {product.originalPrice && product.discountPrice && product.originalPrice !== product.discountPrice && (
              <div className="flex items-center gap-2">
                <span className="text-lg line-through text-gray-500">
                  ${product.originalPrice}
                </span>
                <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Save ${(product.originalPrice - product.discountPrice).toFixed(2)}
                </span>
              </div>
            )}
          </div>
          
        
        </div>

        <div className="space-y-4">
          {product.stock !== undefined && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Stock: <span className={`font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </span>
              </span>
              {product.stock < 10 && product.stock > 0 && (
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                  Limited stock!
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            <span className="text-sm text-black font-medium">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-lg text-black">
              <button 
                onClick={handleQuantityDecrease}
                disabled={quantity <= 1}
                className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="px-4 py-2 border-x border-gray-300 min-w-[50px] text-center text-black">
                {quantity}
              </span>
              <button 
                onClick={handleQuantityIncrease}
                disabled={quantity >= (product.stock || 999)}
                className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            <span className="text-xs text-gray-500">
              Max: {product.stock || 999}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={addToCartHandler}
            disabled={product.stock === 0}
            className={`flex-1 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-3 ${
              product.stock === 0
                ? 'bg-gray-400 text-white cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
            }`}
          >
            <BsCartPlus className="text-lg" />
            <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>

        {product.shop && typeof product.shop === "object" && (
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  Sold by {product.shop.name || "Unknown Shop"}
                </div>
                <div className="text-sm text-gray-600">
                  Verified seller
                </div>
              </div>
              <div className="flex items-center gap-1">
                <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">4.8</span>
              </div>
            </div>
          </div>
        )}

        {product.specifications && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {product._id && (
              <div>
                <span className="text-gray-600">Product ID:</span>
                <span className="ml-2 font-mono text-xs text-gray-500">{product._id.slice(-8)}</span>
              </div>
            )}
            {product.createdAt && (
              <div>
                <span className="text-gray-600">Added:</span>
                <span className="ml-2 text-gray-900">{new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
            )}
            {product.tags && product.tags.length > 0 && (
              <div className="col-span-2 text-black">
                <span className="block mb-2 font-bold">Tags</span>
                <div className="flex flex-wrap gap-1">
                  {typeof product.tags === 'string' ? (
                    <span className="bg-gray-200 px-2 py-1 rounded-full text-xs">
                      {product.tags}
                    </span>
                  ) : (
                    product.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-200 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsCard;