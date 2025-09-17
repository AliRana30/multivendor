import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  tags: {
    type: String,
    required: true,
  },
  originalPrice: {
    type: Number,
  },
  discountPrice: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  reviews: [
    {
      user : {
        type: String,
        ref: "User",
        required: true
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String,
      },
      productId : {
        type: String,
      },
      createdAt :{
        type : Date,
        default : Date.now()
      }
    },
  ],

  shopId: {
    type: String,
    required: true,
  },
  shop: {
    type: String,
    required: true,
  },
  shopLogo: {
  type: String,
  required: true,
},

  sold_out: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export const Product = mongoose.model("Product", ProductSchema);
