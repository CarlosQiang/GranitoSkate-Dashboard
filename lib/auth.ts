import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import { compare } from "bcryptjs"

const prisma = new PrismaClient()

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
            console.log("Credenciales incompletas")
            return null
          }

          console.log("Buscando usuario:", credentials.identifier)

          // Verificar si estamos en modo de desarrollo y usar credenciales de prueba
          if (
            process.env.NODE_ENV === "development" &&
            credentials.identifier === "admin" &&
            credentials.password === "GranitoSkate"
          ) {
            console.log("Usando credenciales de desarrollo")
            return {
              id: "1",
              name: "Administrador",
              email: "admin@granitoskate.com",
              role: "admin",
            }
          }

          // Buscar usuario por nombre de usuario o correo electrónico
          const user = await prisma.administradores
            .findFirst({
              where: {
                OR: [{ nombre_usuario: credentials.identifier }, { correo_electronico: credentials.identifier }],
                activo: true,
              },
            })
            .catch((err) => {
              console.error("Error al buscar usuario en la base de datos:", err)
              return null
            })

          if (!user) {
            console.log("Usuario no encontrado:", credentials.identifier)
            return null
          }

          console.log("Usuario encontrado:", user.nombre_usuario)

          // Verificar contraseña - caso especial para "GranitoSkate"
          let isValidPassword = false

          if (credentials.password === "GranitoSkate") {
            // Permitir acceso directo con la contraseña maestra
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
          await prisma.administradores
            .update({
              where: { id: user.id },
              data: { ultimo_acceso: new Date() },
            })
            .catch((err) => {
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
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET || "tu_secreto_aqui",
  debug: process.env.NODE_ENV === "development",
}
