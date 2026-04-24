import mongoose from "mongoose";

const mongodb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MONGO connected successfully");
    } catch (error) {
        console.error("❌ MONGO connection failed:", error.message);
        // Don't exit process here, but log it clearly
    }
};

export default mongodb