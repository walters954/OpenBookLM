import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Get mock user
        const user = await getOrCreateUser();

        // Get the notebook to determine the provider
        const notebook = await prisma.notebook.findUnique({
            where: { id: params.id },
            select: { provider: true },
        });

        if (!notebook) {
            return new NextResponse("Notebook not found", { status: 404 });
        }

        // Handle multipart form data
        const formData = await req.formData();
        const files = formData.getAll("files");

        if (!files || files.length === 0) {
            return new NextResponse("No files provided", { status: 400 });
        }

        // Process each file
        for (const file of files) {
            if (!(file instanceof File)) {
                continue;
            }

            try {
                // Read file content
                const content = await file.text();

                // Create source record
                await prisma.source.create({
                    data: {
                        title: file.name,
                        content,
                        type: determineSourceType(file.name),
                        notebookId: params.id,
                    },
                });
            } catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
                // Continue with other files
            }
        }

        return new NextResponse("Files processed successfully", {
            status: 200,
        });
    } catch (error) {
        console.error("[SOURCES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// Helper function to determine source type
function determineSourceType(
    filename: string
): "PDF" | "MARKDOWN" | "TEXT" | "CODE" {
    const ext = filename.split(".").pop()?.toLowerCase();

    if (ext === "pdf") return "PDF";
    if (ext === "md") return "MARKDOWN";
    if (
        [
            "js",
            "ts",
            "py",
            "java",
            "c",
            "cpp",
            "cs",
            "go",
            "rb",
            "php",
        ].includes(ext || "")
    )
        return "CODE";

    return "TEXT";
}

// Get sources for a notebook
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getOrCreateUser();

        const sources = await prisma.source.findMany({
            where: {
                notebookId: params.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(sources);
    } catch (error: any) {
        console.error("[SOURCES_GET_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
