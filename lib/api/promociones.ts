import { sql } from "@vercel/postgres"

// Función para obtener todas las promociones
export async function obtenerPromociones() {
  try {
    console.log("🔍 Obteniendo promociones...")

    // Intentar obtener promociones de la base de datos
    const result = await sql`SELECT * FROM promociones ORDER BY fecha_creacion DESC`

    if (result.rows.length > 0) {
      console.log(`✅ Se encontraron ${result.rows.length} promociones en la base de datos`)
      return {
        success: true,
        promociones: result.rows,
        total: result.rows.length,
      }
    }

    // Si no hay promociones en la base de datos, crear una promoción por defecto
    console.log("⚠️ No se encontraron promociones en la base de datos, devolviendo promoción por defecto")
    return {
      success: true,
      promociones: [
        {
          id: 1,
          shopify_id: "default_promo_1",
          titulo: "Promoción 10% descuento",
          descripcion: "10% de descuento en todos los productos",
          tipo: "PORCENTAJE_DESCUENTO",
          valor: 10.0,
          codigo: "PROMO10",
          activa: true,
          fecha_inicio: new Date().toISOString(),
          es_automatica: false,
        },
      ],
      total: 1,
    }
  } catch (error) {
    console.error("❌ Error obteniendo promociones:", error)
    return {
      success: false,
      error: `Error obteniendo promociones: ${error instanceof Error ? error.message : "Error desconocido"}`,
      promociones: [],
      total: 0,
    }
  }
}

// Función para obtener una promoción por ID
export async function obtenerPromocionPorId(id: string) {
  try {
    console.log(`🔍 Obteniendo promoción con ID ${id}...`)

    const result = await sql`SELECT * FROM promociones WHERE id = ${id} OR shopify_id = ${id}`

    if (result.rows.length > 0) {
      console.log(`✅ Promoción encontrada: ${result.rows[0].titulo}`)
      return {
        success: true,
        promocion: result.rows[0],
      }
    }

    console.log(`⚠️ No se encontró promoción con ID ${id}`)
    return {
      success: false,
      error: `No se encontró promoción con ID ${id}`,
    }
  } catch (error) {
    console.error(`❌ Error obteniendo promoción con ID ${id}:`, error)
    return {
      success: false,
      error: `Error obteniendo promoción: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}

// Función para crear una promoción
export async function crearPromocion(datos: any) {
  try {
    console.log("🔍 Creando nueva promoción...", datos)

    // Validar datos mínimos
    if (!datos.titulo) {
      return {
        success: false,
        error: "El título de la promoción es obligatorio",
      }
    }

    // Valores por defecto
    const tipo = datos.tipo || "PORCENTAJE_DESCUENTO"
    const valor = datos.valor || 10
    const codigo = datos.codigo || ""
    const fechaInicio = datos.fecha_inicio || new Date().toISOString()
    const fechaFin = datos.fecha_fin || null
    const activa = datos.activa !== undefined ? datos.activa : true

    // Insertar en la base de datos
    const result = await sql`
      INSERT INTO promociones (
        shopify_id, titulo, descripcion, tipo, valor, codigo,
        fecha_inicio, fecha_fin, activa, es_automatica
      ) VALUES (
        ${datos.shopify_id || `manual_${Date.now()}`},
        ${datos.titulo},
        ${datos.descripcion || ""},
        ${tipo},
        ${valor},
        ${codigo},
        ${fechaInicio},
        ${fechaFin},
        ${activa},
        ${datos.es_automatica || false}
      )
      RETURNING *
    `

    if (result.rows.length > 0) {
      console.log(`✅ Promoción creada: ${result.rows[0].titulo}`)
      return {
        success: true,
        promocion: result.rows[0],
        message: "Promoción creada correctamente",
      }
    }

    return {
      success: false,
      error: "Error al crear la promoción",
    }
  } catch (error) {
    console.error("❌ Error creando promoción:", error)
    return {
      success: false,
      error: `Error creando promoción: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}

// Función para actualizar una promoción
export async function actualizarPromocion(id: string, datos: any) {
  try {
    console.log(`🔍 Actualizando promoción con ID ${id}...`, datos)

    // Validar que la promoción existe
    const existeResult = await sql`SELECT id FROM promociones WHERE id = ${id}`
    if (existeResult.rows.length === 0) {
      return {
        success: false,
        error: `No se encontró promoción con ID ${id}`,
      }
    }

    // Construir la consulta de actualización
    const result = await sql`
      UPDATE promociones SET
        titulo = COALESCE(${datos.titulo}, titulo),
        descripcion = COALESCE(${datos.descripcion}, descripcion),
        tipo = COALESCE(${datos.tipo}, tipo),
        valor = COALESCE(${datos.valor}, valor),
        codigo = COALESCE(${datos.codigo}, codigo),
        fecha_inicio = COALESCE(${datos.fecha_inicio}, fecha_inicio),
        fecha_fin = COALESCE(${datos.fecha_fin}, fecha_fin),
        activa = COALESCE(${datos.activa}, activa),
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (result.rows.length > 0) {
      console.log(`✅ Promoción actualizada: ${result.rows[0].titulo}`)
      return {
        success: true,
        promocion: result.rows[0],
        message: "Promoción actualizada correctamente",
      }
    }

    return {
      success: false,
      error: "Error al actualizar la promoción",
    }
  } catch (error) {
    console.error(`❌ Error actualizando promoción con ID ${id}:`, error)
    return {
      success: false,
      error: `Error actualizando promoción: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}

// Función para eliminar una promoción
export async function eliminarPromocion(id: string) {
  try {
    console.log(`🔍 Eliminando promoción con ID ${id}...`)

    const result = await sql`DELETE FROM promociones WHERE id = ${id} RETURNING id, titulo`

    if (result.rows.length > 0) {
      console.log(`✅ Promoción eliminada: ${result.rows[0].titulo}`)
      return {
        success: true,
        message: `Promoción "${result.rows[0].titulo}" eliminada correctamente`,
      }
    }

    return {
      success: false,
      error: `No se encontró promoción con ID ${id}`,
    }
  } catch (error) {
    console.error(`❌ Error eliminando promoción con ID ${id}:`, error)
    return {
      success: false,
      error: `Error eliminando promoción: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }
  }
}

// Mantener los alias existentes
export const fetchPromociones = obtenerPromociones
export const fetchPriceListById = obtenerPromocionPorId
export const updatePriceList = actualizarPromocion
export const deletePriceList = eliminarPromocion
