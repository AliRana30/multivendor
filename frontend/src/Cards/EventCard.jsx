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
  
  // Redux state and dispatch
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

  const getImageUrl = useCallback((imageObj) => {
    if (!imageObj) return '/placeholder-image.png';
    
    if (imageObj.url) {
      return imageObj.url;
    }
    
    if (typeof imageObj === 'string') {
      if (imageObj.startsWith('http://') || imageObj.startsWith('https://')) {
        return imageObj;
      }
      if (imageObj.startsWith('/')) {
        return `http://localhost:5000${imageObj}`;
      }
      return `http://localhost:5000/${imageObj}`;
    }
    
    return '/placeholder-image.png';
  }, []);

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
    <div className="w-full bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-4 flex flex-col lg:flex-row items-center max-w-6xl mx-auto border border-gray-200">
      {/* Image Section */}
      <div className="w-full lg:w-1/2 mb-4 lg:mb-0 relative">
        <img
          src={getImageUrl(event.images?.[0])}
          alt={event.name}
          className="w-full h-48 sm:h-64 md:h-72 lg:h-80 object-contain rounded-lg"
          loading="lazy"
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
            -{discountPercentage}% OFF
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${
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
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg bg-red-600 px-4 py-2 rounded-lg">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="w-full lg:w-1/2 lg:pl-6 text-center lg:text-left">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            {event.name}
          </h2>
          <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block w-fit mx-auto lg:mx-0">
            {event.category}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {event.description}
        </p>

        {/* Timer */}
        <div className="mb-4">
          {isExpired ? (
            <p className="text-red-500 font-semibold text-lg">Event Expired</p>
          ) : (
            <div>
              <p className="text-gray-700 text-sm mb-1">Ends in:</p>
              <p className="text-red-500 font-bold text-lg bg-red-50 px-3 py-2 rounded-lg inline-block">
                {timeLeft}
              </p>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="flex justify-center lg:justify-start items-center gap-4 mb-4">
          <span className="text-2xl text-red-600 font-bold">
            ${event.discountPrice}
          </span>
          {event.originalPrice && event.originalPrice !== event.discountPrice && (
            <span className="line-through text-gray-500 text-lg">
              ${event.originalPrice}
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="text-green-600 font-semibold text-sm">
              Save ${event.originalPrice - event.discountPrice}
            </span>
          )}
        </div>

        {/* Stock Info */}
        <div className="mb-4">
          <div className="flex justify-center lg:justify-start items-center gap-4 text-sm text-gray-600">
            <span className={currentStock <= 5 && currentStock > 0 ? 'text-orange-600 font-semibold' : ''}>
              Stock: {currentStock}
            </span>
            <span>•</span>
            <span>Sold: {currentSoldOut}</span>
          </div>
          
          {/* Stock Progress Bar */}
          {(currentStock > 0 || currentSoldOut > 0) && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${soldPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {currentSoldOut} sold out of {currentStock + currentSoldOut}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center lg:justify-start gap-3">
          {!isExpired && isEventActive ? (
            <button 
              disabled={!canAddToCart || isLoading}
              className={`px-6 py-2 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-2 ${
                !canAddToCart || isLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-lg'
              }`}
              onClick={addToCartHandler}
            >
              <BsCartPlus className="text-lg" />
              <span>
                {isLoading ? 'Adding...' : 
                 isOutOfStock ? 'Out of Stock' : 
                 isItemInCart ? 'In Cart' : 
                 'Add to Cart'}
              </span>
            </button>
          ) : (
            <button 
              disabled 
              className="px-6 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-60 font-semibold"
            >
              {isExpired ? "Event Ended" : "Not Available"}
            </button>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-3 text-xs text-center lg:text-left">
          {currentStock > 10 ? (
            <span className="text-green-600 font-medium">✓ In Stock ({currentStock} available)</span>
          ) : currentStock > 0 ? (
            <span className="text-orange-600 font-medium animate-pulse">⚠ Only {currentStock} left - Limited time!</span>
          ) : (
            <span className="text-red-600 font-medium">✗ Out of Stock</span>
          )}
        </div>

        {/* Event Dates */}
        <div className="mt-4 text-xs text-gray-500 text-center lg:text-left">
          <p>Start: {new Date(event.start_Date).toLocaleDateString()}</p>
          <p>End: {new Date(event.Finish_Date).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default EventCard;