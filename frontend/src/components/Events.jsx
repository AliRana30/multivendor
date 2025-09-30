import { useDispatch, useSelector } from 'react-redux';
import EventCard from '../Cards/EventCard';
import { useEffect, useRef } from 'react';
import { getAllEvents, getAllEventsFromAllSellers } from '../../redux/actions/event';

const Events = () => {
  const { 
    allEvents,
    allEventsLoading,
    allEventsError 
  } = useSelector((state) => state.event);
  
  const dispatch = useDispatch();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      dispatch(getAllEventsFromAllSellers());
    }
  }, [dispatch]);


  const currentEvents = allEvents;
  const currentLoading = allEventsLoading;
  const currentError = allEventsError;

  if (currentLoading) {
    return (
      <div className="p-4 w-full overflow-x-hidden bg-gray-50 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading events...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the latest events</p>
        </div>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className="p-4 w-full overflow-x-hidden bg-gray-50 min-h-[400px] flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-semibold">Error loading events</p>
            <p className="text-sm text-gray-600 mt-1">{currentError}</p>
          </div>
          <button 
            onClick={() => {
              hasInitialized.current = false;
              dispatch(getAllEventsFromAllSellers());
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen mt-20">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
         <div className="justify-center text-center mb-6">
            <p className="text-sm font-medium text-gray-500 tracking-[0.15em] uppercase mb-4 font-mono mt-5">
              Limited Time
            </p>
            <h1 className="text-3xl md:text-4xl font-light text-gray-900 leading-[0.9] mb-6 ">
              Popular Events
            </h1>
            <div className="w-20 h-[1px] bg-gray-900 mx-auto"></div>
          </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentEvents && currentEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentEvents.map((event, index) => (
              <div key={event._id || `event-${index}`} className="flex justify-center">
                <EventCard 
                  event={event} 
                  onEventUpdate={(updatedEvent) => {
                    // Handle event updates if needed
                    console.log('Event updated:', updatedEvent);
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9l3 3 3-3m-3-3v6m-9-6a9 9 0 1118 0v9a9 9 0 01-18 0V8z" />
                </svg>
                <p className="text-xl font-semibold text-gray-700 mb-2">No Events Available</p>
                <p className="text-gray-600 mb-4">
                  There are no active events at the moment. Check back later for exciting deals and offers!
                </p>
          
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
