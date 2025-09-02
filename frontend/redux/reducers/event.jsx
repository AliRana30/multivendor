import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  event: null,          
  events: [],         // Events from specific seller
  allEvents: [],      // Events from all sellers
  allEventsLoading: false,
  allEventsError: null,
  error: null,
  success: false,
  message: null,
};

const eventReducer = createReducer(initialState, (builder) => {
  builder
    // Create event
    .addCase("eventCreateRequest", (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase("eventCreateSuccess", (state, action) => {
      state.loading = false;
      state.event = action.payload;
      state.success = true;
    })
    .addCase("eventCreateFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    })

    // Get events from specific seller
    .addCase("getAllEventsShopRequest", (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase("getAllEventsShopSuccess", (state, action) => {
      state.loading = false;
      state.events = action.payload;
      state.error = null;
    })
    .addCase("getAllEventsShopFailed", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // Get all events from all sellers
    .addCase("getAllEventsRequest", (state) => {
      state.allEventsLoading = true;
      state.allEventsError = null;
    })
    .addCase("getAllEventsSuccess", (state, action) => {
      state.allEventsLoading = false;
      state.allEvents = action.payload;
      state.allEventsError = null;
    })
    .addCase("getAllEventsFailed", (state, action) => {
      state.allEventsLoading = false;
      state.allEventsError = action.payload;
    })

    // Delete event
    .addCase("deleteeventRequest", (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase("deleteeventSuccess", (state, action) => {
      state.loading = false;
      state.message = action.payload;
    })
    .addCase("deleteeventFailed", (state, action) => {
      state.loading = false; 
      state.error = action.payload;
    });
});

export default eventReducer;