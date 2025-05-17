import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Intentar obtener un usuario para verificar la conexión
    const user = await prisma.administradores.findFirst()

    return NextResponse.json({
      success: true,
      message: "Conexión a la base de datos exitosa",
      userFound: !!user,
    })
  } catch (error) {
    console.error("Error al verificar la conexión:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
