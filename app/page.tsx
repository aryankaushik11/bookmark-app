'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Auth from '@/components/Auth'
import BookmarkManager from '@/components/BookmarkManager'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10">
      {user ? (
        <>
          <div className="max-w-4xl mx-auto px-4 mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Smart Bookmark App</h1>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Out
            </button>
          </div>
          <BookmarkManager user={user} />
        </>
      ) : (
        <Auth />
      )}
    </main>
  )
}
