import mongoose from "mongoose";

const dbconnection = async () => {
    try {
        const MONGO_URL = process.env.MONGO_URL

        await mongoose.connect(MONGO_URL)

        console.log("Database Connected Successfully...")
    } catch (error) {
        console.log("Database Connection Failed:", error.message)
    }
}

export default dbconnection