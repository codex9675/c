'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadPage({ params }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: null
  })
  const [preview, setPreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { username } = params

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({...formData, image: file})
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const formPayload = new FormData()
      formPayload.append('name', formData.name)
      formPayload.append('description', formData.description)
      formPayload.append('price', formData.price)
      formPayload.append('image', formData.image)
      formPayload.append('username', username)

      const res = await fetch('/api/products', {
        method: 'POST',
        body: formPayload
      })

      if (!res.ok) throw new Error('Upload failed')

      router.push(`/portfolio/${username}`)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Product Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-2 border rounded"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-2 border rounded"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className="block mb-1">Price ($)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            className="w-full p-2 border rounded"
            step="0.01"
            min="0"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className="block mb-1">Product Image</label>
          <input
            type="file"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
            accept="image/*"
            required
            disabled={isSubmitting}
          />
          {preview && (
            <div className="mt-2">
              <img 
                src={preview} 
                alt="Preview" 
                className="h-32 object-contain mx-auto"
              />
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded flex-1 disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Uploading...' : 'Upload'}
          </button>
          
          <button
            type="button"
            onClick={() => router.push(`/portfolio/${username}`)}
            className="bg-gray-500 text-white px-4 py-2 rounded flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}