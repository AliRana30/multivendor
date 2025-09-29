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
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="relative">
        <img 
          src={getImageUrl(item)} 
          alt={item.name} 
          className="w-full h-48 sm:h-56 md:h-64 object-cover bg-gray-50" 
        />
        {type === 'event' && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
            Ends {new Date(Date.now() + 240 * 60 * 60 * 1000).toLocaleDateString()}
          </div>
        )}
      </div>
      <div className="p-6 space-y-4">
        <h5 className="font-medium text-gray-900 text-lg leading-tight">{item.name}</h5>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500 font-light">Price</p>
            <p className="font-medium text-green-600">${item.discountPrice}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 font-light">Stock</p>
            <p className="font-medium text-gray-900">{item.stock}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 font-light">Sold</p>
            <p className="font-medium text-gray-900">{item.sold_out}</p>
          </div>
        </div>

        {item.reviews?.length > 0 && (
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100">
            <StarRating rating={item.rating} size="w-4 h-4" />
            <span className="text-sm text-gray-500 font-light">({item.reviews.length} reviews)</span>
          </div>
        )}
      </div>
    </div>
  );

  const ReviewsOverview = () => (
    <div className="bg-white rounded-lg p-8 border border-gray-100 shadow-sm">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-light text-gray-900 mb-2">Reviews Overview</h3>
        <div className="w-12 h-[1px] bg-gray-900 mx-auto"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center space-y-3">
          <div className="text-4xl font-light text-gray-900">{reviewsData.average.toFixed(1)}</div>
          <div className="flex justify-center">
            <StarRating rating={reviewsData.average} size="w-5 h-5" />
          </div>
          <p className="text-gray-500 font-light">Average Rating</p>
        </div>
        
        <div className="text-center space-y-3">
          <div className="text-4xl font-light text-gray-900">{reviewsData.total}</div>
          <p className="text-gray-500 font-light">Total Reviews</p>
        </div>
        
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = reviewsData.breakdown[rating] || 0;
            const percentage = reviewsData.total ? (count / reviewsData.total) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-6">{rating}★</span>
                <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-900 transition-all duration-300" style={{ width: `${percentage}%` }} />
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const ReviewsList = () => (
    <div className="bg-white rounded-lg p-8 border border-gray-100 shadow-sm">
      <div className="text-center mb-8">
        <h4 className="text-xl font-light text-gray-900 mb-2">Customer Reviews</h4>
        <div className="w-10 h-[1px] bg-gray-900 mx-auto"></div>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-6 pr-2">
        {reviewsData.reviews.map((review, index) => (
          <div key={review._id || index} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <StarRating rating={review.rating} />
                <span className="text-sm font-medium text-gray-900">{review.rating}/5</span>
              </div>
              <span className="text-sm text-gray-500 font-light">
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
              </span>
            </div>
            
            <p className="font-medium text-gray-900 mb-2">
              {review?.user || 'Anonymous Customer'}
            </p>
            
            {review.comment && (
              <p className="text-gray-600 font-light leading-relaxed mb-3">"{review.comment}"</p>
            )}
            
            <div className="bg-gray-50 rounded-md px-3 py-2">
              <span className="text-sm text-gray-600 font-light">Product: {review.productName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const EmptyState = ({ message, icon }) => (
    <div className="text-center py-20">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
        <div className="text-gray-300">{icon}</div>
      </div>
      <h3 className="text-2xl font-light text-gray-900 mb-3">No content available</h3>
      <p className="text-gray-500 font-light text-lg">{message}</p>
    </div>
  );

  if (loading) return <Loader />;

  return (
    <div className="w-full py-20 px-4 md:px-10 bg-gray-50" style={{margin: 0, padding: 0}}>
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-20">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <div className="inline-block mb-8">
            <p className="text-sm font-medium text-gray-500 tracking-[0.15em] uppercase mb-4 font-mono">
              Shop Dashboard
            </p>
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 leading-[0.9] mb-6">
              {seller?.name || 'Shop Profile'}
            </h1>
            <div className="w-20 h-[1px] bg-gray-900 mx-auto"></div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const count = index === 0 ? products?.length : index === 1 ? events?.length : reviewsData.total;
              
              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-light text-sm tracking-wide transition-all duration-300 ${
                    activeTab === index
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                  {count > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      activeTab === index ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-600'
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
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              <Link to="/shop-dashboard" className="flex-1">
                <button className="w-full px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200 font-medium tracking-wide">
                  Shop Dashboard
                </button>
              </Link>
              <Link to="/" className="flex-1">
                <button className="w-full px-8 py-3 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors duration-200 font-medium tracking-wide">
                  MultiMart Home
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {activeTab === 0 && (
            products?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.map(product => <ItemCard key={product._id} item={product} type="product" />)}
              </div>
            ) : (
              <EmptyState 
                message="No products available yet" 
                icon={<FiTrendingUp className="w-12 h-12" />} 
              />
            )
          )}

          {activeTab === 1 && (
            events?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {events.map(event => <ItemCard key={event._id} item={event} type="event" />)}
              </div>
            ) : (
              <EmptyState 
                message="No events running currently" 
                icon={<FiCalendar className="w-12 h-12" />} 
              />
            )
          )}

          {activeTab === 2 && (
            reviewsData.total > 0 ? (
              <div className="space-y-8">
                <ReviewsOverview />
                <ReviewsList />
              </div>
            ) : (
              <EmptyState 
                message="No reviews received yet" 
                icon={<FiMessageCircle className="w-12 h-12" />} 
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopProfileData;