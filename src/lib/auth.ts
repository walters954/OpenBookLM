import { prisma } from "./db";
import { CreditManager } from "./credit-manager";
import { nanoid } from "nanoid";

// Mock local user ID for development
const MOCK_USER_ID = "local-dev-user-123";

export async function getOrCreateUser() {
    // Always return the mock user
    let user = await prisma.user.findUnique({
        where: { id: MOCK_USER_ID },
    });

    if (!user) {
        // Create mock user if it doesn't exist
        user = await prisma.user.create({
            data: {
                id: MOCK_USER_ID,
                email: "demo@example.com",
                name: "Demo User",
                isGuest: false,
            },
        });
    }

    return user;
}

export async function getCurrentUser() {
    return prisma.user.findUnique({
        where: { id: MOCK_USER_ID },
    });
}
