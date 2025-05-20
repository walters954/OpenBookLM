import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";

export async function GET() {
    try {
        console.log("[NOTEBOOKS_GET] Starting notebooks retrieval");

        // Use the mock user from auth.ts
        const user = await getOrCreateUser();
        console.log("[NOTEBOOKS_GET] Using user:", user);

        console.log("[NOTEBOOKS_GET] Fetching notebooks for user:", user.id);
        const notebooks = await prisma.notebook.findMany({
            where: {
                userId: user.id,
            },
            include: {
                chats: true,
                sources: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        console.log("[NOTEBOOKS_GET] Found notebooks:", notebooks.length);
        return NextResponse.json(notebooks);
    } catch (error: any) {
        console.error("[NOTEBOOKS_GET]", error);
        return new NextResponse(`Internal Error: ${error.message}`, {
            status: 500,
        });
    }
}

export async function POST(req: Request) {
    try {
        console.log("[NOTEBOOKS_POST] Starting notebook creation");

        // Use the mock user from auth.ts
        const user = await getOrCreateUser();
        console.log("[NOTEBOOKS_POST] Using user:", user);

        // Parse request body
        let body;
        try {
            body = await req.json();
            console.log("[NOTEBOOKS_POST] Request body:", body);
        } catch (e) {
            console.error("[NOTEBOOKS_POST] Failed to parse request body:", e);
            return new NextResponse("Invalid request body", { status: 400 });
        }

        const { title, provider } = body;

        if (!title) {
            console.error("[NOTEBOOKS_POST] Missing title in request");
            return new NextResponse("Title is required", { status: 400 });
        }

        console.log(
            "[NOTEBOOKS_POST] Creating notebook with title:",
            title,
            "provider:",
            provider
        );

        try {
            const notebook = await prisma.notebook.create({
                data: {
                    title,
                    userId: user.id,
                    content: "",
                    provider: provider || "openai", // Default to openai if not specified
                },
            });

            console.log(
                "[NOTEBOOKS_POST] Notebook created successfully:",
                notebook
            );
            return NextResponse.json(notebook);
        } catch (dbError: any) {
            console.error("[NOTEBOOKS_POST] Database error:", dbError);
            return new NextResponse(`Database Error: ${dbError.message}`, {
                status: 500,
            });
        }
    } catch (error: any) {
        console.error("[NOTEBOOKS_POST] Unexpected error:", error);
        return new NextResponse(`Internal Error: ${error.message}`, {
            status: 500,
        });
    }
}
