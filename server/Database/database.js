import mongoose from "mongoose";

const dbconnection = async () => {
    const MONGO_URL = process.env.MONGO_URL

    if (!MONGO_URL) {
        throw new Error("MONGO_URL environment variable is not configured")
    }

    await mongoose.connect(MONGO_URL)

    console.log("Database Connected Successfully...")
}

export default dbconnection