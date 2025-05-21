import { prisma } from "./db";
import { CreditManager } from "./credit-manager";
import { nanoid } from "nanoid";

// Mock local user ID for development
const MOCK_USER_ID = "local-dev-user-123";

export async function getOrCreateUser() {
    try {
        console.log("Getting or creating demo user");
        // Always return the mock user
        let user = await prisma.user.findUnique({
            where: { id: MOCK_USER_ID },
        });

        if (!user) {
            console.log("Creating new demo user");
            // Create mock user if it doesn't exist
            user = await prisma.user.create({
                data: {
                    id: MOCK_USER_ID,
                    email: "demo@example.com",
                    name: "Demo User",
                    isGuest: false,
                },
            });
            console.log("Demo user created:", user.id);
        } else {
            console.log("Using existing demo user:", user.id);
        }

        return user;
    } catch (error) {
        console.error("Error in getOrCreateUser:", error);
        // For demo purposes, return a fallback user object even if DB operations fail
        return {
            id: MOCK_USER_ID,
            email: "demo@example.com",
            name: "Demo User",
            isGuest: false,
        };
    }
}

export async function getCurrentUser() {
    try {
        console.log("Getting current user");
        const user = await prisma.user.findUnique({
            where: { id: MOCK_USER_ID },
        });

        if (user) {
            console.log("Found current user:", user.id);
            return user;
        }

        console.log("Current user not found, returning mock user");
        return {
            id: MOCK_USER_ID,
            email: "demo@example.com",
            name: "Demo User",
            isGuest: false,
        };
    } catch (error) {
        console.error("Error in getCurrentUser:", error);
        // For demo purposes, return a fallback user
        return {
            id: MOCK_USER_ID,
            email: "demo@example.com",
            name: "Demo User",
            isGuest: false,
        };
    }
}
