'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null)
  const [userData, setUserData] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const { username, id } = params

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product
        const productRes = await fetch(`/api/products/${id}`)
        const productData = await productRes.json()
        setProduct(productData)

        // Fetch user data
        const userRes = await fetch(`/api/user/profile/${username}`)
        const userData = await userRes.json()
        setUserData(userData)

        // Check admin status
        const sessionRes = await fetch('/api/auth/session')
        const session = await sessionRes.json()
        setIsAdmin(session?.user?.role === 'ADMIN')
      } catch (error) {
        console.error('Fetch error:', error)
      }
    }

    fetchData()
  }, [id, username])

  if (!product || !userData) return <div>Loading...</div>

  return (
    <div style={{ backgroundColor: userData.portfolioColor || '#ffffff' }} className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex overflow-x-auto gap-4 py-4 mb-6 hide-scrollbar">
          <button 
            onClick={() => router.push(`/portfolio/${username}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shrink-0"
          >
            Home
          </button>
          
          {isAdmin && (
            <>
            <button
              onClick={() => router.push(`/portfolio/${username}/upload`)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg shrink-0"
            >
              Add Product
            </button>

            <button  className="px-4 py-2 border-2 border-pink-500 font-bold text-red-500 rounded-lg shrink-0 hover:bg-pink-600 hover:text-white ease-in transition-all duration-300">Add image</button>
            </>
          )}

        </div>

        <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative h-96">
              <Image
                src={`/api/images/${product.image}`}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-2xl font-semibold text-blue-600 mb-4">
                ${product.price.toFixed(2)}
              </p>
              
              <div className="prose max-w-none mb-6">
                <p>{product.description}</p>
              </div>
              
              <div className="flex items-center mt-6">
                <div className="mr-4">
                </div>
                <div>
                  <p className="font-medium">{userData.shopName || userData.username}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}