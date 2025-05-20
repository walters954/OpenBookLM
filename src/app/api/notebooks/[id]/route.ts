import { NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";

// Helper function to check notebook access
async function hasNotebookAccess(notebookId: string, userId: string) {
    // In local development mode, allow access to all notebooks
    return true;
}

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getOrCreateUser();

        // In local development mode, we allow access to all notebooks
        const notebook = await prisma.notebook.findUnique({
            where: {
                id: params.id,
            },
            include: {
                sources: true,
                notes: true,
                user: true,
                sharedWith: true,
            },
        });

        if (!notebook) {
            return NextResponse.json(
                { error: "Notebook not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(notebook);
    } catch (error) {
        console.error("[NOTEBOOK_GET]", error);
        return NextResponse.json(
            { error: "Failed to load notebook" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getOrCreateUser();

        const redis = getRedisClient();
        if (!redis) {
            return new NextResponse("Redis connection failed", { status: 500 });
        }

        const notebook = await req.json();
        const key = `notebook:${user.id}:${params.id}`;
        await redis.set(key, JSON.stringify(notebook));
        await redis.expire(key, 60 * 60 * 24 * 7); // 7 days

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[NOTEBOOK_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getOrCreateUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // For updates, only allow the owner
        const notebook = await prisma.notebook.findUnique({
            where: {
                id: params.id,
                userId: user.id, // Must be the owner
            },
        });

        if (!notebook) {
            return NextResponse.json(
                {
                    error: "Notebook not found or you don't have permission to edit",
                },
                { status: 403 }
            );
        }

        const { title, content } = await req.json();

        // Validate the title
        if (!title || typeof title !== "string" || title.trim() === "") {
            return new NextResponse("Invalid title", { status: 400 });
        }

        // Update the notebook
        const updatedNotebook = await prisma.notebook.update({
            where: {
                id: params.id,
                userId: user.id, // Make sure the notebook belongs to the user
            },
            data: {
                title: title.trim(),
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(updatedNotebook);
    } catch (error) {
        console.error("[NOTEBOOK_PATCH]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
