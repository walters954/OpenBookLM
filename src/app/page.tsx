import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Settings, Grid3X3, List } from 'lucide-react'

export default function Home() {
  const notebooks = [
    {
      id: 1,
      title: 'Untitled notebook',
      date: 'Sep 17, 2024',
      sources: 3,
    },
    {
      id: 2,
      title: 'Untitled notebook',
      date: 'Jan 14, 2025',
      sources: 0,
    },
  ]

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

  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-2">
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

      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-12 bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
          Welcome to OpenBookLM
        </h1>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">My Notebooks</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Grid3X3 className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button variant="outline" size="sm">
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Button variant="outline" className="h-40 flex flex-col items-center justify-center">
              <span className="text-lg mb-2">Create new</span>
            </Button>
            {notebooks.map((notebook) => (
              <Link key={notebook.id} href={`/notebook/${notebook.id}`}>
                <Card className="h-40 p-6 hover:border-primary transition-colors">
                  <h3 className="text-lg font-medium mb-2">{notebook.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {notebook.date} · {notebook.sources} sources
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Community Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityCourses.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`}>
                <Card className="h-40 p-6 hover:border-primary transition-colors">
                  <h3 className="text-lg font-medium mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    By {course.author} · {course.participants} participants
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
