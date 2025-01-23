import mongoose from "mongoose";
import { MONGO_URI } from "../env";

export const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("❌ MongoDB URI is not provided");
    }
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    } as any);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
