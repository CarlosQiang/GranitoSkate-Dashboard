import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Probando conexión a la base de datos...")

    // Test 1: Verificar conexión básica
    const connectionTest = await sql`SELECT NOW() as current_time`
    console.log("✅ Conexión básica exitosa:", connectionTest.rows[0])

    // Test 2: Verificar que las tablas existen
    const tablesTest = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('productos', 'pedidos', 'colecciones', 'administradores')
      ORDER BY table_name
    `
    console.log("📋 Tablas encontradas:", tablesTest.rows)

    // Test 3: Contar registros en cada tabla
    const productosCount = await sql`SELECT COUNT(*) as count FROM productos`
    const pedidosCount = await sql`SELECT COUNT(*) as count FROM pedidos`
    const coleccionesCount = await sql`SELECT COUNT(*) as count FROM colecciones`
    const administradoresCount = await sql`SELECT COUNT(*) as count FROM administradores`

    console.log("📊 Conteos de registros:")
    console.log("- Productos:", productosCount.rows[0].count)
    console.log("- Pedidos:", pedidosCount.rows[0].count)
    console.log("- Colecciones:", coleccionesCount.rows[0].count)
    console.log("- Administradores:", administradoresCount.rows[0].count)

    // Test 4: Insertar un registro de prueba
    const testInsert = await sql`
      INSERT INTO registros_actividad (accion, tipo_entidad, resultado, descripcion, creado_en)
      VALUES ('test', 'conexion', 'exitoso', 'Prueba de conexión desde API', NOW())
      RETURNING id
    `
    console.log("✅ Inserción de prueba exitosa:", testInsert.rows[0])

    return NextResponse.json({
      success: true,
      mensaje: "Conexión a la base de datos verificada exitosamente",
      datos: {
        conexion: connectionTest.rows[0],
        tablas: tablesTest.rows,
        conteos: {
          productos: productosCount.rows[0].count,
          pedidos: pedidosCount.rows[0].count,
          colecciones: coleccionesCount.rows[0].count,
          administradores: administradoresCount.rows[0].count,
        },
        pruebaInsercion: testInsert.rows[0],
      },
    })
  } catch (error) {
    console.error("❌ Error en la prueba de conexión:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error en la conexión a la base de datos",
        mensaje: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
