import mongoose from "mongoose";

const mongodb = async()=>{
    try {
        mongoose.connect(process.env.MONGO_URI)
        console.log("MONGO connected")
    } catch (error) {
       console.log(error.message)   
    }
}

export default mongodb