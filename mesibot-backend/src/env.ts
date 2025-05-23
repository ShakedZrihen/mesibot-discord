import dotenv from "dotenv";

dotenv.config();

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
export const CLIENT_ID = process.env.DISCORD_APP_ID;
export const MONGO_URI = process.env.MONGO_URI;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const YOUTUBE_EMAIL = process.env.YOUTUBE_EMAIL;
export const YOUTUBE_PASSWORD = process.env.YOUTUBE_PASSWORD;
export const PROXY_USERNAME = process.env.PROXY_USERNAME;
export const PROXY_PASSWORD = process.env.PROXY_PASSWORD;
export const DJ_PASS = process.env.DJ_PASS;