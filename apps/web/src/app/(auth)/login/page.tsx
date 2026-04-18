'use client'

import { login } from './actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/20 overflow-hidden">
        <div className="p-8 pb-0 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🍳</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-2">Food Club WA</h1>
          <p className="text-on-surface-variant font-medium">Internal Calendar Access</p>
        </div>

        <form action={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-error-container text-red-700 rounded-xl text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-5 py-3 rounded-2xl bg-surface border border-outline-variant/30 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="name@foodclub.au"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-5 py-3 rounded-2xl bg-surface border border-outline-variant/30 text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:opacity-90 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="p-6 bg-surface-container-low text-center border-t border-outline-variant/10">
          <p className="text-sm text-on-surface-variant italic">
            "Improving communication between the team"
          </p>
        </div>
      </div>
    </div>
  )
}
