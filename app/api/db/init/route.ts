import { NextResponse } from "next/server"
import { dbInitService } from "@/lib/services/db-init-service"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Verificar la conexión a la base de datos
    const conexion = await dbInitService.checkConnection()
    if (!conexion) {
      return NextResponse.json(
        {
          success: false,
          message: "No se pudo conectar a la base de datos",
        },
        { status: 500 },
      )
    }

    // Verificar si la base de datos ya está inicializada
    const inicializada = await dbInitService.isInitialized()

    // Verificar tablas existentes
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    const tableNames = tables.rows.map((row) => row.table_name)

    // Verificar si existen las tablas principales
    const requiredTables = [
      "administradores",
      "productos",
      "variantes_producto",
      "imagenes_producto",
      "colecciones",
      "productos_colecciones",
      "promociones",
      "mercados",
      "clientes",
      "direcciones_cliente",
      "pedidos",
      "lineas_pedido",
      "transacciones",
      "envios",
      "metadatos",
      "registro_sincronizacion",
    ]

    // Crear un objeto con el estado de cada tabla
    const tablasObj = {}
    requiredTables.forEach((tabla) => {
      tablasObj[tabla] = tableNames.includes(tabla)
    })

    const todasExisten = requiredTables.every((tabla) => tableNames.includes(tabla))

    return NextResponse.json({
      success: true,
      initialized: inicializada,
      tablas: tablasObj,
      todasExisten,
    })
  } catch (error) {
    console.error("Error al verificar la inicialización de la base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al verificar la inicialización de la base de datos",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    // Verificar la conexión a la base de datos
    const conexion = await dbInitService.checkConnection()
    if (!conexion) {
      return NextResponse.json(
        {
          success: false,
          message: "No se pudo conectar a la base de datos",
        },
        { status: 500 },
      )
    }

    // Verificar si la base de datos ya está inicializada
    const inicializada = await dbInitService.isInitialized()
    if (inicializada) {
      return NextResponse.json({
        success: true,
        message: "La base de datos ya está inicializada",
        initialized: true,
      })
    }

    // Inicializar la base de datos
    const resultado = await dbInitService.initialize()
    if (!resultado) {
      return NextResponse.json(
        {
          success: false,
          message: "Error al inicializar la base de datos",
        },
        { status: 500 },
      )
    }

    // Crear administrador por defecto
    const adminCreado = await dbInitService.createDefaultAdmin()

    return NextResponse.json({
      success: true,
      message: "Base de datos inicializada correctamente",
      adminCreated: adminCreado,
    })
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al inicializar la base de datos",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
