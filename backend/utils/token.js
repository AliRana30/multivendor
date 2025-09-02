import jwt from "jsonwebtoken";
import usermodel from "../models/user.js";
import { Shop } from "../models/shop.js";

// Generate token
export const authtoken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

//shop token
export const activationToken = (user) => {
  if (typeof user !== "object" || user === null) {
    throw new Error("activationToken expects a plain object as payload");
  }
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const activateSeller = async (req, res) => {
  try {
    const token  = req.params.token;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { name, email, password, avatar, address, phoneNumber, zipCode } = decoded;

    // Check if already activated
    const existingShop = await Shop.findOne({ email });
    if (existingShop) {
      return res.status(400).json({
        success: false,
        message: "This shop is already activated.",
      });
    }

    const newShop = new Shop({
      name,
      email,
      password,
      avatar,
      address,
      phoneNumber,
      zipCode,
    });

    await newShop.save();

    res.status(201).json({
      success: true,
      message: "Shop activated successfully",
    });

  } catch (error) {
    console.error("Activation error:", error.message);
    res.status(500).json({ success: false, message: "Invalid or expired activation token" });
  }
};

export const useractivation = async (req, res) => {
  try {
    const token = req.params.token;
    const newUser = jwt.verify(token, process.env.JWT_SECRET);

    if (!newUser) {
      return res.status(400).json("Invalid or expired token");
    }

    const { name, email, password, avatar } = newUser;

    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
      return res.status(400).json("User already exists");
    }

    const user = new usermodel({
      name,
      email,
      password,
      avatar,
    });

    await user.save(); 

    res.status(201).json({
      success: true,
      message: "Account activated successfully",
    });

  } catch (error) {
    console.error("Activation error:", error.message);
    res.status(500).json("Activation failed");
  }
};
