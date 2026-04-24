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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const corsOptions = {
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api", userRouter);
app.use("/api", shopRouter);
app.use("/api", productRouter);
app.use("/api", eventRouter);
app.use("/api", couponRouter);
app.use("/api", orderRouter);
app.use("/api", conversationRoute);
app.use("/api", messageRouter);
app.use("/api", adminRouter);
app.use("/api", withdrawRouter);

// Database connection and Server start
mongodb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`CORS enabled for: ${FRONTEND_URL}`);
    });
}).catch((err) => {
    console.error("Failed to connect to MongoDB. Server not started.", err);
    process.exit(1);
});