import express from "express";
import { upload } from "../multer.js";
import { activateSeller } from "../utils/token.js";
import { deletePaymentMethodController, shopController, ShopLoginController, ShopLogoutController, updatePaymentMethodController, updateShopController } from "../controllers/shopController.js";
import { isSeller } from "../middlewares/auth.js";

const shopRouter = express.Router();

shopRouter.post("/create-shop", upload.single("file"), shopController);
shopRouter.post("/shop-login",ShopLoginController);
shopRouter.put("/update-payment-method",isSeller,updatePaymentMethodController)
shopRouter.delete("/delete-payment-method", isSeller, deletePaymentMethodController);
shopRouter.get("/seller/activation/:token", activateSeller);
shopRouter.get("/shop-logout",ShopLogoutController);
shopRouter.get("/get-seller", isSeller, (req, res) => {
  res.json({ seller: req.seller }); 
});
shopRouter.put("/update-shop/:id", upload.fields([{ name: "avatar", maxCount: 1 }]), isSeller, updateShopController);

export default shopRouter;
