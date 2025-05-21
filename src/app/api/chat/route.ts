import { getRedisClient } from "@/lib/redis";
import { NextResponse } from "next/server";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import { setChatHistory } from "@/lib/redis-utils";
import { prisma } from "@/lib/db";
import { DEFAULT_MODEL, MODEL_SETTINGS } from "@/lib/ai-config";
import { getOrCreateUser } from "@/lib/auth";
import { createMockStream } from "@/lib/mock-stream";

const getClient = () => {
    if (!process.env.CEREBRAS_API_KEY) {
        throw new Error("Missing CEREBRAS_API_KEY environment variable");
    }
    return new Cerebras({
        apiKey: process.env.CEREBRAS_API_KEY,
    });
};

interface ResponseChunk {
    choices?: Array<{
        finish_reason?: string;
        message?: {
            content: string;
        };
        delta?: {
            content: string;
        };
    }>;
}

interface Source {
    title: string;
    content: string;
}

interface ErrorWithCode extends Error {
    error?: {
        code?: string;
    };
}

// Create a mock response for the demo when Cerebras isn't configured
function createMockResponse() {
    return {
        choices: [
            {
                message: {
                    content:
                        "This is a mock response for demonstration purposes. The OpenBookLM demo is running in development mode without API keys configured.",
                },
            },
        ],
    };
}

export async function POST(req: Request) {
    try {
        // For demo purposes, we'll skip authentication
        const user = await getOrCreateUser();

        const body = await req.json();
        const { messages, notebookId, stream = false } = body;

        console.log("Received chat request:", {
            notebookId,
            messageCount: messages.length,
            lastMessage:
                messages.length > 0
                    ? messages[messages.length - 1].content.substring(0, 50) +
                      "..."
                    : "empty",
            stream,
        });

        // Validate messages
        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Invalid messages format" },
                { status: 400 }
            );
        }

        // Always use mock data for this demo since we're in development mode
        console.log("Using mock response for demo - no API key configured");

        // Save to database - skip Redis if not available
        const chat = await prisma.chat.create({
            data: {
                notebookId,
                messages: {
                    create: messages.map((msg) => ({
                        role: msg.role.toUpperCase(),
                        content: msg.content,
                    })),
                },
            },
        });

        console.log("Created chat in database with ID:", chat.id);

        // Skip Redis operations that might fail
        try {
            if (user?.id) {
                await setChatHistory(user.id, notebookId, messages);
            }
        } catch (redisError) {
            console.warn("Redis operation failed (non-critical):", redisError);
            // Continue execution - Redis is optional
        }

        if (stream) {
            const encoder = new TextEncoder();
            const streamResponse = new TransformStream();
            const writer = streamResponse.writable.getWriter();

            // Create a streaming response
            const response = new Response(streamResponse.readable, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                },
            });

            // Use a function to generate the mock stream
            createMockStream(
                writer,
                encoder,
                chat.id,
                async (fullContent: string) => {
                    try {
                        // Save the mock message to the database
                        await prisma.message.create({
                            data: {
                                chatId: chat.id,
                                role: "ASSISTANT",
                                content: fullContent,
                            },
                        });
                    } catch (dbError) {
                        console.error(
                            "Failed to save message to database:",
                            dbError
                        );
                    }
                }
            );

            return response;
        } else {
            // Return a non-streaming mock response
            const mockResponse = createMockResponse();

            try {
                // Save the mock message to the database
                await prisma.message.create({
                    data: {
                        chatId: chat.id,
                        role: "ASSISTANT",
                        content: mockResponse.choices[0].message.content,
                    },
                });
            } catch (dbError) {
                console.error("Failed to save message to database:", dbError);
            }

            return NextResponse.json(mockResponse);
        }
    } catch (error: unknown) {
        console.error("[CHAT_ERROR]", error);
        const errorMessage =
            error instanceof Error ? error.message : "Internal Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
