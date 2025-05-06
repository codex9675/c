import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import { compare } from 'bcryptjs';

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
          // 1. Find user in database
          const user = await prisma.user.findUnique({
            where: { username: credentials.username }
          });

          if (!user) {
            console.log('User not found');
            return null;
          }

          // 2. Verify password
          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            console.log('Invalid password');
            return null;
          }

          // 3. Check password expiration
          if (new Date(user.passwordExpires) < new Date()) {
            console.log('Password expired');
            return null;
          }

          // 4. Return user object for session
          return {
            id: user.id.toString(),  // Crucial for dynamic routing
            name: user.username,
            email: `${user.username}@yourdomain.com`, // Required by NextAuth
            role: user.role,
            image: null // Can add profile image later
          };

        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 1. Add role and user ID to JWT token
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // 2. Make user ID and role available in session
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 3. Custom redirect after login
      if (url.startsWith('/user')) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
    newUser: null // Disable default new user page
  },
  session: {
    strategy: "jwt", // Required for middleware access
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };