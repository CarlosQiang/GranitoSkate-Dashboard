import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getUserByIdentifier, verifyPassword, updateLastLogin } from "@/lib/auth-service"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Usuario o Email", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        const user = await getUserByIdentifier(credentials.identifier)

        if (!user) {
          return null
        }

        const isValidPassword = await verifyPassword(credentials.password, user.contrasena)

        if (!isValidPassword) {
          return null
        }

        // Actualizar último acceso
        await updateLastLogin(user.id)

        return {
          id: user.id.toString(),
          name: user.nombre_completo || user.nombre_usuario,
          email: user.correo_electronico,
          role: user.rol,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}
