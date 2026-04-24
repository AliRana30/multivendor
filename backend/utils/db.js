import mongoose from "mongoose";

const mongodb = async () => {
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
        console.error("❌ MONGO_URI is not defined in environment variables!");
        throw new Error("MONGO_URI is missing");
    }

    try {
        await mongoose.connect(uri);
        console.log("✅ MONGO connected successfully to Cluster");
    } catch (error) {
        console.error("❌ MONGO connection failed!");
        console.error("Error detail:", error.message);
        throw error; // Let the caller handle the crash
    }
};

export default mongodb