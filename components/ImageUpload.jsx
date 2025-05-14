// components/ImageUpload.jsx
'use client'
import { useState } from 'react'

export default function ImageUpload({ productId, onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    try {
      // Validate file
      if (file.size > 1024 * 1024) {
        throw new Error('Image must be less than 1MB')
      }

      const formData = new FormData()
      formData.append('image', file)
      formData.append('productId', productId)

      const res = await fetch(`/api/products/${productId}/images`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const newImage = await res.json()
      onUploadSuccess(newImage)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="mb-4">
      <label className="block mb-2 font-medium">
        {isUploading ? 'Uploading...' : 'Add Additional Images'}
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}