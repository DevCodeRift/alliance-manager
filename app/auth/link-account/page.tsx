'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LinkAccount() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/user/link-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link API key')
      }

      // Redirect to dashboard after successful linking
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Link Your P&W Account
          </h1>
          <p className="text-gray-600">
            Connect your Politics and War nation to get started
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">How to get your API key:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Go to <a href="https://politicsandwar.com/account/" target="_blank" rel="noopener noreferrer" className="underline">politicsandwar.com/account/</a></li>
            <li>Scroll down to &quot;API Key&quot; section</li>
            <li>Copy your API key</li>
            <li>Paste it below</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              Politics and War API Key
            </label>
            <input
              type="text"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your P&W API key"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !apiKey}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Linking...' : 'Link Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Your API key is stored securely and used only to fetch your nation data</p>
        </div>
      </div>
    </div>
  )
}
