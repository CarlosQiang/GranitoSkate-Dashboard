import { PrismaClient } from "@prisma/client"

// Evitar múltiples instancias de Prisma Client en desarrollo
// https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

let prismaGlobal: PrismaClient

if (process.env.NODE_ENV === "production") {
  prismaGlobal = new PrismaClient()
} else {
  if (!(global as any).prisma) {
    ;(global as any).prisma = new PrismaClient()
  }
  prismaGlobal = (global as any).prisma
}

export const prisma = prismaGlobal

// Función para verificar la conexión a la base de datos
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    // Realizar una consulta simple para verificar la conexión
    await prisma.$queryRaw`SELECT 1 as connected`
    return { connected: true, message: "Conexión exitosa a la base de datos" }
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error)
    return {
      connected: false,
      message: error instanceof Error ? error.message : "Error desconocido al conectar con la base de datos",
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  } finally {
    await prisma.$disconnect()
  }
}

export default prisma
