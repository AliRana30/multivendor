import mongoose from "mongoose";

const mongodb = async () => {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        console.error("MONGO_URI is missing in .env file");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:");
        console.error(error.message);
        process.exit(1);
    }
};

export default mongodb;
