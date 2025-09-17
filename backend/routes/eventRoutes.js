import express from 'express'
import { upload } from '../multer.js'
import { 
  bulkUpdateEventStock, 
  deleteEvent, 
  EventController, 
  getEventController, 
  getAllEventsController,  
  updateEventStock 
} from '../controllers/eventController.js';
import { isSeller } from '../middlewares/auth.js';

export const eventRouter = express.Router();

eventRouter.post('/create-event', upload.array("images"), EventController);
eventRouter.get('/all-events', getAllEventsController);
eventRouter.get('/all-events/:id', getEventController);
eventRouter.delete('/delete-event/:id', isSeller, deleteEvent);
eventRouter.put('/event-update-stock/:id', updateEventStock);
eventRouter.put('/event-bulk-update-stock', bulkUpdateEventStock);