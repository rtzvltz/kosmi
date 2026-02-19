'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function FamilyRegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [childCount, setChildCount] = useState<1 | 2 | 3>(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const prices = {
    1: 4,
    2: 6,
    3: 8,
  }

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

      // Maak profiel aan
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          name,
          role: 'parent',
        })

      if (profileError) throw profileError

      // Redirect naar Stripe checkout
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: `family_${childCount}`,
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
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Gezinsregistratie
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Maak een account aan voor jouw gezin
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Jouw naam
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aantal kinderen
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setChildCount(count as 1 | 2 | 3)}
                  className={`p-3 border-2 rounded-lg text-center transition ${
                    childCount === count
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-300'
                  }`}
                >
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    €{prices[count as 1 | 2 | 3]}/mnd
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-primary-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Totaal per maand:</span>
              <span className="text-2xl font-bold text-primary-600">
                €{prices[childCount]}
              </span>
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
