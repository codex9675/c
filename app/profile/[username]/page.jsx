'use client'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import ProductForm from '@/components/ProductForm'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const { username } = useParams()
  const router = useRouter()
  const [products, setProducts] = useState([])

  useEffect(() => {
    // Redirect if not the correct user
    if (session?.user?.name !== username) {
      router.push(`/profile/${session?.user?.name}`)
    }

    // Fetch user's products
    const fetchProducts = async () => {
      const res = await fetch(`/api/products?userId=${session?.user?.id}`)
      const data = await res.json()
      setProducts(data)
    }
    
    if (session?.user?.id) {
      fetchProducts()
    }
  }, [session, username, router])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{username}'s Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
          <ProductForm username={username} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Products</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {products.map(product => (
                <div key={product.id} className="border p-4 rounded-lg">
                  <img 
                    src={`/uploads/${product.image}`} 
                    alt={product.name}
                    className="w-full h-48 object-cover mb-2 rounded-md"
                  />
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-gray-600">{product.description}</p>
                  <p className="font-semibold">${product.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No products yet</p>
          )}
        </div>
      </div>
    </div>
  )
}