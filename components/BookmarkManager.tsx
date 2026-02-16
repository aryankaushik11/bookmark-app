'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Bookmark } from '@/types'

export default function BookmarkManager({ user }: { user: any }) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [title, setTitle] = useState('')
    const [url, setURL] = useState('')
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchBookmarks()

        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookmarks',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setBookmarks((prev) => [payload.new as Bookmark, ...prev])
                    } else if (payload.eventType === 'DELETE') {
                        setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user.id])

    const fetchBookmarks = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching bookmarks:', error)
        } else {
            setBookmarks(data || [])
        }
        setLoading(false)
    }

    const addBookmark = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !url) return

        const { error } = await supabase.from('bookmarks').insert({
            title,
            url,
            user_id: user.id,
        })

        if (error) {
            console.error('Error adding bookmark:', error)
            alert('Error adding bookmark')
        } else {
            setTitle('')
            setURL('')
        }
    }

    const deleteBookmark = async (id: string) => {
        const { error } = await supabase.from('bookmarks').delete().eq('id', id)

        if (error) {
            console.error('Error deleting bookmark:', error)
            alert('Error deleting bookmark')
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Bookmark</h2>
                <form onSubmit={addBookmark} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Google"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">URL</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setURL(e.target.value)}
                            placeholder="https://example.com"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Add Bookmark
                    </button>
                </form>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">My Bookmarks</h2>
                {loading ? (
                    <p>Loading bookmarks...</p>
                ) : bookmarks.length === 0 ? (
                    <p className="text-gray-500">No bookmarks yet.</p>
                ) : (
                    <ul className="space-y-4">
                        {bookmarks.map((bookmark) => (
                            <li key={bookmark.id} className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50">
                                <div>
                                    <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-blue-600 hover:underline">
                                        {bookmark.title}
                                    </a>
                                    <p className="text-sm text-gray-500">{bookmark.url}</p>
                                </div>
                                <button
                                    onClick={() => deleteBookmark(bookmark.id)}
                                    className="ml-4 px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
