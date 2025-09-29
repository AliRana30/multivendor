import fs from "fs";
import { activationToken, authtoken } from "../utils/token.js";
import { sendmail } from "../utils/sendMail.js";
import bcrypt from 'bcryptjs'
import { Shop } from "../models/shop.js";

export const shopController = async (req, res) => {
  try {
    const { name, email, password, address, phoneNumber, zipCode } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Avatar (file) is required.",
      });
    }

    const filename = req.file.filename;
    const fileUrl = `uploads/${filename}`;

    const requiredFields = { name, email, password, address, phoneNumber, zipCode };
    for (const key in requiredFields) {
      if (!requiredFields[key]) {
        fs.unlink(`uploads/${filename}`, (err) => {
          if (err) console.error("File delete error:", err);
        });

        return res.status(400).json({
          success: false,
          message: `Missing required field: ${key}`,
        });
      }
    }

    const avatar = {
      url: fileUrl,
      public_id: filename,
    };

    const seller = {
      name,
      email,
      password,
      avatar,
      address,
      phoneNumber,
      zipCode,
    };

    const existingShops = await Shop.find({ email });

    if (existingShops.length === 0) {
      const token = activationToken(seller);
      const activationLink = `http://localhost:5173/seller/activation/${token}`;

      await sendmail({
        email,
        subject: "Activate Your Account",
        message: `Hello ${name}, click here to activate your shop account: ${activationLink}`,
      });

      return res.status(201).json({
        success: true,
        message: "Activation link sent to your email!",
      });
    } else {
      const newShop = new Shop(seller);
      await newShop.save();

      return res.status(201).json({
        success: true,
        message: "Shop created without activation as email already exists.",
        shop: newShop,
      });
    }
  } catch (error) {
    console.error("Shop creation error:", error.message);
    if (req.file?.filename) {
      fs.unlink(`uploads/${req.file.filename}`, (err) => {
        if (err) console.error("File delete error:", err);
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const ShopLoginController = async(req,res)=>{
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json("Both fields are required.");
    }

    const findUser = await Shop.findOne({ email }).select("+password");

    if (!findUser) {
      return res.status(404).json("User not found");
    }

    const matchPassword = await bcrypt.compare(password, findUser.password);

    if (!matchPassword) {
      return res.status(400).json("Password not matched");
    }

    const token = authtoken(findUser);

 res.cookie("seller_token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", 
  sameSite: "none",  
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",      
});


    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        name: findUser.name,
        email: findUser.email,
        avatar: findUser.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json("Login failed");
  }
};

export const ShopLogoutController = async (req, res) => {
  try {
    res.cookie("seller_token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(201).json({message : "Logout Successful"})
  } catch (error) {
    console.log(error.message);
  }
}

export const updateShopController = async (req, res) => {
   try {
      
      const { name, email, address, phoneNumber, zipCode } = req.body;
      const shopId = req.params.id;

      if (!shopId || !shopId.match(/^[0-9a-fA-F]{24}$/)) {
         return res.status(400).json({
            success: false,
            message: "Invalid shop ID format.",
         });
      }

      // Validation
      if (!name || !email || !address || !phoneNumber || !zipCode) {
         return res.status(400).json({
            success: false,
            message: "All fields are required.",
         });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
         return res.status(400).json({
            success: false,
            message: "Please enter a valid email address.",
         });
      }

      if (phoneNumber.toString().length < 10) {
         return res.status(400).json({
            success: false,
            message: "Phone number must be at least 10 digits.",
         });
      }

      const existingShop = await Shop.findById(shopId);
      if (!existingShop) {
         return res.status(404).json({
            success: false,
            message: "Shop not found.",
         });
      }

      if (email !== existingShop.email) {
         const emailExists = await Shop.findOne({ 
            email: email,
            _id: { $ne: shopId } 
         });
         if (emailExists) {
            return res.status(400).json({
               success: false,
               message: "Email is already registered with another shop.",
            });
         }
      }

      let updateData = {
         name,
         email,
         address,
         phoneNumber: Number(phoneNumber),
         zipCode: Number(zipCode),
      };


      console.log('Update data:', updateData);

      const updatedShop = await Shop.findByIdAndUpdate(
         shopId,
         updateData,
         { new: true, runValidators: true }
      );

      console.log('Shop updated successfully');

      return res.status(200).json({
         success: true,
         message: "Shop updated successfully.",
         shop: updatedShop,
      });
      
   } catch (error) {
      console.error("Error updating shop:", error);
      
      const avatarFile = req.files && req.files.avatar && req.files.avatar[0];
      if (avatarFile && avatarFile.path && fs.existsSync(avatarFile.path)) {
         fs.unlinkSync(avatarFile.path);
      }
      
      return res.status(500).json({
         success: false,
         message: error.message || "Internal server error",
      });
   }
};

export const updatePaymentMethodController = async (req, res) => {
  try {
    const { withdrawMethod } = req.body;

    if (!withdrawMethod || !withdrawMethod.bankName || !withdrawMethod.accountHolderName || 
        !withdrawMethod.accountNumber || !withdrawMethod.pin) {
      return res.status(400).json({
        success: false,
        message: "All bank account fields are required."
      });
    }

    // Validate PIN length
    if (withdrawMethod.pin.length !== 4) {
      return res.status(400).json({
        success: false,
        message: "PIN must be 4 digits."
      });
    }

    const seller = await Shop.findById(req.seller._id);
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found."
      });
    }

    if (!seller.withdrawMethods) {
      seller.withdrawMethods = [];
    }

    // Check if account number already exists in the array
    const existingAccount = seller.withdrawMethods.find(
      acc => acc.accountNumber === withdrawMethod.accountNumber
    );
    
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "This account number is already added."
      });
    }

    seller.withdrawMethods.push(withdrawMethod);
    seller.withdrawMethod = withdrawMethod;
    
    await seller.save();

    const { pin, ...safeWithdrawMethod } = withdrawMethod;

    return res.status(200).json({
      success: true,
      message: "Payment method added successfully.",
      withdrawMethod: safeWithdrawMethod,
      seller: {
        _id: seller._id,
        name: seller.name,
        withdrawMethods: seller.withdrawMethods.map(({ pin, ...method }) => method)
      }
    });

  } catch (error) {
    console.error('Update payment method error:', error);
    return res.status(500).json({
      success: false,
      message: "Payment method update failed.",
      error: error.message
    });
  }
};

