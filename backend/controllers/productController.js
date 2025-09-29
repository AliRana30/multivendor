import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { Shop } from "../models/shop.js";
import usermodel from "../models/user.js";

export const productController = async (req, res) => {
  try {
    const { shopId, ...rest } = req.body;

    // Check if shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json("Shop Id is Invalid");
    }

    const imageUrls = req.files.map((file) => file.filename);
    const productData = {
      ...rest,
      shopId,
      shop: shop.name,
      shopLogo: shop.avatar?.url || "",
      images: imageUrls,
    };

    // Create the product
    const newProduct = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("❌ Product creation failed:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getproductController = async (req, res) => {
  try {
    const products = await Product.find({ shopId: req.params.id }).populate(
      "shop"
    );

    res.status(201).json({
      success: true,
      message: "Products Found",
      products,
    });
  } catch (error) {
    console.error("❌ Products Not Found:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllProductsController = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("shop", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All Products Retrieved",
      products,
      count: products.length,
    });
  } catch (error) {
    console.error("❌ Failed to get all products:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteController = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product Deleted",
    });
  } catch (error) {
    console.error("❌ Can't delete product", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProductStockController = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityToReduce } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!quantityToReduce || quantityToReduce <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < quantityToReduce) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantityToReduce}`,
      });
    }

    product.stock -= quantityToReduce;
    product.sold_out += quantityToReduce;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product stock updated successfully",
      product: {
        _id: product._id,
        name: product.name,
        stock: product.stock,
        sold_out: product.sold_out,
      },
    });
  } catch (error) {
    console.error("Error updating product stock:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createReview = async (req, res) => {
  try {
    const { rating, comment, user } = req.body;
    const { id } = req.params;

    let userId;
    if (typeof user === 'string') {
      userId = user;
    } else if (user && user._id) {
      userId = user._id;
    } else if (req.user && req.user.id) {
      userId = req.user.id;
    } else {
      return res.status(400).json({
        success: false,
        message: "User ID not provided or invalid format",
      });
    }
    
    const userDetails = await usermodel.findById(userId);
    
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if product exists
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingReview = product.reviews.find(
      review => review.userId && review.userId.toString() === userId.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Check if user has purchased this product and it's delivered

    const userOrders = await Order.find({
      user: userId, 
      orderStatus: "delivered",
      "items.product": id, 
    });

    if (userOrders.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You can only review products you have purchased and received",
      });
    }
    const newReview = {
      user: userDetails.name, 
      userId: userId, 
      rating: Number(rating),
      comment: comment?.trim() || "",
      productId: id,
      createdAt: new Date(), 
    };

    product.reviews.push(newReview);

    // Calculate average rating
    const totalRating = product.reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    product.rating = totalRating / product.reviews.length;
    product.numOfReviews = product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      product: product,
      review: newReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Get all reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { id: productId } = req.params;

    const product = await Product.findById(productId).populate({
      path: "reviews.user",
      select: "name avatar",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const sortedReviews = product.reviews.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({
      success: true,
      reviews: sortedReviews,
      totalReviews: product.numOfReviews || 0,
      averageRating: product.rating || 0,
    });
  } catch (error) {
    console.error("Get product reviews error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  const { rating, comment } = req.body;
  const { id: reviewId } = req.params;
  const userId = req.user.id;

  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 1 and 5",
    });
  }

  const product = await Product.findOne({ "reviews._id": reviewId });
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  const review = product.reviews.id(reviewId);
  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  if (review.user.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "You can only update your own reviews",
    });
  }

  if (rating) review.rating = Number(rating);
  if (comment !== undefined) review.comment = comment.trim();
  review.updatedAt = new Date();

  const totalRating = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
  product.rating = totalRating / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    review: review,
    product: product,
  });
};
