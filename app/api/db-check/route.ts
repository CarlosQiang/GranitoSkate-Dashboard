import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Intentar conexión con @vercel/postgres
    console.log("Intentando conexión con @vercel/postgres...")
    const vercelResult = await sql`SELECT NOW() as time`

    // Intentar conexión con Prisma
    console.log("Intentando conexión con Prisma...")
    const prismaResult = await prisma.$queryRaw`SELECT NOW() as time`

    // Verificar tablas existentes
    console.log("Verificando tablas existentes...")
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    // Verificar si existe la tabla de administradores
    console.log("Verificando tabla de administradores...")
    const adminTable = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'administradores'
      ) as exists
    `

    // Verificar si existe el usuario admin
    console.log("Verificando usuario admin...")
    let adminExists = false
    let adminData = null

    if ((adminTable as any)[0].exists) {
      const adminUser = await prisma.$queryRaw`
        SELECT id, nombre_usuario, correo_electronico, activo 
        FROM administradores 
        WHERE nombre_usuario = 'admin'
      `
      adminExists = (adminUser as any[]).length > 0
      adminData = adminExists ? (adminUser as any)[0] : null
    }

    return NextResponse.json({
      status: "success",
      vercelConnection: {
        connected: true,
        time: vercelResult.rows[0].time,
      },
      prismaConnection: {
        connected: true,
        time: prismaResult,
      },
      database: {
        tables: tables,
        adminTableExists: (adminTable as any)[0].exists,
        adminUserExists: adminExists,
        adminUser: adminData,
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
