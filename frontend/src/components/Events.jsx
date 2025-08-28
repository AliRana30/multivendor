import { useDispatch, useSelector } from 'react-redux';
import EventCard from '../Cards/EventCard';
import { useEffect, useState } from 'react';
import { getAllEvents } from '../../redux/actions/event';

const Events = () => {
  const { events, loading, error } = useSelector((state) => state.event);
  const { seller } = useSelector((state) => state.seller); 
  const dispatch = useDispatch();

  useEffect(() => {
    if (seller?._id) {
      console.log('Fetching events for seller:', seller._id);
      dispatch(getAllEvents(seller._id)); 
    }
  }, [dispatch, seller?._id]);

  if (loading) {
    return (
      <div className="p-4 w-full bg-gray-50 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading exciting events...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch the latest deals</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 w-full bg-gray-50">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-md p-6 border border-red-200">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-semibold">Oops! Something went wrong</p>
            <p className="text-sm text-red-400 mt-1">{error}</p>
          </div>
          <button 
            onClick={() => dispatch(getAllEvents(seller?._id))}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="p-4 w-full bg-gray-50 min-h-screen mt-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-3xl font-bold text-gray-800 mb-4">
            🎉 Popular Events
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover amazing deals and limited-time offers on your favorite products
          </p>
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-semibold text-gray-600">No Events Found</p>
            <p className="text-sm text-gray-500 mt-2">There are no events available at the moment. Check back later!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full bg-gray-50 min-h-screen mt-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-3xl font-bold text-gray-800 mb-4">
          🎉 Popular Events
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Discover amazing deals and limited-time offers on your favorite products
        </p>
        <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-8 px-4">
          {events.map((event, index) => (
            <EventCard key={event._id || `event-${index}`} event={event} />
          ))}
        </div>
      </div>

     
    </div>
  );
};

export default Events;