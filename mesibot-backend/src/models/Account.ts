import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  avatarURI: String
});

export const User = mongoose.model("User", UserSchema);
