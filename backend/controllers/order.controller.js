// controllers/orderController.js
import { Order } from "../models/order.js";
import mongoose from "mongoose";
import { Shop } from "../models/shop.js";

export const createOrderController = async (req, res) => {
  try {
    const {
      user,
      items,
      shippingAddress,
      paymentInfo,
      coupon,
      totalAmount
    } = req.body;

    console.log("Order payload received:", req.body);

    // validation
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Missing user information"
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing items in order"
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Missing shipping address"
      });
    }

    if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid total amount is required"
      });
    }

    // Validate shipping address fields
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.zipCode) {
      return res.status(400).json({
        success: false,
        message: "Shipping address must include address, city, and zipCode"
      });
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item._id || !item.shopId || !item.qty || item.qty <= 0) {
        return res.status(400).json({
          success: false,
          message: `Item at index ${i} is missing required fields (product ID, shop ID, or quantity)`
        });
      }
      
      if (!item.price || isNaN(item.price) || item.price <= 0) {
        return res.status(400).json({
          success: false,
          message: `Item at index ${i} has invalid price`
        });
      }
    }

    const ordersByShop = {};
    
    items.forEach(item => {
      const shopId = item.shopId;
      if (!ordersByShop[shopId]) {
        ordersByShop[shopId] = [];
      }
      ordersByShop[shopId].push({
        product: item._id,
        quantity: parseInt(item.qty),
        price: parseFloat(item.originalPrice || item.price),
        discountPrice: parseFloat(item.discountPrice || item.price),
        name: item.name || 'Product',
        images: item.images || []
      });
    });

    const createdOrders = [];

    for (const [shopId, shopItems] of Object.entries(ordersByShop)) {
      if (!mongoose.Types.ObjectId.isValid(shopId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid shop ID: ${shopId}`
        });
      }

      const shopSubtotal = shopItems.reduce((total, item) => {
        const itemTotal = item.discountPrice * item.quantity;
        return total + (isNaN(itemTotal) ? 0 : itemTotal);
      }, 0);
      
      let shopDiscount = 0;
      let shopTotal = shopSubtotal;
      
      if (coupon && coupon.discount && !isNaN(coupon.discount)) {
        const proportion = shopSubtotal / (totalAmount + (coupon.discount || 0));
        shopDiscount = Math.round((coupon.discount * proportion) * 100) / 100;
        shopTotal = Math.max(0, shopSubtotal - shopDiscount); 
      }

      let userId;
      if (typeof user === 'string' && mongoose.Types.ObjectId.isValid(user)) {
        userId = user;
      } else if (user && user._id && mongoose.Types.ObjectId.isValid(user._id)) {
        userId = user._id;
      } else if (user && user.id && mongoose.Types.ObjectId.isValid(user.id)) {
        userId = user.id;
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID format"
        });
      }

      const orderData = {
        user: userId,
        shop: shopId,
        items: shopItems,
        shippingAddress: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state || '',
          country: shippingAddress.country || '',
          zipCode: shippingAddress.zipCode,
          phoneNumber: shippingAddress.phoneNumber || ''
        },
        paymentInfo: {
          paymentMethod: paymentInfo?.paymentMethod || 'cod',
          paymentStatus: paymentInfo?.paymentStatus || 'pending',
          transactionId: paymentInfo?.transactionId || null,
          cardNumber: paymentInfo?.cardNumber ? 
            `****-****-****-${paymentInfo.cardNumber.toString().slice(-4)}` : null,
          cardHolderName: paymentInfo?.cardHolderName || null,
          expiryDate: paymentInfo?.expiryDate || null,
          cvv: paymentInfo?.cvv || null
        },
        coupon: shopDiscount > 0 ? {
          code: coupon.code,
          discount: shopDiscount,
          discountPercent: coupon.discountPercent || 0
        } : null,
        subtotal: Math.round(shopSubtotal * 100) / 100, 
        totalPrice: Math.round(shopTotal * 100) / 100,
        orderStatus: 'processing'
      };

      console.log("Creating order with data:", JSON.stringify(orderData, null, 2));

      const order = await Order.create(orderData);
      
      const populatedOrder = await Order.findById(order._id)
        .populate('user', 'name email')
        .populate('shop', 'name')
        .populate('items.product', 'name images');
      
      createdOrders.push(populatedOrder);
    }

    res.status(201).json({
      success: true,
      message: "Orders created successfully",
      orders: createdOrders,
      count: createdOrders.length
    });

  } catch (error) {
    console.error("❌ Order creation error:", error.message);
    
    if (error.name === 'ValidationError') {
      console.error("Validation errors:", error.errors);
      return res.status(400).json({
        success: false,
        message: "Order validation failed",
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    });
  }
};

// Get all orders 
export const getAllOrdersController = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      userId, 
      shopId 
    } = req.query;
    
    let query = {};
    if (status) query.orderStatus = status;
    if (userId) query.user = userId;
    
    const finalShopId = shopId || req.params.id;
    if (finalShopId) {
      query.shop = finalShopId;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phoneNumber')
      .populate('shop', 'name')
      .populate('items.product', 'name images stock')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalOrders = await Order.countDocuments(query);

    // Keep orders as they are - no transformation needed
    res.status(200).json({
      success: true,
      message: finalShopId ? "Shop orders retrieved successfully" : "Orders retrieved successfully",
      orders: orders, // Return orders as-is
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNextPage: page < Math.ceil(totalOrders / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error("❌ Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    });
  }
};

// Get orders for a specific user
export const getUserOrdersController = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const orders = await Order.find({ user: userId })
      .populate('shop', 'name user') 
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "User orders retrieved successfully",
      orders,
      count: orders.length
    });

  } catch (error) {
    console.error("❌ Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    });
  }
};

// Get single order by ID
export const getOrderByIdController = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required"
      });
    }

    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('shop', 'name')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      order
    });

  } catch (error) {
    console.error("❌ Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order",
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    });
  }
};

// Update order status
// Update order status - FIXED VERSION
export const updateOrderStatusController = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { orderStatus } = req.body;

    if (!orderId || !orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Order ID and order status are required"
      });
    }

    const validStatuses = [
      "processing", 
      "transferred to delivery partner", 
      "shipping", 
      "received", 
      "on the way", 
      "delivered", 
      "cancelled", 
      "refunded"
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    // Get current order with populated shop data
    const currentOrder = await Order.findById(orderId).populate('shop');
    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    console.log("Current order status:", currentOrder.orderStatus);
    console.log("New order status:", orderStatus);
    console.log("Order total price:", currentOrder.totalPrice);
    console.log("Shop ID:", currentOrder.shop?._id);

    const updateData = { 
      orderStatus, 
      updatedAt: new Date() 
    };

    if (orderStatus === 'delivered') {
      updateData.deliveredAt = new Date();
      updateData['paymentInfo.paymentStatus'] = 'paid';
    } else if (orderStatus === 'refunded') {
      updateData.refundedAt = new Date();
      updateData['paymentInfo.paymentStatus'] = 'refunded';
    }

    // Update the order first
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('user', 'name email')
     .populate('shop', 'name')
     .populate('items.product', 'name images');

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Handle balance updates
    const wasDeliveredOrReceived = ['delivered', 'received'].includes(currentOrder.orderStatus);
    const isNowDeliveredOrReceived = ['delivered', 'received'].includes(orderStatus);
    const isRefunded = orderStatus === 'refunded';

    console.log("Was delivered/received:", wasDeliveredOrReceived);
    console.log("Is now delivered/received:", isNowDeliveredOrReceived);
    console.log("Is refunded:", isRefunded);

    // Calculate balance change and create transaction
    let balanceUpdate = 0;
    let transactionData = null;

    if (isNowDeliveredOrReceived && !wasDeliveredOrReceived) {
      // Order just became delivered/received - add to balance
      balanceUpdate = updatedOrder.totalPrice;
      transactionData = {
        amount: updatedOrder.totalPrice,
        status: "Completed",
        type: "order_payment",
        orderId: updatedOrder._id,
        description: `Payment for order #${updatedOrder._id}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log("Adding to balance:", balanceUpdate);
    } else if (isRefunded && wasDeliveredOrReceived) {
      // Order was delivered but now refunded - subtract from balance
      balanceUpdate = -updatedOrder.totalPrice;
      transactionData = {
        amount: -updatedOrder.totalPrice,
        status: "Completed",
        type: "refund",
        orderId: updatedOrder._id,
        description: `Refund for order #${updatedOrder._id}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log("Subtracting from balance:", balanceUpdate);
    }

    // Update shop balance if there's a change
    if (balanceUpdate !== 0 && currentOrder.shop?._id) {
      console.log("Updating shop balance by:", balanceUpdate);
      
      const updateQuery = {
        $inc: { availableBalance: balanceUpdate }
      };

      if (transactionData) {
        updateQuery.$push = { transactions: transactionData };
      }

      console.log("Shop update query:", JSON.stringify(updateQuery, null, 2));

      const shopUpdateResult = await Shop.findByIdAndUpdate(
        currentOrder.shop._id, 
        updateQuery,
        { new: true } // Return updated document
      );

      console.log("Shop update result:", shopUpdateResult);

      if (!shopUpdateResult) {
        console.error("Failed to find shop with ID:", currentOrder.shop._id);
        return res.status(400).json({
          success: false,
          message: "Failed to update shop balance - shop not found"
        });
      }

      console.log("Shop balance updated successfully. New balance:", shopUpdateResult.availableBalance);
    } else {
      console.log("No balance update needed");
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder
    });

  } catch (error) {
    console.error("❌ Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message || "Something went wrong"
    });
  }
};
// Delete order
export const deleteOrderController = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required"
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Only allow deletion of cancelled or processing orders
    if (!['cancelled', 'processing'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Only cancelled or processing orders can be deleted"
      });
    }

    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
      success: true,
      message: "Order deleted successfully"
    });

  } catch (error) {
    console.error("❌ Delete order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    });
  }
};

// Cancel order
export const cancelOrderController = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required"
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled', 'refunded'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.orderStatus}`
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        orderStatus: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('user', 'name email')
     .populate('shop', 'name')
     .populate('items.product', 'name images');

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: updatedOrder
    });

  } catch (error) {
    console.error("❌ Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    });
  }
};

// order refund
export const orderRefundController = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { shopId } = req.params; 

    const findOrder = await Order.findById(orderId);
    
    if (!findOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if order can be refunded
    if (findOrder.orderStatus !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: "Only delivered orders can be refunded"
      });
    }

    // Check if already has a refund request or is refunded
    if (findOrder.orderStatus === 'refunded' || findOrder.orderStatus === 'refund request') {
      return res.status(400).json({
        success: false,
        message: findOrder.orderStatus === 'refunded' 
          ? "Order is already refunded" 
          : "Refund request already submitted"
      });
    }

    // Set status to "refund request" initially - admin will process later
    findOrder.orderStatus = 'refund request';
    findOrder.refundRequestedAt = new Date();

    await findOrder.save();

    res.status(200).json({
      success: true,
      message: "Refund request submitted successfully",
      order: findOrder
    });

  } catch (error) {
    console.error('Refund request error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to submit refund request",
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    });
  }
};

export const processRefundController = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { action } = req.body; // 'approve' or 'reject'
    
    const findOrder = await Order.findById(orderId);
    
    if (!findOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (findOrder.orderStatus !== 'refund request') {
      return res.status(400).json({
        success: false,
        message: "No pending refund request for this order"
      });
    }

    if (action === 'approve') {
      // Find shop and process refund
      let findShop;
      if (findOrder.shop) {
        findShop = await Shop.findById(findOrder.shop);
      }

      if (findShop) {
        if (findShop.availableBalance < findOrder.totalPrice) {
          return res.status(400).json({
            success: false,
            message: "Insufficient shop balance for refund"
          });
        }
        findShop.availableBalance -= findOrder.totalPrice;
        await findShop.save();
      }

      findOrder.orderStatus = 'refunded';
      findOrder.refundedAt = new Date();
      
      res.json({
        success: true,
        message: "Refund processed successfully",
        order: findOrder
      });
    } else if (action === 'reject') {
      findOrder.orderStatus = 'delivered'; // Revert to delivered
      findOrder.refundRejectedAt = new Date();
      
      res.json({
        success: true,
        message: "Refund request rejected",
        order: findOrder
      });
    }

    await findOrder.save();

  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to process refund",
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    });
  }
};