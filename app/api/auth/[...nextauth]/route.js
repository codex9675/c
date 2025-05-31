import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'
import { compare } from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username and password are required')
        }

        try {
          // Verify database connection first
          await prisma.$connect()

          const user = await prisma.user.findUnique({
            where: { username: credentials.username }
          })

          if (!user) {
            throw new Error('Invalid credentials')
          }

          // Verify password
          const isValid = await compare(credentials.password, user.password)
          if (!isValid) {
            throw new Error('Invalid credentials')
          }

          // Check password expiration (skip for MASTER role)
          if (user.role !== 'MASTER' && user.passwordExpires && new Date(user.passwordExpires) < new Date()) {
            throw new Error('Password expired. Please reset your password.')
          }

          return {
            id: user.id,
            name: user.username,
            email: user.email || `${user.username}@yourdomain.com`,
            role: user.role,
            passwordExpires: user.passwordExpires
          }
        } catch (error) {
          console.error('Authentication error:', error)
          throw error // Rethrow to show proper error message
        } finally {
          await prisma.$disconnect()
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.passwordExpires = user.passwordExpires
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.passwordExpires = token.passwordExpires
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error' // Add error page
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1 day
    updateAge: 60 * 60 // 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }