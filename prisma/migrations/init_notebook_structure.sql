-- This ensures the User table exists
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "clerkId" TEXT UNIQUE,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "isGuest" BOOLEAN NOT NULL DEFAULT false,
  "credits" INTEGER NOT NULL DEFAULT 100,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- This ensures the Notebook table exists
CREATE TABLE IF NOT EXISTS "Notebook" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "content" TEXT,
  "provider" TEXT NOT NULL DEFAULT 'openai',
  "userId" TEXT NOT NULL,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "isArchived" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create index on userId for faster lookups
CREATE INDEX IF NOT EXISTS "Notebook_userId_idx" ON "Notebook"("userId"); 