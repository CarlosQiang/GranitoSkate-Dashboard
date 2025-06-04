import { query } from "@/lib/db"

export interface SeoMetadata {
  id?: number
  tipo_entidad: string
  id_entidad: string
  titulo: string
  descripcion: string
  palabras_clave: string[]
  datos_adicionales?: any
  fecha_creacion?: Date
  fecha_actualizacion?: Date
}

export interface ConfiguracionTienda {
  id?: number
  nombre_tienda: string
  url_tienda: string
  clave_api: string
  secreto_api: string
  token_acceso: string
  activo: boolean
  datos_seo?: any
  datos_negocio_local?: any
  redes_sociales?: any
  fecha_creacion?: Date
  fecha_actualizacion?: Date
}

// Funciones para metadatos SEO
export async function obtenerMetadatosSeo(tipoEntidad: string, idEntidad: string): Promise<SeoMetadata | null> {
  try {
    const result = await query(
      `SELECT * FROM metadatos_seo 
       WHERE tipo_entidad = $1 AND id_entidad = $2 
       ORDER BY fecha_actualizacion DESC 
       LIMIT 1`,
      [tipoEntidad, idEntidad],
    )

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      id: row.id,
      tipo_entidad: row.tipo_entidad,
      id_entidad: row.id_entidad,
      titulo: row.titulo,
      descripcion: row.descripcion,
      palabras_clave: Array.isArray(row.palabras_clave) ? row.palabras_clave : [],
      datos_adicionales: row.datos_adicionales,
      fecha_creacion: row.fecha_creacion,
      fecha_actualizacion: row.fecha_actualizacion,
    }
  } catch (error) {
    console.error(`Error al obtener metadatos SEO para ${tipoEntidad}:${idEntidad}:`, error)
    return null
  }
}

export async function guardarMetadatosSeo(metadata: Omit<SeoMetadata, "id">): Promise<boolean> {
  try {
    // Verificar si ya existe
    const existente = await obtenerMetadatosSeo(metadata.tipo_entidad, metadata.id_entidad)

    if (existente) {
      // Actualizar existente
      await query(
        `UPDATE metadatos_seo 
         SET titulo = $1, descripcion = $2, palabras_clave = $3, datos_adicionales = $4, fecha_actualizacion = NOW()
         WHERE tipo_entidad = $5 AND id_entidad = $6`,
        [
          metadata.titulo,
          metadata.descripcion,
          JSON.stringify(metadata.palabras_clave),
          metadata.datos_adicionales ? JSON.stringify(metadata.datos_adicionales) : null,
          metadata.tipo_entidad,
          metadata.id_entidad,
        ],
      )
    } else {
      // Crear nuevo
      await query(
        `INSERT INTO metadatos_seo (tipo_entidad, id_entidad, titulo, descripcion, palabras_clave, datos_adicionales)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          metadata.tipo_entidad,
          metadata.id_entidad,
          metadata.titulo,
          metadata.descripcion,
          JSON.stringify(metadata.palabras_clave),
          metadata.datos_adicionales ? JSON.stringify(metadata.datos_adicionales) : null,
        ],
      )
    }

    return true
  } catch (error) {
    console.error("Error al guardar metadatos SEO:", error)
    return false
  }
}

// Funciones para configuración de la tienda
export async function obtenerConfiguracionTienda(): Promise<ConfiguracionTienda | null> {
  try {
    const result = await query(
      `SELECT * FROM configuracion_shopify 
       WHERE activo = true 
       ORDER BY fecha_actualizacion DESC 
       LIMIT 1`,
    )

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      id: row.id,
      nombre_tienda: row.nombre_tienda,
      url_tienda: row.url_tienda,
      clave_api: row.clave_api,
      secreto_api: row.secreto_api,
      token_acceso: row.token_acceso,
      activo: row.activo,
      datos_seo: row.datos_seo,
      datos_negocio_local: row.datos_negocio_local,
      redes_sociales: row.redes_sociales,
      fecha_creacion: row.fecha_creacion,
      fecha_actualizacion: row.fecha_actualizacion,
    }
  } catch (error) {
    console.error("Error al obtener configuración de la tienda:", error)
    return null
  }
}

export async function guardarConfiguracionTienda(config: Partial<ConfiguracionTienda>): Promise<boolean> {
  try {
    const existente = await obtenerConfiguracionTienda()

    if (existente) {
      // Actualizar existente
      const updates: string[] = []
      const values: any[] = []
      let paramIndex = 1

      Object.entries(config).forEach(([key, value]) => {
        if (key !== "id" && value !== undefined) {
          updates.push(`${key} = $${paramIndex}`)
          values.push(typeof value === "object" ? JSON.stringify(value) : value)
          paramIndex++
        }
      })

      updates.push(`fecha_actualizacion = NOW()`)
      values.push(existente.id)

      await query(
        `UPDATE configuracion_shopify 
         SET ${updates.join(", ")} 
         WHERE id = $${paramIndex}`,
        values,
      )
    } else {
      // Crear nuevo
      await query(
        `INSERT INTO configuracion_shopify (
          nombre_tienda, url_tienda, clave_api, secreto_api, token_acceso, activo,
          datos_seo, datos_negocio_local, redes_sociales
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          config.nombre_tienda || "",
          config.url_tienda || "",
          config.clave_api || "",
          config.secreto_api || "",
          config.token_acceso || "",
          config.activo !== undefined ? config.activo : true,
          config.datos_seo ? JSON.stringify(config.datos_seo) : null,
          config.datos_negocio_local ? JSON.stringify(config.datos_negocio_local) : null,
          config.redes_sociales ? JSON.stringify(config.redes_sociales) : null,
        ],
      )
    }

    return true
  } catch (error) {
    console.error("Error al guardar configuración de la tienda:", error)
    return false
  }
}

export async function sincronizarSeoConShopify(tipoEntidad: string, idEntidad: string): Promise<boolean> {
  try {
    // Obtener metadatos locales
    const metadatos = await obtenerMetadatosSeo(tipoEntidad, idEntidad)

    if (!metadatos) {
      console.warn(`No se encontraron metadatos para ${tipoEntidad}:${idEntidad}`)
      return false
    }

    // Aquí implementarías la lógica para enviar los metadatos a Shopify
    // usando la API de metafields de Shopify

    console.log(`Sincronizando SEO para ${tipoEntidad}:${idEntidad} con Shopify`)

    return true
  } catch (error) {
    console.error("Error al sincronizar SEO con Shopify:", error)
    return false
  }
}
