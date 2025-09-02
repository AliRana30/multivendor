import { Coupon } from "../models/coupon.js";

export const couponController = async (req, res) => {
  try {
    const { name } = req.body;

    const existingCoupon = await Coupon.findOne({ name });

    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon Code Already Exists" });
    }

    const coupon = await Coupon.create(req.body);

    res.status(201).json({
      message: "Coupon Code Created Successfully",
      coupon,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const getCouponController = async (req, res) => {
  try {
    const coupons = await Coupon.find({ shopId: req.params.id });

    res.status(201).json({
      success: true,
      message: "Coupon Found",
      coupons
    });
  } catch (error) {
    console.error("❌ Coupons Not Found:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCouponController = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon Not Found" });
    }

    res.status(200).json({
      success: true,
      message: "Coupon Deleted Successfully",
    });
  } catch (error) {
    console.error("❌ Error Deleting Coupon:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}