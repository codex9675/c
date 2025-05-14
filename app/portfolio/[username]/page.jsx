'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CoverPage({ params }) {
  const [userData, setUserData] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { username } = params

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch user data
        const userRes = await fetch(`/api/user/profile/${username}`)
        if (!userRes.ok) throw new Error('Failed to fetch user')
        const userData = await userRes.json()
        setUserData(userData)

        // Check if current user is admin
        const sessionRes = await fetch('/api/auth/session')
        if (sessionRes.ok) {
          const session = await sessionRes.json()
          setIsAdmin(session?.user?.role === 'ADMIN' && session?.user?.username === username)
        }
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [username])

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!userData) return <div className="min-h-screen flex items-center justify-center">User not found</div>

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: userData.portfolioColor || '#ffffff' }}
    >
      {/* Cover Content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <motion.div 
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-white bg-opacity-90 rounded-lg shadow-xl p-8 max-w-2xl w-full text-center"
        >
          {userData.storeImage && (
            <motion.img
              src={`/uploads/${userData.storeImage}`}
              alt="Store Logo"
              className="mx-auto h-32 w-32 rounded-full object-cover mb-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          )}
          <h1 className="text-4xl font-bold mb-4">{userData.shopName || userData.username}'s Portfolio</h1>
          {userData.description && (
            <p className="text-xl text-gray-700 mb-8">{userData.description}</p>
          )}
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => router.push(`/portfolio/${username}/page`)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg text-lg font-medium"
            >
              View Products
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="p-4 flex justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/portfolio/${username}/`)}
            className="px-4 py-2 bg-green-500 text-black rounded-lg"
          >
            Edit Profile
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/portfolio/${username}/page/upload`)}
            className="px-4 py-2 bg-purple-500 text-black rounded-lg"
          >
            Add Product
          </motion.button>
        </div>
      )}

      {/* Navigation Arrow */}
      <motion.div
        onClick={() => router.push(`/portfolio/${username}/page`)}
        whileHover={{ x: 5 }}
        className="absolute right-10 bottom-10 cursor-pointer"
      >
        <div className="text-4xl">→</div>
      </motion.div>
    </motion.div>
  )
}