import redis, { getRedisClient } from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const notebookId = url.searchParams.get("notebookId");
    if (!notebookId) {
      return new NextResponse("NotebookId is required", { status: 400 });
    }

    const key = `chat:${userId}:${notebookId}`;
    console.log("Fetching chat history for key:", key); // Debug log

    const redis = getRedisClient();
    if (!redis) {
      return new NextResponse("Redis connection failed", { status: 500 });
    }

    const history = await redis.get(key);
    console.log("Raw history from Redis:", history); // Debug log

    return NextResponse.json(history ? JSON.parse(history as string) : []);
  } catch (error) {
    console.error("[CHAT_HISTORY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { messages, notebookId } = await req.json();
    const key = `chat:${userId}:${notebookId}`;
    const redis = getRedisClient();
    if (!redis) {
      return new NextResponse("Redis connection failed", { status: 500 });
    }
    await redis.set(key, JSON.stringify(messages));
    await redis.expire(key, 60 * 60 * 24); // 24 hours

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CHAT_HISTORY_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
