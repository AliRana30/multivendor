import path from "path";
import { sendmail } from "../utils/sendMail.js";
import { activationToken, authtoken } from "../utils/token.js";
import bcrypt from "bcryptjs";
import fs from 'fs'
import usermodel from "../models/user.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Check file upload
    const filename = req.file?.filename;
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const filePath = `/uploads/${filename}`;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new usermodel({
      name,
      email,
      password: hashedPassword,
      avatar: {
        public_id: filename,
        url: filePath,
      },
    });
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role || "user",
      },
    });

  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Can't create user. Please try again.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Both email and password are required.",
      });
    }

    // Find user and include password
    const user = await usermodel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare passwords properly
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate authentication token
    const token = authtoken(user);

    // Set cookie for 7 days
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // set to false if testing locally without HTTPS
      sameSite: "none", // change to "lax" if same-origin
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role || "user",
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};


export const logout = async (req, res) => {
  try {
   res.clearCookie("token", {
  httpOnly: true,
  secure: true,
  sameSite: "none",
});

    res.status(201).json({message : "Logout Successful"})
  } catch (error) {
    console.log(error.message);
  }
};

// update userinf
export const updateUserInfo = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, addresses } = req.body;
    
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const user = await usermodel.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (password) {
      // Hash the new password before saving
      const saltRounds = 10;
      user.password = await bcrypt.hash(password, saltRounds);
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    
    if (addresses && Array.isArray(addresses)) {
      user.addresses = addresses;
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      user: userResponse,
      message: "User information updated successfully"
    });

  } catch (error) {
    console.error("Update user info error:", error);
    
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errorMessages
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update user information"
    });
  }
};

// update avatar
export const updateUserAvatar = async (req, res) => {
  try {
    console.log('=== Avatar Update Request ===');
    console.log('User ID:', req.user?._id);
    console.log('File:', req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const userExists = await usermodel.findById(req.user._id);
    
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Delete old avatar if it exists
    if (userExists.avatar && userExists.avatar.url) {
      const oldAvatarPath = path.join(process.cwd(), 'uploads', userExists.avatar.url);
      try {
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
          console.log('Old avatar deleted:', oldAvatarPath);
        }
      } catch (deleteError) {
        console.warn('Failed to delete old avatar:', deleteError.message);
      }
    }

    const fileUrl = req.file.filename;
    console.log('New file URL:', fileUrl);

    const user = await usermodel.findByIdAndUpdate(
      req.user._id,
      {
        avatar: {
          url: fileUrl,
          public_id: req.file.filename
        }
      },
      { new: true }
    ).select('-password'); 

    console.log('Updated user avatar:', user.avatar);

    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      user
    });

  } catch (error) {
    console.error('Avatar update error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      try {
        const uploadedFilePath = path.join(process.cwd(), 'uploads', req.file.filename);
        if (fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file:', cleanupError.message);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// add User Address
export const addUserAddress = async (req, res, next) => {
  try {
    const user = await usermodel.findById(req.user.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const {
      country,
      countryCode,
      state,
      stateCode,
      city,
      address1,
      address2,
      zipCode,
      addressType
    } = req.body;

    if (!country || !city || !address1) {
      return next(new ErrorHandler("Country, city, and address1 are required", 400));
    }

    const isFirstAddress = !user.addresses || user.addresses.length === 0;

    const newAddress = {
      country,
      countryCode,
      state,
      stateCode,
      city,
      address1,
      address2,
      zipCode: zipCode ? Number(zipCode) : undefined,
      addressType: addressType || 'home',
      address: address1, 
      isDefault: isFirstAddress
    };

    if (req.body.isDefault === true) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      user
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// delete User Address
export const deleteUserAddress = async (req, res, next) => {
  try {
    const user = await usermodel.findById(req.user.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const addressId = req.params.id;
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return next(new ErrorHandler("Address not found", 404));
    }

    const deletedAddress = user.addresses[addressIndex];
    const wasDefault = deletedAddress.isDefault;

    user.addresses.splice(addressIndex, 1);


    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      user
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// update password
export const updateUserPassword = async (req, res) => {
  try {
     const user = await usermodel.findById(req.user.id).select("+password");
     const matchPassword = await bcrypt.compare(req.body.oldPassword, user.password);
     if (!matchPassword) {
       return res.status(400).json({ success: false, message: "Old password is incorrect" });
     }

     if(req.body.newPassword !== req.body.confirmNewPassword) {
       return res.status(400).json({ success: false, message: "New password and confirmation do not match" });
     }
     user.password = await bcrypt.hash(req.body.newPassword, 10);
     await user.save();

     res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

}





