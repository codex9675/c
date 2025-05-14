'use client'
import { useState } from 'react'

export default function CreateUserForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordExpires: '',
    role: 'ADMIN', // Default to ADMIN role
    profileSlug: '' // Unique profile identifier
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Auto-generate profile slug when username changes
    if (name === 'username') {
      const slug = value.toLowerCase().replace(/\s+/g, '-')
      setFormData(prev => ({ ...prev, profileSlug: slug }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.username || !formData.password || !formData.passwordExpires) {
      setError('All fields are required')
      return
    }
    
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }
    
    onSubmit(formData)
    setError('')
  }

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Create New Admin</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password Expires On</label>
          <input
            type="date"
            name="passwordExpires"
            value={formData.passwordExpires}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Profile URL</label>
          <div className="flex items-center">
            <span className="mr-2">yourdomain.com/admin/</span>
            <input
              type="text"
              name="profileSlug"
              value={formData.profileSlug}
              onChange={handleChange}
              className="flex-1 px-3 py-2 border rounded-md"
              required
            />
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Admin
          </button>
        </div>
      </form>
    </div>
  )
}