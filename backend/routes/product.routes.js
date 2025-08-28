import express from 'express'
import { createReview, deleteController, getAllProductsController, getproductController, getProductReviews, productController, updateProductStockController, updateReview } from '../controllers/product.controller.js'
import { upload } from '../multer.js'
import { isAuthenticated, isSeller } from '../middlewares/auth.js'

export const productRouter = express.Router()

productRouter.post('/create-product',upload.array("images"),productController)
productRouter.get('/all-products', getAllProductsController); // Get all products from all sellers
productRouter.get('/all-products/:id', getproductController);
productRouter.delete('/delete-product/:id',isSeller,deleteController)
productRouter.put('/update-product-stock/:id',isSeller,updateProductStockController)
productRouter.post('/create-review/:id',isAuthenticated,createReview)
productRouter.get('/product-reviews/:id',isAuthenticated,getProductReviews)
productRouter.put('/update-review/:id',isAuthenticated,updateReview)




