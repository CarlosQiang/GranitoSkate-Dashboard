import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        // Credenciales por defecto para desarrollo
        const validCredentials = [
          { username: "admin", password: "admin123" },
          { username: "Carlos Qiang", password: "GranitoSkate" },
          { username: "carlos", password: "granito2024" },
        ]

        const user = validCredentials.find(
          (cred) =>
            (cred.username.toLowerCase() === credentials.username.toLowerCase() ||
              cred.username === credentials.username) &&
            cred.password === credentials.password,
        )

        if (user) {
          return {
            id: "1",
            name: user.username,
            email: `${user.username.toLowerCase().replace(" ", ".")}@granito.com`,
          }
        }

        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 horas
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name
        session.user.email = token.email as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Permite redirecciones relativas o al mismo origen
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Permite redirecciones al mismo origen
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "granito-secret-key-2024",
  debug: process.env.NODE_ENV === "development",
}
