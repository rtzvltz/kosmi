import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Registreren bij Kosmi
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Kies hieronder wat bij jou past
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Gezin registratie */}
          <Link
            href="/register/family"
            className="block p-6 border-2 border-primary-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Voor gezinnen
              </h2>
              <p className="text-gray-600 mb-4">
                Perfect voor thuis met 1 tot 3 kinderen
              </p>
              <div className="text-sm text-gray-500">
                <div>Vanaf €4/maand per kind</div>
              </div>
            </div>
          </Link>

          {/* School registratie */}
          <Link
            href="/register/school"
            className="block p-6 border-2 border-secondary-200 rounded-xl hover:border-secondary-500 hover:bg-secondary-50 transition"
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🏫</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Voor scholen
              </h2>
              <p className="text-gray-600 mb-4">
                Ideaal voor klassen of hele scholen
              </p>
              <div className="text-sm text-gray-500">
                <div>€175/jaar per klas</div>
                <div>€900/jaar voor de hele school</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Al een account?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Inloggen
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
