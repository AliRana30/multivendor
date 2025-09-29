import jwt from "jsonwebtoken";
import usermodel from "../models/user.js";
import { Shop } from "../models/shop.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await usermodel.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


export const isSeller = async (req, res, next) => {
  try {
    const seller_token = req.cookies.seller_token;

    if (!seller_token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(seller_token, process.env.JWT_SECRET);

    const seller = await Shop.findById(decoded.id).select("-password");
    if (!seller) {
      return res.status(401).json({ message: "Seller not found" });
    }

    req.seller = seller;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const isAdmin = async (req,res,next) =>{
   try {
      const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await usermodel.findById(decoded.id).select("-password");
    if (user.role != 'admin') {
      return res.status(401).json({ message: "User not authenticated as Admin" });
    }

    next();
   } catch (error) {
     console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
   }
}

export const isUserOrSeller = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    const seller_token = req.cookies.seller_token;

    // Try seller authentication first
    if (seller_token) {
      try {
        const decoded = jwt.verify(seller_token, process.env.JWT_SECRET);
        const seller = await Shop.findById(decoded.id).select("-password");
        if (seller) {
          req.seller = seller;
          return next();
        }
      } catch (sellerError) {
        console.log("Seller token invalid, trying user token");
      }
    }

    // Try user authentication
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await usermodel.findById(decoded.id).select("-password");
        if (user) {
          req.user = user;
          return next();
        }
      } catch (userError) {
        console.log("User token invalid");
      }
    }

    return res.status(401).json({ message: "Unauthorized: No valid token provided" });
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
