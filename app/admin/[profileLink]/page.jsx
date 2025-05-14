'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminDashboard({ params }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [adminData, setAdminData] = useState(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await fetch(`/api/admins/${params.slug}`)
        if (!res.ok) throw new Error('Failed to fetch admin data')
        
        const data = await res.json()
        setAdminData(data)
        
        // Check if expired
        if (new Date(data.expiresAt) < new Date()) {
          setIsExpired(true)
          
          // Optional: Automatically revoke access
          await fetch(`/api/admins/${data.id}/revoke`, { method: 'POST' })
        }
      } catch (error) {
        console.error('Error:', error)
        router.push('/auth/login')
      }
    }

    if (status === 'authenticated') {
      fetchAdminData()
    }
  }, [status, params.slug, router])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (isExpired) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Expired</h1>
        <p>Your admin access has expired on {new Date(adminData.expiresAt).toLocaleDateString()}</p>
        <p>Please contact the master administrator to renew your access.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Welcome, {adminData?.username} ({adminData?.packageType} Package)
      </h1>
      
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
        <p>Your access expires on: {adminData?.expiresAt ? new Date(adminData.expiresAt).toLocaleDateString() : 'N/A'}</p>
      </div>

      {/* Package-specific content would go here */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Content based on packageType */}
      </div>
    </div>
  )
}