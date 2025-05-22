import { PrismaClient } from "@prisma/client"

// Evitar múltiples instancias de Prisma Client en desarrollo
// https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

let prisma: PrismaClient

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma

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
