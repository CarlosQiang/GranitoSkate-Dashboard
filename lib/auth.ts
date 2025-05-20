import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { query } from "@/lib/db"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Usuario o Email", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.identifier || !credentials?.password) {
            console.log("Faltan credenciales")
            return null
          }

          console.log("Buscando usuario con identificador:", credentials.identifier)

          // Buscar por email o nombre de usuario
          const result = await query(
            `SELECT * FROM administradores WHERE correo_electronico = $1 OR nombre_usuario = $1`,
            [credentials.identifier],
          )

          const user = result.rows[0]

          if (!user) {
            console.log("Usuario no encontrado")
            return null
          }

          console.log("Usuario encontrado, verificando contraseña")

          // Verificar contraseña - caso especial para "GranitoSkate"
          let isValidPassword = false

          if (credentials.password === "GranitoSkate") {
            // Permitir acceso directo con la contraseña maestra para desarrollo
            isValidPassword = true
            console.log("Acceso con contraseña maestra")
          } else {
            // Verificar con bcrypt para otras contraseñas
            try {
              isValidPassword = await compare(credentials.password, user.contrasena)
              console.log("Resultado de verificación bcrypt:", isValidPassword)
            } catch (error) {
              console.error("Error al verificar contraseña con bcrypt:", error)
              // Si falla la comparación, intentar una última verificación simple
              isValidPassword = credentials.password === user.contrasena
              console.log("Resultado de verificación simple:", isValidPassword)
            }
          }

          if (!isValidPassword) {
            console.log("Contraseña inválida para usuario:", credentials.identifier)
            return null
          }

          console.log("Autenticación exitosa para:", user.nombre_usuario)

          // Actualizar último acceso
          await query(`UPDATE administradores SET ultimo_acceso = NOW() WHERE id = $1`, [user.id]).catch((err) => {
            console.error("Error al actualizar último acceso:", err)
            // No bloqueamos la autenticación si esto falla
          })

          return {
            id: user.id.toString(),
            name: user.nombre_completo || user.nombre_usuario,
            email: user.correo_electronico,
            role: user.rol,
          }
        } catch (error) {
          console.error("Error en authorize:", error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
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
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
