import { NextResponse } from "next/server"
import { testConnection } from "@/lib/db/neon-client"
import prisma from "@/lib/db/neon-client"

export async function GET() {
  try {
    // Probar la conexión directa con el pool
    const poolConnected = await testConnection()

    if (!poolConnected) {
      return NextResponse.json({ error: "Error al conectar con la base de datos usando el pool" }, { status: 500 })
    }

    // Probar la conexión con Prisma
    await prisma.$connect()

    // Realizar una consulta simple para verificar que todo funciona
    const result = await prisma.$queryRaw`SELECT 1 as test`

    return NextResponse.json({
      success: true,
      message: "Conexión a la base de datos establecida correctamente",
      details: {
        poolConnected,
        prismaConnected: true,
        queryResult: result,
      },
    })
  } catch (error) {
    console.error("Error al verificar la conexión a la base de datos:", error)

    return NextResponse.json(
      {
        error: "Error al verificar la conexión a la base de datos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  } finally {
    // Asegurarse de desconectar Prisma
    await prisma.$disconnect()
  }
}
