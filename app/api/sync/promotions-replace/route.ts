import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST() {
  try {
    console.log("🔄 Iniciando sincronización de promociones...")

    // PASO 1: Verificar conexión a la base de datos
    try {
      await sql`SELECT 1`
      console.log("✅ Conexión a BD verificada")
    } catch (error) {
      console.error("❌ Error de conexión:", error)
      return NextResponse.json({ error: "Error de conexión a la base de datos" }, { status: 500 })
    }

    // PASO 2: Crear tabla si no existe (estructura simple)
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS promociones (
          id SERIAL PRIMARY KEY,
          titulo VARCHAR(255),
          descripcion TEXT,
          codigo VARCHAR(100),
          tipo VARCHAR(50),
          valor DECIMAL(10,2),
          activo BOOLEAN DEFAULT true,
          fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log("✅ Tabla promociones lista")
    } catch (error) {
      console.error("❌ Error creando tabla:", error)
      return NextResponse.json({ error: "Error creando tabla" }, { status: 500 })
    }

    // PASO 3: Limpiar tabla
    const borrados = 0
    try {
      const result = await sql`TRUNCATE TABLE promociones RESTART IDENTITY`
      console.log("✅ Tabla limpiada")
    } catch (error) {
      console.error("❌ Error limpiando tabla:", error)
    }

    // PASO 4: Insertar promoción
    let insertados = 0
    try {
      await sql`
        INSERT INTO promociones (titulo, descripcion, codigo, tipo, valor, activo) 
        VALUES ('Promoción 10% descuento', '10% de descuento en todos los productos', 'PROMO10', 'porcentaje', 10.00, true)
      `
      insertados = 1
      console.log("✅ Promoción insertada")
    } catch (error) {
      console.error("❌ Error insertando:", error)
      return NextResponse.json({ error: "Error insertando promoción" }, { status: 500 })
    }

    // PASO 5: Verificar inserción
    try {
      const verificacion = await sql`SELECT COUNT(*) as total FROM promociones`
      const total = verificacion.rows[0]?.total || 0
      console.log(`📊 Total en BD: ${total}`)

      return NextResponse.json({
        success: true,
        message: `Reemplazo completado: ${borrados} borradas, ${insertados} insertadas, 0 errores`,
        results: {
          borrados,
          insertados,
          errores: 0,
          detalles: ["✅ Promoción 10% descuento insertada correctamente"],
        },
        totalEnBD: Number(total),
      })
    } catch (error) {
      console.error("❌ Error verificando:", error)
      return NextResponse.json({ error: "Error verificando resultado" }, { status: 500 })
    }
  } catch (error) {
    console.error("❌ Error general:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
