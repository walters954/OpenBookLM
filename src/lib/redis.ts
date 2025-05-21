import { Redis } from "ioredis";

// Lazy-loaded Redis client
let redis: Redis | null = null;

export function getRedisClient() {
    // During build time, always return null
    if (process.env.NODE_ENV === "development") {
        if (!process.env.REDIS_URL) {
            console.log("Redis URL not available in development mode");
            return null;
        }
    }

    if (!redis && process.env.REDIS_URL) {
        console.log("Initializing new Redis client");
        try {
            redis = new Redis(process.env.REDIS_URL);

            // Add event listeners for connection issues
            redis.on("error", (err) => {
                console.error("Redis connection error:", err);
            });

            redis.on("connect", () => {
                console.log("Redis client connected successfully");
            });

            redis.on("reconnecting", () => {
                console.log("Redis client reconnecting...");
            });
        } catch (error) {
            console.error("Failed to initialize Redis client:", error);
            return null;
        }
    }

    return redis;
}

// For testing the connection
export async function testRedisConnection() {
    const client = getRedisClient();
    if (!client) {
        console.log("No Redis client available to test");
        return false;
    }

    try {
        await client.ping();
        console.log("Redis connection test successful");
        return true;
    } catch (error) {
        console.error("Redis connection test failed:", error);
        return false;
    }
}

export default getRedisClient;
