// lib/auth.js
import GoogleProvider from "next-auth/providers/google"; // or any provider you use
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Replace this with your own logic
        const res = await fetch("http://localhost:3000/api/auth/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        const user = await res.json();

        if (res.ok && user) return user;
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Optionally customize what is stored in session
      session.user.name = token.username;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login", // optional
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
