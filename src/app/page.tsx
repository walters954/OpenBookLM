import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Settings, Grid3X3, List } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from '@/lib/auth'
import setAllNotebooks from '@/lib/redis'
import { HomePage } from '@/components/home-page'

export default async function Page() {
  const { userId } = await auth();
  const user = await getOrCreateUser();

  if (!user) {
    redirect("/sign-in");
  }

  const communityCourses = [
    {
      id: 1,
      title: 'Introduction to AI',
      author: 'Community',
      participants: 1200,
    },
    {
      id: 2,
      title: 'Machine Learning Basics',
      author: 'Community',
      participants: 850,
    },
  ]

  const notebooks = await prisma.notebook.findMany({
    where: {
      OR: [
        { userId: user.id },
        {
          bookmarkedBy: {
            some: { id: user.id },
          },
        },
        {
          sharedWith: {
            some: { id: user.id },
          },
        },
      ],
    },
    include: {
      sources: true,
      user: true,
      sharedWith: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Cache all notebooks in Redis
  const serializedNotebooks = notebooks.map((notebook) => ({
    ...notebook,
    sources: notebook.sources,
    updatedAt: notebook.updatedAt.toISOString(),
    createdAt: notebook.createdAt.toISOString(),
    role:
      notebook.userId === user.id
        ? "Owner"
        : notebook.sharedWith.some((u) => u.id === user.id)
        ? "Editor"
        : "Reader",
    ownerName: notebook.user.name || "Unknown",
    userId: notebook.userId,
  }));

  await setAllNotebooks(user.id, serializedNotebooks);

  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="OpenBookLM Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
              OpenBookLM
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>
      <HomePage notebooks={serializedNotebooks} />
    </main>
  );
}
