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
        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com"
        const adminPassword = process.env.ADMIN_PASSWORD || "password"

        if (credentials?.email === adminEmail && credentials?.password === adminPassword) {
          return {
            id: "1",
            name: "Admin",
            email: adminEmail,
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
        session.user.role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "un_secreto_seguro_por_defecto",
})

export { handler as GET, handler as POST }
