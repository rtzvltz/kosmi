'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AddChildPage() {
  const [name, setName] = useState('')
  const [groep, setGroep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Niet ingelogd')

      // Maak kind account aan (zonder email/password)
      const tempPassword = Math.random().toString(36).slice(-12)
      const tempEmail = `${user.id}-${Date.now()}@kosmi-temp.local`

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Kon kind niet aanmaken')

      // Maak profiel aan
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name,
          display_name: name,
          role: 'student',
          groep,
          parent_id: user.id,
        })

      if (profileError) throw profileError

      // Maak parent-child link
      const { error: linkError } = await supabase
        .from('parent_child_links')
        .insert({
          parent_id: user.id,
          child_id: authData.user.id,
        })

      if (linkError) throw linkError

      router.push('/parent/dashboard')
    } catch (err: any) {
      setError(err.message || 'Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Kind toevoegen
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Naam van het kind
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Bijv. Emma"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              In welke groep zit het kind?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroep(g)}
                  className={`p-3 border-2 rounded-lg text-center transition ${
                    groep === g
                      ? 'border-primary-500 bg-primary-50 font-bold'
                      : 'border-gray-300 hover:border-primary-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Bezig...' : 'Kind toevoegen'}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full text-gray-600 hover:text-gray-900 py-2"
          >
            Annuleren
          </button>
        </form>
      </div>
    </div>
  )
}
