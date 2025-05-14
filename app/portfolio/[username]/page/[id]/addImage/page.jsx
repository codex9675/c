'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function AddProductPage({ params }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: null
  })
  const [preview, setPreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
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
    setError('')
    
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

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      router.push(`/portfolio/${username}/page`)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'tween', ease: 'easeInOut' }}
      className="min-h-screen p-4"
    >
      <div className="max-w-md mx-auto">
        <motion.button
          onClick={() => router.push(`/portfolio/${username}/page`)}
          whileHover={{ x: -5 }}
          className="flex items-center mb-6 text-lg"
        >
          ← Back to Products
        </motion.button>

        <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          >
            {error}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Product Name</label>
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
            <label className="block mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-2 border rounded"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block mb-2">Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full p-2 border rounded"
              step="0.01"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block mb-2">Product Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full p-2 border rounded"
              accept="image/*"
              required
              disabled={isSubmitting}
            />
            {preview && (
              <motion.img 
                src={preview} 
                alt="Preview" 
                className="mt-2 h-32 object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </div>
          
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Uploading...' : 'Add Product'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  )
}