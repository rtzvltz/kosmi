'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SchoolRegisterPage() {
  const [schoolName, setSchoolName] = useState('')
  const [brinCode, setBrinCode] = useState('')
  const [city, setCity] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [subscriptionType, setSubscriptionType] = useState<'class' | 'unlimited'>('class')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Maak Supabase auth account aan
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Geen gebruiker aangemaakt')

      // Maak school aan
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: schoolName,
          brin_code: brinCode,
          city,
        })
        .select()
        .single()

      if (schoolError) throw schoolError

      // Maak profiel aan
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          name: contactName,
          role: 'school_admin',
          school_id: schoolData.id,
        })

      if (profileError) throw profileError

      // Redirect naar Stripe checkout
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: subscriptionType === 'class' ? 'school_class' : 'school_unlimited',
          userId: authData.user.id,
        }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      } else {
        throw new Error('Geen checkout URL ontvangen')
      }
    } catch (err: any) {
      setError(err.message || 'Er is iets misgegaan bij het registreren')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Schoolregistratie
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Maak een account aan voor jouw school
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-1">
                Naam van de school
              </label>
              <input
                id="schoolName"
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Plaats
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="brinCode" className="block text-sm font-medium text-gray-700 mb-1">
              BRIN-code (optioneel)
            </label>
            <input
              id="brinCode"
              type="text"
              value={brinCode}
              onChange={(e) => setBrinCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Bijv. 00AA00"
            />
          </div>

          <div className="border-t pt-4 mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Contactpersoon</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                  Naam
                </label>
                <input
                  id="contactName"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mailadres
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Wachtwoord
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimaal 6 tekens</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Kies je abonnement
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSubscriptionType('class')}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  subscriptionType === 'class'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-300'
                }`}
              >
                <div className="font-semibold text-gray-900">Per klas</div>
                <div className="text-2xl font-bold text-primary-600 my-2">€175/jaar</div>
                <div className="text-sm text-gray-600">Voor één klas</div>
              </button>

              <button
                type="button"
                onClick={() => setSubscriptionType('unlimited')}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  subscriptionType === 'unlimited'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-300'
                }`}
              >
                <div className="font-semibold text-gray-900">Hele school</div>
                <div className="text-2xl font-bold text-primary-600 my-2">€900/jaar</div>
                <div className="text-sm text-gray-600">Onbeperkt aantal klassen</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Bezig...' : 'Doorgaan naar betaling'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/register" className="text-gray-600 hover:text-gray-800">
            ← Terug naar keuzemenu
          </Link>
        </div>
      </div>
    </div>
  )
}
