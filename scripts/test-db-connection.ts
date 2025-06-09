import { query } from "../lib/db"

async function testDatabaseConnection() {
  try {
    console.log("🔍 Probando conexión a la base de datos...")

    // Probar una consulta simple
    const result = await query("SELECT NOW() as time")

    console.log("✅ Conexión exitosa a la base de datos")
    console.log(`📅 Hora del servidor: ${result.rows[0].time}`)

    // Verificar tablas existentes
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    console.log(`📊 Tablas encontradas: ${tablesResult.rowCount}`)
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`)
    })

    // Verificar específicamente la tabla promociones
    try {
      const promocionesResult = await query("SELECT COUNT(*) as count FROM promociones")
      console.log(`📊 Registros en tabla promociones: ${promocionesResult.rows[0].count}`)
    } catch (error) {
      console.error("❌ Error al verificar tabla promociones:", error.message)
      console.log("🔧 Intentando crear la tabla promociones...")

      try {
        await query(`
          CREATE TABLE IF NOT EXISTS promociones (
            id SERIAL PRIMARY KEY,
            shopify_id VARCHAR(255),
            titulo VARCHAR(255) NOT NULL,
            descripcion TEXT,
            tipo VARCHAR(50) DEFAULT 'PERCENTAGE_DISCOUNT',
            valor DECIMAL(10, 2) NOT NULL,
            codigo VARCHAR(100),
            fecha_inicio TIMESTAMP,
            fecha_fin TIMESTAMP,
            activa BOOLEAN DEFAULT true,
            estado VARCHAR(50) DEFAULT 'ACTIVE',
            compra_minima DECIMAL(10, 2),
            limite_uso INTEGER,
            contador_uso INTEGER DEFAULT 0,
            es_automatica BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `)
        console.log("✅ Tabla promociones creada exitosamente")
      } catch (createError) {
        console.error("❌ Error al crear tabla promociones:", createError.message)
      }
    }
  } catch (error) {
    console.error("❌ Error de conexión a la base de datos:", error)
  }
}

testDatabaseConnection()
