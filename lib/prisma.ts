import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Función para verificar la conexión a la base de datos
export async function checkDatabaseConnection() {
  try {
    // Intentar ejecutar una consulta simple
    await prisma.$queryRaw`SELECT 1`
    console.log("✅ Conexión a la base de datos establecida correctamente")
    return true
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error)
    return false
  }
}

export default prisma
