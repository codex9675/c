'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateUserPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordExpires: '',
    plan: 'BASIC',
    portfolioUrl: ''
  })
  const [generatedLink, setGeneratedLink] = useState('')

  // Generate portfolio link in real-time
  useEffect(() => {
    const baseUrl = 'http://localhost:3000/profile'
    const link = formData.portfolioUrl 
      ? `${baseUrl}/${formData.portfolioUrl}`
      : `${baseUrl}/${formData.username.toLowerCase().replace(/\s+/g, '-')}`
    setGeneratedLink(link)
  }, [formData.username, formData.portfolioUrl])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          plan: formData.plan.toUpperCase()
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create admin')

      // Show success with the published link
      alert(`Admin created successfully!\nPortfolio URL: ${generatedLink}`)
      router.push('/master')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Admin Account</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Field */}
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Expiration Date */}
        <div>
          <label className="block text-sm font-medium mb-1">Password Expires</label>
          <input
            type="date"
            name="passwordExpires"
            value={formData.passwordExpires}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Plan Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Package Plan</label>
          <select
            name="plan"
            value={formData.plan}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="BASIC">Basic</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </div>

        {/* Portfolio Link Preview */}
        <div>
          <label className="block text-sm font-medium mb-1">Portfolio URL</label>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">http://localhost:3000/profile/</span>
            <input
              type="text"
              name="portfolioUrl"
              placeholder={formData.username || 'username'}
              value={formData.portfolioUrl}
              onChange={handleChange}
              className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {generatedLink && (
            <div className="mt-2 text-sm text-blue-600">
              Preview: <a href={generatedLink} target="_blank" rel="noopener noreferrer" className="underline">
                {generatedLink}
              </a>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded text-white font-medium ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSubmitting ? 'Creating...' : 'Create Admin'}
        </button>
      </form>
    </div>
  )
}