export const deletePaymentMethodController = async (req, res) => {
  try {
    const { accountNumber } = req.body;

    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        message: "Account number is required."
      });
    }

    const seller = await Shop.findById(req.seller._id);
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found."
      });
    }

    if (!seller.withdrawMethods || seller.withdrawMethods.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No bank accounts found to delete."
      });
    }

    // Find the account to delete
    const accountIndex = seller.withdrawMethods.findIndex(
      acc => acc.accountNumber === accountNumber
    );
    
    if (accountIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Bank account not found."
      });
    }

    seller.withdrawMethods.splice(accountIndex, 1);

    if (seller.withdrawMethod && seller.withdrawMethod.accountNumber === accountNumber) {
      if (seller.withdrawMethods.length > 0) {
        seller.withdrawMethod = seller.withdrawMethods[0];
      } else {
        seller.withdrawMethod = undefined;
      }
    }
    
    await seller.save();

    return res.status(200).json({
      success: true,
      message: "Bank account deleted successfully.",
      seller: {
        _id: seller._id,
        name: seller.name,
        withdrawMethods: seller.withdrawMethods.map(({ pin, ...method }) => method),
        withdrawMethod: seller.withdrawMethod ? (() => {
          const { pin, ...safeMethod } = seller.withdrawMethod;
          return safeMethod;
        })() : null
      }
    });

  } catch (error) {
    console.error('Delete payment method error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete bank account.",
      error: error.message
    });
  }
};



