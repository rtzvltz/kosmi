import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Haal profiel op
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'student') {
    redirect('/login')
  }

  // Haal werelden op uit Payload
  const payload = await getPayload({ config })
  const { docs: worlds } = await payload.find({
    collection: 'worlds',
    where: {
      published: {
        equals: true,
      },
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Hoi {profile.display_name || profile.name}! 👋
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Jouw punten</div>
              <div className="text-2xl font-bold text-primary-600">
                {profile.points_total || 0}
              </div>
            </div>
            <Link
              href="/profile"
              className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
            >
              Profiel
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Ontdek werelden
          </h2>
          <p className="text-gray-600">
            Kies een wereld om te verkennen en nieuwe dingen te leren!
          </p>
        </div>

        {/* Werelden grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {worlds.map((world) => (
            <Link
              key={world.id}
              href={`/worlds/${world.slug}`}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group"
            >
              {world.coverImage && typeof world.coverImage === 'object' && 'url' in world.coverImage && (
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={world.coverImage.url as string}
                    alt={world.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {world.title}
                </h3>
                {world.description && (
                  <p className="text-gray-600 text-sm">
                    {world.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {worlds.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-600">
              Er zijn nog geen werelden beschikbaar. Kom later terug!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
