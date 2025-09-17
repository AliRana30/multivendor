import express from 'express'
import { getAllOrdersAdminController, getAllSellersAdminController, getAllUsersAdminController ,deleteUserController, deleteShopController, getAllProductsAdminController, getAllEventsAdminController, getAdminRevenue} from '../controllers/adminController.js'
import { isAdmin } from '../middlewares/auth.js'

export const adminRouter = express.Router()

adminRouter.get("/admin-all-orders",isAdmin,getAllOrdersAdminController)
adminRouter.get("/admin-all-sellers",isAdmin,getAllSellersAdminController)
adminRouter.get("/admin-all-users",isAdmin,getAllUsersAdminController)
adminRouter.get("/admin-all-products",isAdmin,getAllProductsAdminController)
adminRouter.get("/admin-all-events",isAdmin,getAllEventsAdminController)
adminRouter.get("/admin-revenue",isAdmin,getAdminRevenue)

adminRouter.delete("/delete-user/:id",isAdmin,deleteUserController)
adminRouter.delete("/delete-shop/:id",isAdmin,deleteShopController)




