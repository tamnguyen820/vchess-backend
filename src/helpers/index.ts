import crypto from "crypto";
import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

// Auth
const SECRET = process.env.SECRET;
export const getHash = (salt: string, password: string): string => {
  return crypto
    .createHmac("sha256", [salt, password].join("/"))
    .update(SECRET)
    .digest("hex");
};
export const random = () => crypto.randomBytes(128).toString("base64");

// Cache
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";
export const redisClient = createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
  password: REDIS_PASSWORD,
});
redisClient.on("error", (error) => {
  console.error("Redis client error: ", error);
});
redisClient.on("connect", () => {
  console.log("Redis client connected");
});
redisClient.connect().catch(console.error);
