import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            },
            discountPrice: {
                type: Number,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            images: [{
                url: String
            }]
        }
    ],
    shippingAddress: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String
        },
        country: {
            type: String
        },
        zipCode: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String
        }
    },
    paymentInfo: {
        paymentMethod: {
            type: String,
            required: true,
            enum: ['card', 'cod', 'paypal'],
            default: 'cod'
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending'
        },
        transactionId: {
            type: String
        },
        cardNumber: {
            type: String
        },
        cardHolderName: {
            type: String
        },
        expiryDate: {
            type: String
        },
        cvv: {
            type: String
        }
    },
    coupon: {
        code: {
            type: String
        },
        discount: {
            type: Number,
            default: 0
        },
        discountPercent: {
            type: Number,
            default: 0
        }
    },
    subtotal: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    orderStatus: {
        type: String,
        enum: ["processing", "transferred to delivery partner", "shipping", "received", "on the way", "delivered", "cancelled", "refunded", "refund request"],
        default: "processing"
    },
    deliveredAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    },
    cancellationReason: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ shop: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ "paymentInfo.paymentStatus": 1 });

export const Order = mongoose.model("Order", OrderSchema);