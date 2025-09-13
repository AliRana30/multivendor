import "dotenv/config";
import express from "express"
import mongodb from "./utils/db.js"
import cookieParser from "cookie-parser";
import cors from "cors"
import bodyParser from 'body-parser'
import userRouter from "./routes/user.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import shopRouter from "./routes/shop.routes.js";
import { productRouter } from "./routes/product.routes.js";
import { eventRouter } from "./routes/event.routes.js";
import { couponRouter } from "./routes/coupon.routes.js";
import { orderRouter } from "./routes/order.routes.js";
import { conversationRoute } from "./routes/conversation.routes.js";
import { messageRouter } from "./routes/message.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { withdrawRouter } from "./routes/withdraw.routes.js";

const app =express()

const corsOptions = {
     origin: "http://localhost:5173",
    credentials: true,          
    methods: ["GET", "POST", "PUT", "DELETE"],
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(bodyParser.urlencoded({extended : true}))
app.use("/api",userRouter)
app.use("/api",shopRouter)
app.use("/api",productRouter)
app.use("/api",eventRouter)
app.use("/api",couponRouter)
app.use("/api",orderRouter)
app.use("/api",conversationRoute)
app.use("/api",messageRouter)
app.use("/api",adminRouter)
app.use("/api",withdrawRouter)


const PORT = 5000
app.listen(PORT , ()=>{
    mongodb();
    console.log(`Server is running on port http://localhost:${PORT}`)
})