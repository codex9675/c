'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CreateUserPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    const formData = new FormData(e.target)
    const passwordExpires = new Date()
    passwordExpires.setMonth(passwordExpires.getMonth() + 3) // 3 months expiration
    
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.get('username'),
          password: formData.get('password'),
          passwordExpires: passwordExpires.toISOString(),
          role: 'USER'
        }),
      })

      if (!res.ok) throw new Error(await res.text())
      
      router.push('/master')
    } catch (err) {
      setError(err.message)
    }
  }

  if (session?.user?.role !== 'MASTER') {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New User</h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block mb-2">Username</label>
          <input
            name="username"
            type="text"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Password</label>
          <input
            name="password"
            type="password"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create User
        </button>
      </form>
    </div>
  )
}