import mongoose from "mongoose";

const coupounCodeSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,"Please enter your coupoun code name!"],
        unique: true,
    },
    value:{
        type: Number,
        required: true,
    },
    minAmount:{
        type: Number,
    },
    maxAmount:{
        type: Number,
    },
    shopId:{
     type: String,
     required: true,
    },
    selectedProduct:{
     type: String,
    },
    category:{
     type: String,
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    }
});
export const Coupon = mongoose.model("Coupon", coupounCodeSchema);