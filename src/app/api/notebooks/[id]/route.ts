import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const key = `notebook:${userId}:${params.id}`;
    const notebook = await redis.get(key);
    return NextResponse.json(notebook ? JSON.parse(notebook as string) : null);
  } catch (error) {
    console.error("[NOTEBOOK_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const key = `chat:${userId}:${params.id}`;
    await redis.set(key, JSON.stringify(body));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTEBOOK_PUT]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
