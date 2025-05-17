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
    console.log("Verificando conexión a la base de datos...")

    // Intentar ejecutar una consulta simple
    const result = await prisma.$queryRaw`SELECT 1 as connected`
    console.log("✅ Conexión a la base de datos establecida correctamente:", result)

    return {
      connected: true,
      result,
    }
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

export default prisma
