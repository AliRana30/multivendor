import { useDispatch, useSelector } from 'react-redux';
import EventCard from '../Cards/EventCard';
import { useEffect } from 'react';
import { getAllEvents } from '../../redux/actions/event';

const Events = () => {
  const { events, loading, error } = useSelector((state) => state.event);
  const { seller } = useSelector((state) => state.seller); 
  const dispatch = useDispatch();

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllEvents(seller._id)); 
    }
  }, [dispatch, seller?._id]);

  if (loading) {
    return (
      <div className="p-4 w-full overflow-x-hidden bg-gray-100 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 w-full overflow-x-hidden bg-gray-100">
        <div className="text-center text-red-500 py-10">
          <p className="text-lg">Error loading events</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => dispatch(getAllEvents(seller?._id))}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 w-full overflow-x-hidden bg-gray-100" style={{ margin: 0, padding: 0 }}>
      <h1 className="text-3xl font-bold text-black mb-10 text-center mt-10">Popular Events</h1>

      <div className="grid grid-cols-1 gap-6 px-4 mb-10">
        {events && events.length > 0 ? (
          <>
            {events.map((event, index) => (
              <EventCard key={event._id || `event-${index}`} event={event} />
            ))}
          </>
        ) : (
          <div className="text-center text-gray-500 py-10">
            <p className="text-lg">No events available at the moment</p>
            <p className="text-sm">Check back later for exciting deals!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;