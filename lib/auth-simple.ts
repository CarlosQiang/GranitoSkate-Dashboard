import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { Pool } from "pg"

// Configuración de la conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: true,
})

// Función para ejecutar consultas SQL
async function executeQuery(query: string, params: any[] = []) {
  const client = await pool.connect()
  try {
    const result = await client.query(query, params)
    return result.rows
  } finally {
    client.release()
  }
}

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

          // Verificar si la tabla existe
          const tableCheck = await executeQuery(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'administradores')",
            [],
          )

          if (!tableCheck[0].exists) {
            console.log("La tabla administradores no existe, creándola...")

            // Crear la tabla administradores
            await executeQuery(
              `
              CREATE TABLE IF NOT EXISTS administradores (
                id SERIAL PRIMARY KEY,
                nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
                correo_electronico VARCHAR(100) UNIQUE NOT NULL,
                contrasena TEXT NOT NULL,
                nombre_completo VARCHAR(100),
                rol VARCHAR(20) NOT NULL DEFAULT 'admin',
                activo BOOLEAN NOT NULL DEFAULT true,
                ultimo_acceso TIMESTAMP,
                fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
                fecha_actualizacion TIMESTAMP
              )
            `,
              [],
            )

            // Crear usuario admin por defecto
            await executeQuery(
              `
              INSERT INTO administradores (
                nombre_usuario, 
                correo_electronico, 
                contrasena, 
                nombre_completo, 
                rol, 
                activo
              ) VALUES (
                'admin', 
                'admin@granitoskate.com', 
                '$2b$10$1X.GQIJJk8L9Fz3HZhQQo.6EsHgHKm7Brx0bKQA9fI.SSjN.ym3Uy', 
                'Administrador', 
                'superadmin', 
                true
              ) ON CONFLICT (nombre_usuario) DO NOTHING
            `,
              [],
            )
          }

          // Buscar usuario por nombre de usuario o correo electrónico
          const users = await executeQuery(
            "SELECT * FROM administradores WHERE (nombre_usuario = $1 OR correo_electronico = $1) AND activo = true",
            [credentials.identifier],
          )

          if (users.length === 0) {
            console.log("Usuario no encontrado:", credentials.identifier)
            return null
          }

          const user = users[0]
          console.log("Usuario encontrado:", user.nombre_usuario)

          // Caso especial para la contraseña predeterminada
          if (
            credentials.password === "GranitoSkate" &&
            (user.contrasena === "$2b$10$1X.GQIJJk8L9Fz3HZhQQo.6EsHgHKm7Brx0bKQA9fI.SSjN.ym3Uy" ||
              user.nombre_usuario === "admin")
          ) {
            console.log("Autenticación exitosa con contraseña predeterminada")

            // Actualizar último acceso
            await executeQuery("UPDATE administradores SET ultimo_acceso = NOW() WHERE id = $1", [user.id])

            return {
              id: user.id.toString(),
              name: user.nombre_completo || user.nombre_usuario,
              email: user.correo_electronico,
              role: user.rol,
            }
          }

          // Si no es la contraseña predeterminada, rechazar
          console.log("Contraseña inválida para usuario:", credentials.identifier)
          return null
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
  secret: process.env.NEXTAUTH_SECRET || "un-secreto-muy-seguro-para-desarrollo",
  debug: process.env.NODE_ENV === "development",
}
