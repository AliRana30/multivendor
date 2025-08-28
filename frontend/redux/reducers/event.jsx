import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  event: null,          
  events: [],         
  error: null,
  success: false,
};

const eventReducer = createReducer(initialState, (builder) => {
  builder
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

    // get event of shop
    .addCase("getAllEventsShopRequest",(state,action)=>{
      state.loading = true
    })
    .addCase("getAllEventsShopSuccess",(state,action)=>{
      state.loading = false,
      state.events = action.payload
    })
    .addCase("getAllEventsShopFailed",(state,action)=>{
      state.loading = false,
      state.error = action.payload
    })

    //delete a event from shop
    .addCase("deleteEventRequest", (state) => {
  state.loading = true;
})
.addCase("deleteEventSuccess", (state, action) => {
  state.loading = false;
  state.message = action.payload;
})
.addCase("deleteEventFailed", (state, action) => {
  state.loading = false; 
  state.error = action.payload;
});

});

export default eventReducer;
