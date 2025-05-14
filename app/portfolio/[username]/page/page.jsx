'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PortfolioPage({ params }) {
  const [userData, setUserData] = useState(null)
  const [products, setProducts] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [slideDirection, setSlideDirection] = useState('right')
  const router = useRouter()
  const { username } = params
  const contentRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch user data
        const userRes = await fetch(`/api/user/profile/${username}`)
        if (!userRes.ok) throw new Error('Failed to fetch user')
        const userData = await userRes.json()
        setUserData(userData)

        // Fetch products
        const productsRes = await fetch(`/api/products?userId=${userData.id}`)
        if (!productsRes.ok) throw new Error('Failed to fetch products')
        const productsData = await productsRes.json()
        setProducts(productsData)

        // Check if current user is admin
        const sessionRes = await fetch('/api/auth/session')
        if (sessionRes.ok) {
          const session = await sessionRes.json()
          setIsAdmin(session?.user?.role === 'ADMIN')
        }
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [username])

  const handleNavigation = (path, direction = 'right') => {
    setSlideDirection(direction)
    setTimeout(() => {
      router.push(path)
    }, 100)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (!userData) return <div className="min-h-screen flex items-center justify-center">User not found</div>

  return (
    <div 
      className="min-h-screen overflow-hidden"
      style={{ backgroundColor: userData.portfolioColor || '#ffffff' }}
    >
      {/* Slide Navigation */}
      <div className="flex overflow-x-auto py-4 mb-6 hide-scrollbar bg-white bg-opacity-20">
        <div className="flex space-x-4 px-4">
          <button 
            onClick={() => handleNavigation(`/portfolio/${username}`, 'left')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg whitespace-nowrap"
          >
            Home
          </button>
          
          {isAdmin && (
            <button
              onClick={() => handleNavigation(`/portfolio/${username}/upload`, 'right')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg whitespace-nowrap"
            >
              Add Product
            </button>
          )}

          {products.map(product => (
            <button
              key={product.id}
              onClick={() => handleNavigation(`/portfolio/${username}/page/${product.id}`, 'right')}
              className="px-4 py-2 bg-gray-200 rounded-lg whitespace-nowrap"
            >
              {product.name}
            </button>
          ))}
        </div>
      </div>

      {/* Animated Content */}
      <div 
        ref={contentRef}
        className={`transform transition-transform duration-300 ease-in-out ${
          slideDirection === 'right' ? 'translate-x-full' : '-translate-x-full'
        }`}
        onTransitionEnd={() => {
          contentRef.current.classList.remove('translate-x-full', '-translate-x-full')
        }}
      >
        {/* Main Content */}
        <div className="container mx-auto p-4">
          <div className="bg-white bg-opacity-90 rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold mb-4">{userData.shopName || userData.username}'s Portfolio</h1>
            
            {userData.description && (
              <p className="mb-6 text-gray-700">{userData.description}</p>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map(product => (
                <div 
                  key={product.id} 
                  className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleNavigation(`/portfolio/${username}/products/${product.id}`, 'right')}
                >
                  <img 
                    src={`/uploads/${product.image}`} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-gray-600 line-clamp-2">{product.description}</p>
                    <p className="font-semibold">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}