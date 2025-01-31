import dotenv from "dotenv";

dotenv.config();

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
export const CLIENT_ID = process.env.DISCORD_APP_ID;
export const MONGO_URI = process.env.MONGO_URI;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;