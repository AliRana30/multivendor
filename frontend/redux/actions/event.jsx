import api from "../../src/components/axiosCongif";

export const createEvent = (formData) => async (dispatch) => {
  try {
    dispatch({ type: "eventCreateRequest" });

    const { data } = await api.post("/create-event", formData);

    dispatch({
      type: "eventCreateSuccess",
      payload: data.event,
    });
  } catch (error) {
    dispatch({
      type: "eventCreateFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// getting events from a specific seller
export const getAllEvents = (id) => async (dispatch) => {
    try {
       dispatch({ type: "getAllEventsShopRequest" });

       const { data } = await api.get(`/all-events/${id}`);
       dispatch({ 
           type: "getAllEventsShopSuccess", 
           payload: data.events 
       });
    } catch (error) {
       dispatch({
          type: "getAllEventsShopFailed",
          payload: error.response?.data?.message || error.message,
        });
    }
};

//  Get all events from all sellers
export const getAllEventsFromAllSellers = () => async (dispatch) => {
    try {
        dispatch({ type: "getAllEventsRequest" });

        const { data } = await api.get('/all-events');
        dispatch({ 
            type: "getAllEventsSuccess", 
            payload: data.events 
        });
    } catch (error) {
        dispatch({
            type: "getAllEventsFailed",
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const deleteEvent = (id) => async (dispatch) => {
   try {
      dispatch({ type: "deleteeventRequest" });

      const { data } = await api.delete(`/delete-event/${id}`, { withCredentials: true });
 
      dispatch({ 
          type: "deleteeventSuccess", 
          payload: data.message 
      });
      
   } catch (error) {
      dispatch({ 
          type: "deleteeventFailed", 
          payload: error.response?.data?.message || error.message 
      });
   }
};

export const getAllAdminEvents = () => async(dispatch)=>{
  try {
    dispatch({ type: "LoadAdminEventsRequest" });
    
    const { data } = await api.get(`/admin-all-events`, {
      withCredentials: true
    });
    
    
    dispatch({
      type: "LoadAdminEventsSuccess",
      payload: data.adminevents
    });
  } catch (error) {
    console.error('Error fetching admin sellers:', error);
    dispatch({
      type: "LoadAdminEventsFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};