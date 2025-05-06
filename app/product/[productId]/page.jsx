'use client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ProductPage() {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const res = await fetch(`/api/products/${productId}`)
        
        // Check if response is OK
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        // Verify content type
        const contentType = res.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response format')
        }
        
        const data = await res.json()
        
        // Validate response data
        if (!data || !data.id) {
          throw new Error('Invalid product data')
        }
        
        setProduct(data)
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [productId])

  if (loading) return <div className="text-center p-8">Loading product details...</div>
  
  if (error) return (
    <div className="container mx-auto p-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error loading product: {error}</p>
        <Link href="/" className="text-blue-500 hover:underline mt-2 inline-block">
          Return to homepage
        </Link>
      </div>
    </div>
  )

  if (!product) return (
    <div className="container mx-auto p-4">
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>Product not found</p>
        <Link href="/" className="text-blue-500 hover:underline mt-2 inline-block">
          Browse other products
        </Link>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <img 
          src={`/uploads/${product.image}`} 
          alt={product.name}
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-700 mb-4">{product.description}</p>
          <p className="text-xl font-semibold">${product.price.toFixed(2)}</p>
          <div className="mt-4 pt-4 border-t">
            <Link 
              href={`/profile/${product.user.username}`} 
              className="text-blue-500 hover:underline"
            >
              Sold by: {product.user.username}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}