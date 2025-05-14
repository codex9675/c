'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminPanel() {
  const { data: session } = useSession()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await fetch('/api/admin/users')
        if (!res.ok) throw new Error('Failed to fetch admins')
        const data = await res.json()
        setAdmins(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAdmins()
  }, [])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Profile link copied to clipboard!')
  }

  if (loading) return (
    <div className="container mx-auto p-4">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border p-4 rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div className="container mx-auto p-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    </div>
  )

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Management</h1>
        {session?.user?.role === 'MASTER' && (
          <Link
            href="/admin/create"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
          >
            Create New Admin
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {admins.length === 0 ? (
          <p className="text-gray-500">No admins found</p>
        ) : (
          admins.map(admin => (
            <div key={admin.id} className="border p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{admin.username}</h3>
                  <p className="text-sm text-gray-500">
                    Joined: {new Date(admin.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {admin.role}
                </span>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <button 
                  onClick={() => copyToClipboard(`${window.location.origin}/admin/${admin.profileLink}`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Copy Profile Link
                </button>
                
                {session?.user?.role === 'MASTER' && (
                  <button 
                    onClick={() => handleRemoveAdmin(admin.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Remove Admin
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  async function handleRemoveAdmin(adminId) {
    if (confirm('Are you sure you want to remove this admin?')) {
      try {
        const res = await fetch(`/api/admin/users/${adminId}`, {
          method: 'DELETE'
        })
        
        if (res.ok) {
          setAdmins(admins.filter(a => a.id !== adminId))
        } else {
          throw new Error('Failed to remove admin')
        }
      } catch (error) {
        setError(error.message)
      }
    }
  }
}