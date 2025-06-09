import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST() {
  try {
    console.log("🔄 Iniciando reemplazo completo de promociones...")

    // 1. Verificar que la tabla existe
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
      console.log("✅ Tabla promociones verificada/creada")
    } catch (tableError) {
      console.error("❌ Error verificando tabla promociones:", tableError)
      // Continuamos de todos modos, podría ser un error de permisos
    }

    // 2. Obtener promociones de Shopify usando la API interna
    console.log("📡 Obteniendo promociones de Shopify...")

    // Usar URL relativa para evitar problemas de CORS en producción
    const shopifyResponse = await fetch(`/api/shopify/promotions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!shopifyResponse.ok) {
      throw new Error(`Error al obtener promociones de Shopify: ${shopifyResponse.status}`)
    }

    const shopifyData = await shopifyResponse.json()

    // Verificar la estructura de la respuesta
    if (!shopifyData || !shopifyData.promotions) {
      console.warn("⚠️ Respuesta de Shopify sin promociones o con formato incorrecto:", shopifyData)
      return NextResponse.json({
        success: true,
        message: "No se encontraron promociones para sincronizar",
        results: {
          borrados: 0,
          insertados: 0,
          errores: 0,
          detalles: [],
        },
        totalEnBD: 0,
      })
    }

    const promociones = shopifyData.promotions || []
    console.log(`📊 Promociones obtenidas de Shopify: ${promociones.length}`)

    // 3. Borrar todas las promociones existentes
    console.log("🗑️ Borrando promociones existentes...")
    const deleteResult = await query("DELETE FROM promociones")
    const borrados = deleteResult.rowCount || 0
    console.log(`✅ ${borrados} promociones borradas`)

    let insertados = 0
    let errores = 0
    const detalles = []

    // 4. Insertar las nuevas promociones
    for (const promocion of promociones) {
      try {
        console.log(`💾 Insertando promoción: ${promocion.title}`)

        // Preparar los datos para insertar
        const insertData = {
          shopify_id: promocion.id || null,
          titulo: promocion.title || "Sin título",
          descripcion: promocion.summary || "",
          tipo: promocion.discountClass === "PERCENTAGE" ? "PERCENTAGE_DISCOUNT" : "FIXED_AMOUNT_DISCOUNT",
          valor: Number.parseFloat(promocion.value || "0"),
          codigo: promocion.codes && promocion.codes.length > 0 ? promocion.codes[0].code : null,
          fecha_inicio: promocion.startsAt ? new Date(promocion.startsAt) : null,
          fecha_fin: promocion.endsAt ? new Date(promocion.endsAt) : null,
          activa: promocion.status === "ACTIVE",
          estado: promocion.status || "ACTIVE",
          limite_uso: promocion.usageLimit || null,
          contador_uso: promocion.asyncUsageCount || 0,
          es_automatica: false,
        }

        // Insertar en la base de datos
        const result = await query(
          `INSERT INTO promociones (
            shopify_id, titulo, descripcion, tipo, valor, codigo,
            fecha_inicio, fecha_fin, activa, estado, limite_uso, contador_uso, es_automatica
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
          RETURNING id`,
          [
            insertData.shopify_id,
            insertData.titulo,
            insertData.descripcion,
            insertData.tipo,
            insertData.valor,
            insertData.codigo,
            insertData.fecha_inicio,
            insertData.fecha_fin,
            insertData.activa,
            insertData.estado,
            insertData.limite_uso,
            insertData.contador_uso,
            insertData.es_automatica,
          ],
        )

        if (result.rows.length > 0) {
          insertados++
          console.log(`✅ Promoción insertada: ${insertData.titulo} (ID: ${result.rows[0].id})`)
          detalles.push({
            shopify_id: insertData.shopify_id,
            titulo: insertData.titulo,
            resultado: "insertado",
          })
        }
      } catch (error) {
        errores++
        console.error(`❌ Error insertando promoción:`, error)
        detalles.push({
          shopify_id: promocion.id,
          titulo: promocion.title,
          resultado: "error",
          error: error.message,
        })
      }
    }

    // 5. Verificar el resultado final
    const finalCountResult = await query("SELECT COUNT(*) as total FROM promociones")
    const totalEnBD = Number.parseInt(finalCountResult.rows[0].total)

    console.log(`✅ Reemplazo completo finalizado: ${borrados} borrados, ${insertados} insertados, ${errores} errores`)
    console.log(`📊 Total de promociones en BD: ${totalEnBD}`)

    return NextResponse.json({
      success: true,
      message: `Reemplazo completo finalizado: ${borrados} borrados, ${insertados} insertados, ${errores} errores`,
      results: {
        borrados,
        insertados,
        errores,
        detalles,
      },
      totalEnBD,
    })
  } catch (error) {
    console.error("❌ Error en reemplazo de promociones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error en el reemplazo de promociones",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
