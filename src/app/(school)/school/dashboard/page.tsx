import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SchoolDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Haal profiel op
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, school:schools(*)')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'school_admin') {
    redirect('/login')
  }

  // Haal abonnement op
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  // Haal klassen op
  const { data: classes } = await supabase
    .from('class_assignments')
    .select('*, student_count:class_students(count)')
    .eq('school_id', profile.school_id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                School Dashboard
              </h1>
              {profile.school && typeof profile.school === 'object' && 'name' in profile.school && (
                <p className="text-gray-600">{profile.school.name}</p>
              )}
            </div>
            <div className="flex gap-4">
              <Link
                href="/school/classes"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
              >
                Beheer klassen
              </Link>
              <Link
                href="/school/subscription"
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition"
              >
                Abonnement
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Abonnement info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Abonnement
          </h2>
          {subscription ? (
            <div>
              <p className="text-gray-700">
                {subscription.class_count === 999
                  ? 'Schoolbreed abonnement (onbeperkt aantal klassen)'
                  : `Abonnement voor ${subscription.class_count} ${subscription.class_count === 1 ? 'klas' : 'klassen'}`
                }
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Status: <span className={subscription.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                  {subscription.status === 'active' ? 'Actief' : 'Inactief'}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-gray-600">Geen actief abonnement</p>
          )}
        </div>

        {/* Klassen overzicht */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Jouw klassen
            </h2>
            <Link
              href="/school/classes/add"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition"
            >
              + Klas toevoegen
            </Link>
          </div>

          {classes && classes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem: any) => (
                <Link
                  key={classItem.id}
                  href={`/school/classes/${classItem.id}`}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {classItem.class_label}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Groep {classItem.groep}
                  </p>
                  <div className="text-sm text-gray-500">
                    {classItem.student_count?.[0]?.count || 0} leerlingen
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🏫</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Nog geen klassen aangemaakt
              </h3>
              <p className="text-gray-600 mb-6">
                Maak je eerste klas aan om te beginnen
              </p>
              <Link
                href="/school/classes/add"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Klas toevoegen
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
