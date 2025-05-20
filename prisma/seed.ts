const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    try {
        // Create a test user
        const user = await prisma.user.upsert({
            where: { email: "test@example.com" },
            update: {},
            create: {
                id: "local-dev-user-123",
                email: "test@example.com",
                name: "Test User",
                isGuest: false,
            },
        });

        console.log("Database seeded successfully!");
        console.log("Created test user:", user);
    } catch (error) {
        console.error("Error seeding database:", error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
