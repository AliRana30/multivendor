import "dotenv/config";
import express from "express"
import mongodb from "./utils/db.js"
import cookieParser from "cookie-parser";
import cors from "cors"
import bodyParser from 'body-parser'
import path from "path";
import { fileURLToPath } from "url";
import userRouter from "./routes/userRoutes.js";
import shopRouter from "./routes/shopRoutes.js";
import { productRouter } from "./routes/productRoutes.js";
import { eventRouter } from "./routes/eventRoutes.js";
import { couponRouter } from "./routes/couponRoutes.js";
import { orderRouter } from "./routes/orderRoutes.js";
import { conversationRoute } from "./routes/conversationRoutes.js";
import { messageRouter } from "./routes/messageRoutes.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { withdrawRouter } from "./routes/withdrawRoutes.js";

const app =express()

const corsOptions = {
     origin: "https://multimarts.vercel.app",
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
