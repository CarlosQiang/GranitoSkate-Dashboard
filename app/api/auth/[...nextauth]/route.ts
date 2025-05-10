import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Verificar si las credenciales coinciden con las variables de entorno
        if (credentials?.email === process.env.ADMIN_EMAIL && credentials?.password === process.env.ADMIN_PASSWORD) {
          return {
            id: "1",
            name: "Admin",
            email: process.env.ADMIN_EMAIL,
            role: "admin",
          }
        }

        // Si las credenciales no coinciden, devolver null
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Añadir datos adicionales al token
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      // Añadir datos adicionales a la sesión
      if (session.user) {
        session.user.role = token.role
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
