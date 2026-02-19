import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-primary-900 mb-4">
          Welkom bij Kosmi
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Het leerplatform voor nieuwsgierige kinderen
        </p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Inloggen
          </Link>
          <Link
            href="/register"
            className="inline-block bg-secondary-600 hover:bg-secondary-700 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Registreren
          </Link>
        </div>
      </div>
    </div>
  )
}
