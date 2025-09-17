import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProducts } from '../../redux/actions/product';
import { getAllEvents } from '../../redux/actions/event';
import { FiStar, FiMessageCircle, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import Loader from '../components/Loader';

const ShopProfileData = ({ isOwner }) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { name: 'Products', icon: FiTrendingUp },
    { name: 'Events', icon: FiCalendar },
    { name: 'Reviews', icon: FiMessageCircle }
  ];

  const { products, loading } = useSelector((state) => state.product);
  const { events } = useSelector((state) => state.event);
  const { seller } = useSelector((state) => state.seller);
  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  useEffect(() => {
    if (isOwner && seller?._id) {
      dispatch(getAllProducts(seller._id));
      dispatch(getAllEvents(seller._id));
    }
  }, [dispatch, isOwner, seller?._id]);

  const reviewsData = useMemo(() => {
    if (!products || !Array.isArray(products)) return { total: 0, average: 0, reviews: [], breakdown: {} };
    
    const allReviews = products.flatMap(product => 
      (product.reviews || []).map(review => ({
        ...review,
        productName: product.name,
        productId: product._id
      }))
    );

    const totalRating = allReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const breakdown = allReviews.reduce((acc, review) => {
      const rating = Math.floor(review.rating || 0);
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    return {
      total: allReviews.length,
      average: allReviews.length ? totalRating / allReviews.length : 0,
      reviews: allReviews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
      breakdown
    };
  }, [products]);

  const getImageUrl = (item) => {
    const firstImage = item?.images?.[0];
    if (!firstImage) return '/placeholder-image.png';
    
    if (typeof firstImage === 'string') {
      if (firstImage.startsWith('http')) return firstImage;
      return firstImage.startsWith('/') ? `http://localhost:5000${firstImage}` : `http://localhost:5000/uploads/${firstImage}`;
    }
    
    return firstImage?.url?.startsWith('http') ? firstImage.url : `http://localhost:5000${firstImage?.url || ''}`;
  };

  const StarRating = ({ rating, size = 'w-4 h-4' }) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <FiStar key={i} className={`${size} ${i < Math.floor(rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
      ))}
    </div>
  );

  const ItemCard = ({ item, type }) => (
    <div className=" bg-white border rounded-xl overflow-hidden shadow-sm mb-10 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative bg-gray-50 flex flex-row gap-4">
        <img 
          src={getImageUrl(item)} 
          alt={item.name} 
          className="w-[50vh] h-[40vh] sm:h-80 lg:h-60  flex-shrink-0" 
        />
        {type === 'event' && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Ends {new Date(Date.now() + 240 * 60 * 60 * 1000).toLocaleDateString()}
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4 space-y-2">
        <h5 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.name}</h5>
        <div className="space-y-1 text-xs sm:text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Price:</span>
            <span className="font-medium text-green-600">${item.discountPrice}</span>
          </div>
          <div className="flex justify-between">
            <span>Stock:</span>
            <span className="font-medium">{item.stock}</span>
          </div>
          <div className="flex justify-between">
            <span>Sold:</span>
            <span className="font-medium">{item.sold_out}</span>
          </div>
        </div>
        {item.reviews?.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <StarRating rating={item.rating} size="w-3 h-3" />
            <span className="text-xs text-gray-500">({item.reviews.length})</span>
          </div>
        )}
      </div>
    </div>
  );

  const ReviewsOverview = () => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Reviews Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">{reviewsData.average.toFixed(1)}</div>
          <StarRating rating={reviewsData.average} size="w-4 h-4 sm:w-5 sm:h-5" />
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Average Rating</p>
        </div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{reviewsData.total}</div>
          <p className="text-xs sm:text-sm text-gray-600">Total Reviews</p>
        </div>
        <div className="space-y-2 text-black col-span-1 sm:col-span-2 lg:col-span-1">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = reviewsData.breakdown[rating] || 0;
            const percentage = reviewsData.total ? (count / reviewsData.total) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="w-6">{rating}★</span>
                <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 transition-all" style={{ width: `${percentage}%` }} />
                </div>
                <span className="w-6 text-gray-600">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const ReviewsList = () => (
    <div className="space-y-4">
      <h4 className="text-base sm:text-lg font-semibold text-gray-900">Customer Reviews</h4>
      <div className="max-h-80 sm:max-h-96 overflow-y-auto space-y-3 pr-2">
        {reviewsData.reviews.map((review, index) => (
          <div key={review._id || index} className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} />
                <span className="text-xs sm:text-sm font-medium">{review.rating}/5</span>
              </div>
              <span className="text-xs text-gray-500">
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
              </span>
            </div>
        
            <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">
              {review.user?.name || 'Anonymous'}
            </p>
            {review.comment && <p className="text-gray-700 mb-2 text-xs sm:text-sm">"{review.comment}"</p>}
            <div className="bg-gray-50 rounded-lg p-2">
              <span className="text-xs text-gray-600">Product: {review.productName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const EmptyState = ({ message, icon }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl">
      <div className="text-gray-400 mb-4">{icon}</div>
      <p className="text-gray-600 text-center text-sm sm:text-base">{message}</p>
    </div>
  );

  if (loading) return <Loader />;

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6 relative z-0">
      {/* Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border p-4 sm:p-6 relative">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const count = index === 0 ? products?.length : index === 1 ? events?.length : reviewsData.total;
              
              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`relative flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 ${
                    activeTab === index
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{tab.name}</span>
                  {count > 0 && (
                    <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold ${
                      activeTab === index ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          {isOwner && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to="/shop-dashboard" className="flex-1">
                <button className="w-full bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl hover:bg-gray-900 transition-colors text-xs sm:text-sm font-medium">
                  Shop Dashboard
                </button>
              </Link>
              <Link to="/" className="flex-1">
                <button className="w-full bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium">
                  MultiMart Home
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {activeTab === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4">
            {products?.length > 0 ? (
              products.map(product => <ItemCard key={product._id} item={product} type="product" />)
            ) : (
              <EmptyState 
                message="No products available" 
                icon={<FiTrendingUp className="w-12 h-12 sm:w-16 sm:h-16" />} 
              />
            )}
          </div>
        )}

        {activeTab === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4">
            {events?.length > 0 ? (
              events.map(event => <ItemCard key={event._id} item={event} type="event" />)
            ) : (
              <EmptyState 
                message="No events running" 
                icon={<FiCalendar className="w-12 h-12 sm:w-16 sm:h-16" />} 
              />
            )}
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-4 sm:space-y-6">
            {reviewsData.total > 0 ? (
              <>
                <ReviewsOverview />
                <ReviewsList />
              </>
            ) : (
              <EmptyState 
                message="No reviews yet" 
                icon={<FiMessageCircle className="w-12 h-12 sm:w-16 sm:h-16" />} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopProfileData;