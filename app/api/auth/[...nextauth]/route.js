import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'
import { compare } from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Fetch the user based on username
          const user = await prisma.user.findUnique({
            where: { username: credentials.username }
          })

          // If user does not exist, return null
          if (!user) return null

          // Check if password matches
          const isValid = await compare(credentials.password, user.password)
          if (!isValid) return null

          // Skip expiration check for MASTER account
          if (user.role !== 'MASTER' && user.passwordExpires && new Date(user.passwordExpires) < new Date()) {
            throw new Error('Password expired')
          }

          // Return user data if validation passes
          return {
            id: user.id,
            name: user.username,
            email: `${user.username}@yourdomain.com`,  // Fixed string interpolation here
            role: user.role,
            passwordExpires: user.passwordExpires
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.passwordExpires = user.passwordExpires
        token.id = user.id;
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      session.user.id = token.id;
      session.user.passwordExpires = token.passwordExpires
      return session
    }
  },
  pages: {
    signIn: '/auth/login'
  },
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
