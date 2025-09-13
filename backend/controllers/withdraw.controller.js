import { Order } from "../models/order.js";
import { Shop } from "../models/shop.js"
import WithDraw from "../models/withdraw.js";
import { sendmail } from "../utils/sendMail.js";

export const withdrawRequestController = async (req, res) => {
  try {
    const { amount, bankAccount } = req.body;

    if (!amount || !bankAccount) {
      return res.status(400).json({
        success: false,
        message: "Amount and bank account are required."
      });
    }

    const seller = await Shop.findById(req.seller._id);
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found."
      });
    }

    const orders = await Order.find({ 
      shop: seller._id,
      orderStatus: 'delivered' 
    });

    const totalEarnings = orders.reduce((total, order) => {
      return total + (order.totalPrice || 0);
    }, 0);

    const previousWithdrawals = await WithDraw.find({
      'seller._id': seller._id,
      status: { $in: ['Processing', 'Completed'] }
    });

    const totalPreviousWithdrawals = previousWithdrawals.reduce((total, withdrawal) => {
      return total + (withdrawal.amount || 0);
    }, 0);

    const availableBalance = totalEarnings - totalPreviousWithdrawals;

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: $ ${availableBalance.toFixed(2)}`
      });
    }

    const withdrawalRequest = new WithDraw({
      seller: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        shopName: seller.name
      },
      amount: parseFloat(amount),
      bankAccount: {
        bankName: bankAccount.bankName,
        accountHolderName: bankAccount.accountHolderName,
        accountNumber: bankAccount.accountNumber
      },
      status: 'Processing'
    });

    await withdrawalRequest.save();

    // Update seller's available balance
    seller.availableBalance = availableBalance - parseFloat(amount);
    await seller.save();

    // Send confirmation email
    try {
      await sendmail({
        email: seller.email, 
        subject: "Withdrawal Request Confirmation",
        message: `Hello ${seller.name},

Your withdrawal request has been submitted successfully.

Withdrawal Details:
- Amount: $ ${parseFloat(amount).toFixed(2)}
- Bank: ${bankAccount.bankName}
- Account Holder: ${bankAccount.accountHolderName}
- Account Number: ${bankAccount.accountNumber}
- Status: Processing
- Request ID: ${withdrawalRequest._id}

Your request will be processed within 3-7 business days. You will receive another email once the transfer is completed.

If you have any questions, please contact our support team.

Best regards,
MultiMart Team`
      });
      
      console.log(`Withdrawal confirmation email sent to ${seller.email}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Withdrawal request submitted successfully. Confirmation email has been sent.",
      withdrawalRequest,
      availableBalance: availableBalance - parseFloat(amount),
      totalEarnings: totalEarnings,
      previousWithdrawals: totalPreviousWithdrawals
    });

  } catch (error) {
    console.error('Withdrawal request error:', error);
    return res.status(500).json({
      success: false,
      message: "Withdrawal request failed.",
      error: error.message
    });
  }
};

export const rejectWithdrawalRequest = async (req, res) => {
  try {
    const { withdrawalId, reason } = req.body;

    if (!withdrawalId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Withdrawal ID and rejection reason are required."
      });
    }

    const withdrawalRequest = await WithDraw.findById(withdrawalId);
    
    if (!withdrawalRequest) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal request not found."
      });
    }

    if (withdrawalRequest.status !== 'Processing') {
      return res.status(400).json({
        success: false,
        message: "This withdrawal request has already been processed."
      });
    }

    withdrawalRequest.status = 'Rejected';
    withdrawalRequest.updatedAt = new Date();
    withdrawalRequest.rejectionReason = reason;
    await withdrawalRequest.save();

    const seller = await Shop.findById(withdrawalRequest.seller._id);
    if (seller) {
      seller.availableBalance = (seller.availableBalance || 0) + withdrawalRequest.amount;
      await seller.save();
    }

    try {
      await sendmail({
        email: withdrawalRequest.seller.email, 
        subject: "Withdrawal Request - Action Required",
        message: `Hello ${withdrawalRequest.seller.name},

We regret to inform you that your withdrawal request has been declined for the following reason:

Withdrawal Details:
- Amount: US$ ${withdrawalRequest.amount.toFixed(2)}
- Bank: ${withdrawalRequest.bankAccount.bankName}
- Account Holder: ${withdrawalRequest.bankAccount.accountHolderName}
- Status: Rejected
- Request ID: ${withdrawalRequest._id}
- Processed On: ${new Date().toLocaleString()}

Reason for Rejection:
${reason}

The requested amount has been restored to your available balance. You can submit a new withdrawal request after addressing the above concerns.

If you have any questions or need clarification, please contact our support team.

Best regards,
MultiMart Team`
      });
      
      console.log(`Withdrawal rejection email sent to ${withdrawalRequest.seller.email}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Withdrawal request rejected successfully. Seller has been notified."
    });

  } catch (error) {
    console.error('Error rejecting withdrawal request:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject withdrawal request.",
      error: error.message
    });
  }
};

export const getAllWithdrawalRequests = async (req, res) => {
  try {
    const withdrawalRequests = await WithDraw.find({})
      .sort({ createdAt: -1 }); 

    return res.status(200).json({
      success: true,
      withdrawalRequests
    });

  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch withdrawal requests",
      error: error.message
    });
  }
};

export const acceptWithdrawalRequest = async (req, res) => {
  try {
    const { withdrawalId } = req.body;

    if (!withdrawalId) {
      return res.status(400).json({
        success: false,
        message: "Withdrawal ID is required."
      });
    }

    const withdrawalRequest = await WithDraw.findById(withdrawalId);
    
    if (!withdrawalRequest) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal request not found."
      });
    }

    if (withdrawalRequest.status !== 'Processing') {
      return res.status(400).json({
        success: false,
        message: "This withdrawal request has already been processed."
      });
    }

    // Get shop from the withdrawal request
    const shopId = withdrawalRequest.seller._id;
    const amount = withdrawalRequest.amount;

    const shop = await Shop.findById(shopId);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found."
      });
    }

    // Update the withdrawal request status
    withdrawalRequest.status = 'Completed';
    withdrawalRequest.updatedAt = new Date();
    await withdrawalRequest.save();

    const adminCommission = amount * 0.1;

    let admin = await WithDraw.findOne({ 
      'seller.type': 'admin'
    });
    
    if (!admin) {
      admin = new WithDraw({
        seller: { 
          type: 'admin',
          name: 'Admin Revenue'
        },
        amount: 0,
        status: 'admin-tracking'
      });
    }
    
    const currentRevenue = admin.amount || 0;
    admin.amount = currentRevenue + adminCommission;
    admin.updatedAt = new Date();
    await admin.save();

    try {
      const bankDetails = withdrawalRequest.bankAccount || {};
      
      let bankInfo = '';
      if (bankDetails.bankName || bankDetails.accountHolderName || bankDetails.accountNumber) {
        bankInfo = `Bank Details:`;
        if (bankDetails.bankName) bankInfo += `\n- Bank: ${bankDetails.bankName}`;
        if (bankDetails.accountHolderName) bankInfo += `\n- Account Holder: ${bankDetails.accountHolderName}`;
        if (bankDetails.accountNumber) bankInfo += `\n- Account Number: ${bankDetails.accountNumber}`;
      }
      
      await sendmail({
        email: withdrawalRequest.seller.email, 
        subject: "Withdrawal Request Approved - Payment Processed",
        message: `Hello ${withdrawalRequest.seller.name},

Great news! Your withdrawal request has been approved and processed.

Withdrawal Details:
- Amount: $${amount.toFixed(2)}
- Status: Completed
- Request ID: ${withdrawalRequest._id}
- Processed On: ${new Date().toLocaleString()}${bankInfo}

The payment has been transferred to your bank account and should reflect within 1-3 business days depending on your bank's processing time.

Thank you for being a valued seller on our platform!

Best regards,
MultiMart Team`
      });
      
      console.log(`Withdrawal approval email sent to ${withdrawalRequest.seller.email}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Withdrawal request accepted successfully. Payment processed and seller notified.",
      adminRevenue: admin.amount,
      adminCommission: adminCommission,
      processedAmount: amount
    });

  } catch (error) {
    console.error('Error accepting withdrawal request:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to accept withdrawal request.",
      error: error.message
    });
  }
};