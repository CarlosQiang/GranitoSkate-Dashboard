import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Verificar conexión a la base de datos
    const result = await prisma.$queryRaw`SELECT NOW() as time`

    // Verificar si existe la tabla de administradores
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'administradores'
      ) as exists
    `

    // Verificar si existe el usuario admin
    let adminExists = false
    let adminData = null

    if ((tableExists as any)[0].exists) {
      const adminUser = await prisma.administradores.findFirst({
        where: {
          nombre_usuario: "admin",
        },
      })

      adminExists = !!adminUser
      adminData = adminUser
        ? {
            id: adminUser.id,
            nombre_usuario: adminUser.nombre_usuario,
            correo_electronico: adminUser.correo_electronico,
            activo: adminUser.activo,
            rol: adminUser.rol,
          }
        : null
    }

    return NextResponse.json({
      status: "success",
      connection: {
        connected: true,
        time: result,
      },
      database: {
        tableExists: (tableExists as any)[0].exists,
        adminExists,
        adminData,
      },
      environment: {
        DATABASE_URL: process.env.DATABASE_URL ? "***configurado***" : "no configurado",
        POSTGRES_URL: process.env.POSTGRES_URL ? "***configurado***" : "no configurado",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "***configurado***" : "no configurado",
        NODE_ENV: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error("Error al verificar la base de datos:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Error desconocido",
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    )
  }
}
