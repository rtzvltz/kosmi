import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ParentDashboard() {
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

  if (!profile || profile.role !== 'parent') {
    redirect('/login')
  }

  // Haal kinderen op
  const { data: childLinks } = await supabase
    .from('parent_child_links')
    .select('child_id')
    .eq('parent_id', user.id)

  const childIds = childLinks?.map(link => link.child_id) || []

  const { data: children } = await supabase
    .from('profiles')
    .select('*')
    .in('id', childIds.length > 0 ? childIds : ['00000000-0000-0000-0000-000000000000'])

  // Haal abonnement op
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Ouder Dashboard
            </h1>
            <div className="flex gap-4">
              <Link
                href="/parent/children"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
              >
                Beheer kinderen
              </Link>
              <Link
                href="/parent/subscription"
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
              >
                Abonnement
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-gray-600 hover:text-gray-900 px-4 py-2"
                >
                  Uitloggen
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Abonnement status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Jouw abonnement
          </h2>
          {subscription ? (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-700">
                  Gezinsabonnement voor {subscription.child_count} {subscription.child_count === 1 ? 'kind' : 'kinderen'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Status: <span className={subscription.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                    {subscription.status === 'active' ? 'Actief' : 'Inactief'}
                  </span>
                </p>
              </div>
              <Link
                href="/parent/subscription"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Beheer →
              </Link>
            </div>
          ) : (
            <p className="text-gray-600">Geen actief abonnement</p>
          )}
        </div>

        {/* Kinderen overzicht */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Jouw kinderen
            </h2>
            {(!children || children.length < (subscription?.child_count || 0)) && (
              <Link
                href="/parent/children/add"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
              >
                + Kind toevoegen
              </Link>
            )}
          </div>

          {children && children.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {child.display_name || child.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Groep {child.groep}
                      </p>
                    </div>
                  </div>

                  <div className="bg-primary-50 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-600 mb-1">
                      Totaal punten
                    </div>
                    <div className="text-3xl font-bold text-primary-600">
                      {child.points_total || 0}
                    </div>
                  </div>

                  <Link
                    href={`/parent/children/${child.id}`}
                    className="block w-full text-center bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
                  >
                    Bekijk voortgang
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Nog geen kinderen toegevoegd
              </h3>
              <p className="text-gray-600 mb-6">
                Voeg je eerste kind toe om te beginnen
              </p>
              <Link
                href="/parent/children/add"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Kind toevoegen
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
