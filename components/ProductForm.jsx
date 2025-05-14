'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProductForm() {
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.target)
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create product')
      }

      router.refresh()
      router.push('/products')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label className="block mb-2">Product Name</label>
        <input
          name="name"
          type="text"
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div>
        <label className="block mb-2">Description</label>
        <textarea
          name="description"
          className="w-full p-2 border rounded"
          rows="3"
          required
        />
      </div>
      
      <div>
        <label className="block mb-2">Price</label>
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div>
        <label className="block mb-2">Image</label>
        <input
          name="image"
          type="file"
          accept="image/*"
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Create Product
      </button>
    </form>
  )
}