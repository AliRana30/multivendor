import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { Shop } from "../models/shop.js";
import { Event } from "../models/event.js";
import usermodel from "../models/user.js";
import WithDraw from "../models/withdraw.js";

export const getAllOrdersAdminController = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
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
      .sort({ deliveredAt: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      message: finalShopId ? "Shop orders retrieved successfully" : "Orders retrieved successfully",
      orders: orders,
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

export const getAllSellersAdminController = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      search 
    } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const sellers = await Shop.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalSellers = await Shop.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Sellers retrieved successfully",
      adminsellers: sellers, 
      totalCount: totalSellers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalSellers / limit),
        totalSellers,
        hasNextPage: page < Math.ceil(totalSellers / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error("❌ Get all sellers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve sellers",
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    });
  }
};

export const getAllUsersAdminController = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      search 
    } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const users = await usermodel.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalUsers = await usermodel.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      adminusers: users,
      totalCount: totalUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNextPage: page < Math.ceil(totalUsers / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error("❌ Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    });
  }
};

export const getAllProductsAdminController = async (req,res)=>{
   try {

      const { 
      page = 1, 
      limit = 50, 
    } = req.query;

     const products = await Product.find().sort({createdAt : -1})

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      adminproducts: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(products / limit),
        hasNextPage: page < Math.ceil(products / limit),
        hasPrevPage: page > 1
      }
    });
     
   } catch (error) {
       console.error("❌ Delete Product error:", error);
     res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    });
   }
}

export const getAllEventsAdminController = async (req,res)=>{
   try {

    const { 
      page = 1, 
      limit = 50, 
    } = req.query;

     const events = await Event.find().sort({createdAt : -1})

    res.status(200).json({
      success: true,
      message: "Eventes retrieved successfully",
      adminevents: events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(events / limit),
        hasNextPage: page < Math.ceil(events / limit),
        hasPrevPage: page > 1
      }
    });
     
   } catch (error) {
       console.error("❌ Delete Event error:", error);
     res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    });
   }
}

export const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params; 
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    const user = await usermodel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    if (req.user && (req.user.id === id || req.user._id.toString() === id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
    }
    
    if (user.role === 'admin' && req.user && req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: "Admins cannot delete other admin accounts"
      });
    }
    
    await usermodel.findByIdAndDelete(id);
    
    console.log(`User ${user.name} (${user.email}) deleted successfully`);
    
    res.status(200).json({
      success: true,
      message: `User ${user.name} deleted successfully`
    });
    
  } catch (error) {
    console.error("❌ Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    });
  }
};

export const deleteShopController = async (req, res) => {
  try {
    const { id } = req.params; 
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }
    
    const shop = await Shop.findById(id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found"
      });
    }
    
    if (req.shop && (req.shop.id === id || req.shop._id.toString() === id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own shop"
      });
    }
    
    await Shop.findByIdAndDelete(id);
    
    console.log(`User ${shop.name} (${shop.email}) deleted successfully`);
    
    res.status(200).json({
      success: true,
      message: `Shop ${shop.name} deleted successfully`
    });
    
  } catch (error) {
    console.error("❌ Delete shop error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete shop",
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    });
  }
};

export const getAdminRevenue = async (req, res) => {
  try {
    const completedWithdrawals = await WithDraw.find({ status: 'Completed' });
    const withdrawalCommission = completedWithdrawals.reduce((total, withdrawal) => {
      return total + (withdrawal.amount * 0.1); // 10% commission
    }, 0);

    const deliveredOrders = await Order.find({ orderStatus: 'delivered' });
    const orderCommission = deliveredOrders.reduce((total, order) => {
      return total + (order.totalPrice * 0.1); // 10% commission
    }, 0);

    const totalRevenue = orderCommission + withdrawalCommission;

    const totalWithdrawals = await WithDraw.countDocuments();
    const processingWithdrawals = await WithDraw.countDocuments({ status: 'Processing' });
    const completedWithdrawalsCount = await WithDraw.countDocuments({ status: 'Completed' });
    const rejectedWithdrawals = await WithDraw.countDocuments({ status: 'Rejected' });

    return res.status(200).json({
      success: true,
      totalRevenue,
      orderCommission,
      withdrawalCommission,
      statistics: {
        totalWithdrawals,
        processingWithdrawals,
        completedWithdrawals: completedWithdrawalsCount,
        rejectedWithdrawals
      },
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('Error fetching admin revenue:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin revenue.",
      error: error.message
    });
  }
};