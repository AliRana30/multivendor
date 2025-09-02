import React, { useEffect, useState, useCallback, useMemo } from "react";
import { BsCartPlus } from "react-icons/bs";
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../redux/actions/cart';
import { toast } from 'react-hot-toast';
import api from '../components/axiosCongif'; 

const EventCard = ({ event, onEventUpdate }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState(event?.stock || 0);
  const [currentSoldOut, setCurrentSoldOut] = useState(event?.sold_out || 0);
  
  const { cart } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const discountPercentage = useMemo(() => {
    if (!event?.originalPrice || !event?.discountPrice) return 0;
    return Math.floor(((event.originalPrice - event.discountPrice) / event.originalPrice) * 100);
  }, [event?.originalPrice, event?.discountPrice]);

  const isEventActive = useMemo(() => {
    if (!event) return false;
    const now = new Date();
    const startDate = new Date(event.start_Date);
    const endDate = new Date(event.Finish_Date);
    return now >= startDate && now <= endDate;
  }, [event?.start_Date, event?.Finish_Date]);

  const isItemInCart = useMemo(() => {
    return cart?.some(item => item._id === event?._id) || false;
  }, [cart, event?._id]);

  const soldPercentage = useMemo(() => {
    const totalItems = currentStock + currentSoldOut;
    return totalItems > 0 ? Math.min((currentSoldOut / totalItems) * 100, 100) : 0;
  }, [currentStock, currentSoldOut]);

  const getImageUrl = useCallback((event) => {
    if (!event) return '/placeholder-image.png';

    if (event.images && event.images.length > 0) {
      const firstImage = event.images[0];

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

    if (event.image) {
      if (typeof event.image === 'string') {
        if (event.image.startsWith('http://') || event.image.startsWith('https://')) {
          return event.image;
        }
        if (event.image.startsWith('/')) {
          return `http://localhost:5000${event.image}`;
        }
        return `http://localhost:5000/uploads/${event.image}`;
      }
      
      if (typeof event.image === 'object' && event.image.url) {
        return event.image.url.startsWith('http') ? event.image.url : `http://localhost:5000${event.image.url}`;
      }
    }

    return '/placeholder-image.png';
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!event) return;

    const updateCountdown = () => {
      const now = new Date();
      const endTime = new Date(event.Finish_Date);
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [event]);

  useEffect(() => {
    if (event) {
      setCurrentStock(event.stock);
      setCurrentSoldOut(event.sold_out);
    }
  }, [event?.stock, event?.sold_out]);

  // Update event stock and sold count in backend
  const updateEventStock = async (eventId, newStock, newSoldOut) => {
    try {
      const response = await api.put(`/event-update-stock/${eventId}`, {
        stock: newStock,
        sold_out: newSoldOut
      });
      
      if (response.data.success) {
        setCurrentStock(newStock);
        setCurrentSoldOut(newSoldOut);
        
        if (onEventUpdate) {
          onEventUpdate({
            ...event,
            stock: newStock,
            sold_out: newSoldOut
          });
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update event stock:', error);
      toast.error('Failed to update stock. Please try again.');
      return false;
    }
  };

  // Add to cart handler 
  const addToCartHandler = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }

    if (isItemInCart) {
      toast.error("Product already in cart");
      return;
    }

    if (currentStock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    if (timeLeft === "Expired" || !isEventActive) {
      toast.error("Event is not active");
      return;
    }

    setIsLoading(true);
    
    try {
      // Calculate new stock values
      const newStock = currentStock - 1;
      const newSoldOut = currentSoldOut + 1;
      
      // Update stock 
      const stockUpdated = await updateEventStock(event._id, newStock, newSoldOut);
      
      if (stockUpdated) {
        // Add to cart with updated stock info
        const cartData = {
          ...event,
          stock: newStock,
          sold_out: newSoldOut,
          quantity: 1
        };
        
        dispatch(addToCart(cartData));
        toast.success("Item added to cart successfully!");
      } else {
        toast.error("Failed to add item to cart. Please try again.");
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [
    isAuthenticated,
    isItemInCart,
    currentStock,
    currentSoldOut,
    timeLeft,
    isEventActive,
    event,
    dispatch,
    updateEventStock
  ]);

  if (!event) return null;

  const isOutOfStock = currentStock <= 0;
  const isExpired = timeLeft === "Expired";
  const canAddToCart = isAuthenticated && !isItemInCart && !isOutOfStock && !isExpired && isEventActive;

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 w-full max-w-sm mx-auto">
      
      {/* Image Section */}
      <div className="relative overflow-hidden bg-gray-50 h-48 sm:h-56 md:h-64">
        <img
          src={getImageUrl(event)}
          alt={event.name}
          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/placeholder-image.png';
          }}
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full shadow-lg z-10">
            -{discountPercentage}% OFF
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold z-10 ${
          isEventActive 
            ? 'bg-green-500 text-white' 
            : isExpired 
              ? 'bg-red-500 text-white' 
              : 'bg-yellow-500 text-white'
        }`}>
          {isExpired ? "Expired" : isEventActive ? "Live" : "Upcoming"}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center z-20">
            <span className="text-white font-bold text-sm sm:text-lg bg-red-600 px-3 py-2 sm:px-4 sm:py-2 rounded-lg">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Category and Title */}
        <div className="space-y-2">
          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block font-medium">
            {event.category}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-2 leading-tight">
            {event.name}
          </h2>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Timer Section */}
        <div className="bg-gray-50 p-3 rounded-lg">
          {isExpired ? (
            <p className="text-red-500 font-semibold text-center">Event Expired</p>
          ) : (
            <div className="text-center">
              <p className="text-gray-700 text-xs mb-1 font-medium">Ends in:</p>
              <p className="text-red-500 font-bold text-sm bg-red-50 px-2 py-1 rounded-md inline-block">
                {timeLeft}
              </p>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl sm:text-2xl text-red-600 font-bold">
              ${event.discountPrice}
            </span>
            {event.originalPrice && event.originalPrice !== event.discountPrice && (
              <span className="line-through text-gray-500 text-sm sm:text-base">
                ${event.originalPrice}
              </span>
            )}
          </div>
          {discountPercentage > 0 && (
            <span className="text-green-600 font-semibold text-xs sm:text-sm bg-green-50 px-2 py-1 rounded-md">
              Save ${(event.originalPrice - event.discountPrice).toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Info with Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
            <span className={currentStock <= 5 && currentStock > 0 ? 'text-orange-600 font-semibold' : ''}>
              Stock: {currentStock}
            </span>
            <span>Sold: {currentSoldOut}</span>
          </div>
          
          {/* Stock Progress Bar */}
          {(currentStock > 0 || currentSoldOut > 0) && (
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${soldPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                {currentSoldOut} sold out of {currentStock + currentSoldOut}
              </p>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        {!isExpired && isEventActive ? (
          <button 
            disabled={!canAddToCart || isLoading}
            className={`w-full py-3 px-4 font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md flex items-center justify-center gap-2 text-sm sm:text-base ${
              !canAddToCart || isLoading
                ? 'bg-gray-400 text-white cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-lg'
            }`}
            onClick={addToCartHandler}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <BsCartPlus className="text-lg" />
                <span>
                  {isOutOfStock ? 'Out of Stock' : 
                   isItemInCart ? 'In Cart' : 
                   'Add to Cart'}
                </span>
              </>
            )}
          </button>
        ) : (
          <button 
            disabled 
            className="w-full py-3 px-4 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-60 font-semibold text-sm sm:text-base"
          >
            {isExpired ? "Event Ended" : "Not Available"}
          </button>
        )}

        {/* Stock Status */}
        <div className="text-center">
          {currentStock > 10 ? (
            <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded-md inline-block">
              ✓ In Stock ({currentStock} available)
            </span>
          ) : currentStock > 0 ? (
            <span className="text-orange-600 font-medium text-xs bg-orange-50 px-2 py-1 rounded-md inline-block animate-pulse">
              ⚠ Only {currentStock} left - Limited time!
            </span>
          ) : (
            <span className="text-red-600 font-medium text-xs bg-red-50 px-2 py-1 rounded-md inline-block">
              ✗ Out of Stock
            </span>
          )}
        </div>

        {/* Event Dates */}
        <div className="text-xs text-gray-500 text-center space-y-1 pt-2 border-t border-gray-100">
          <p><span className="font-medium">Start:</span> {new Date(event.start_Date).toLocaleDateString()}</p>
          <p><span className="font-medium">End:</span> {new Date(event.Finish_Date).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default EventCard;