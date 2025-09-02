import { Shop } from "../models/shop.js";
import { Event } from "../models/event.js";

export const EventController = async (req, res) => {
  try {
    const shopId = req.body.shopId;
    const shop = await Shop.findById(shopId);

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const images = files.map((file) => ({
      public_id: file.filename,
      url: `/uploads/${file.filename}`,
    }));

    const eventData = {
      ...req.body,
      images,
      shop,
    };

    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Event creation error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get events from a specific seller
export const getEventController = async (req, res) => {
  try {
    const events = await Event.find({ shopId: req.params.id });

    res.status(200).json({
      success: true,
      message: "Events Found",
      events
    });
  } catch (error) {
    console.error("❌ Events Not Found:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// NEW: Get all events from all sellers
export const getAllEventsController = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('shop', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All Events Found",
      events
    });
  } catch (error) {
    console.error("❌ All Events Not Found:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findByIdAndDelete(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event Not Found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event Deleted"
    });

  } catch (error) {
    console.error("❌ Can't delete Event", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateEventStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, sold_out } = req.body;

    // Validation
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required"
      });
    }

    if (stock === undefined || sold_out === undefined) {
      return res.status(400).json({
        success: false,
        message: "Both stock and sold_out values are required"
      });
    }

    if (stock < 0 || sold_out < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock and sold_out values cannot be negative"
      });
    }

    // Find and update the event
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Check if event is still active
    const now = new Date();
    const endDate = new Date(event.Finish_Date);
    
    if (now > endDate) {
      return res.status(400).json({
        success: false,
        message: "Cannot update stock for expired events"
      });
    }

    // Update the stock values
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { 
        stock: parseInt(stock),
        sold_out: parseInt(sold_out)
      },
      { 
        new: true,
        runValidators: true
      }
    );

    console.log(`Event ${id} stock updated: stock=${stock}, sold_out=${sold_out}`);

    res.status(200).json({
      success: true,
      message: "Event stock updated successfully",
      event: updatedEvent
    });

  } catch (error) {
    console.error("Error updating event stock:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    });
  }
};

export const bulkUpdateEventStock = async (req, res) => {
  try {
    const { updates } = req.body; 
    
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Updates array is required"
      });
    }

    const results = [];
    
    // Process each update
    for (const update of updates) {
      const { eventId, quantity } = update;
      
      if (!eventId || !quantity || quantity <= 0) {
        results.push({
          eventId,
          success: false,
          message: "Invalid eventId or quantity"
        });
        continue;
      }

      try {
        const event = await Event.findById(eventId);
        
        if (!event) {
          results.push({
            eventId,
            success: false,
            message: "Event not found"
          });
          continue;
        }

        // Check if event is still active
        const now = new Date();
        const endDate = new Date(event.Finish_Date);
        
        if (now > endDate) {
          results.push({
            eventId,
            success: false,
            message: "Event has expired"
          });
          continue;
        }

        // Check if enough stock is available
        if (event.stock < quantity) {
          results.push({
            eventId,
            success: false,
            message: `Insufficient stock. Available: ${event.stock}, Requested: ${quantity}`
          });
          continue;
        }

        // Update stock
        const newStock = event.stock - quantity;
        const newSoldOut = event.sold_out + quantity;

        await Event.findByIdAndUpdate(
          eventId,
          { 
            stock: newStock,
            sold_out: newSoldOut
          }
        );

        results.push({
          eventId,
          success: true,
          message: "Stock updated successfully",
          newStock,
          newSoldOut
        });

      } catch (error) {
        results.push({
          eventId,
          success: false,
          message: error.message || "Update failed"
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.status(200).json({
      success: true,
      message: `Bulk update completed. Success: ${successCount}, Failed: ${failureCount}`,
      results
    });

  } catch (error) {
    console.error("Error in bulk stock update:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    });
  }
};