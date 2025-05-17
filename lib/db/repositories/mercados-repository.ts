import { query } from "@/lib/db"
import type { Mercado } from "@/lib/db/schema"

// Funciones para mercados
export async function getAllMercados() {
  try {
    const result = await query(
      `SELECT * FROM mercados 
       ORDER BY es_principal DESC, nombre`,
    )

    return result.rows
  } catch (error) {
    console.error("Error getting all mercados:", error)
    throw error
  }
}

export async function getMercadoById(id: number) {
  try {
    const result = await query(
      `SELECT * FROM mercados 
       WHERE id = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error getting mercado with ID ${id}:`, error)
    throw error
  }
}

export async function getMercadoByShopifyId(shopifyId: string) {
  try {
    const result = await query(
      `SELECT * FROM mercados 
       WHERE shopify_id = $1`,
      [shopifyId],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error getting mercado with Shopify ID ${shopifyId}:`, error)
    throw error
  }
}

export async function getMercadoPrincipal() {
  try {
    const result = await query(
      `SELECT * FROM mercados 
       WHERE es_principal = true 
       LIMIT 1`,
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error("Error getting mercado principal:", error)
    throw error
  }
}

export async function createMercado(mercado: Partial<Mercado>) {
  try {
    const {
      shopify_id,
      nombre,
      activo,
      es_principal,
      moneda_codigo,
      moneda_simbolo,
      dominio,
      subfolder_sufijo,
      paises,
      idiomas,
    } = mercado

    // Si es principal, actualizar los demás mercados
    if (es_principal) {
      await query(
        `UPDATE mercados 
         SET es_principal = false`,
      )
    }

    const result = await query(
      `INSERT INTO mercados (
        shopify_id, nombre, activo, es_principal, moneda_codigo,
        moneda_simbolo, dominio, subfolder_sufijo, paises, idiomas
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      ) RETURNING *`,
      [
        shopify_id,
        nombre,
        activo !== undefined ? activo : false,
        es_principal !== undefined ? es_principal : false,
        moneda_codigo,
        moneda_simbolo,
        dominio,
        subfolder_sufijo,
        paises,
        idiomas ? JSON.stringify(idiomas) : null,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating mercado:", error)
    throw error
  }
}

export async function updateMercado(id: number, mercado: Partial<Mercado>) {
  try {
    // Si es principal, actualizar los demás mercados
    if (mercado.es_principal) {
      await query(
        `UPDATE mercados 
         SET es_principal = false 
         WHERE id != $1`,
        [id],
      )
    }

    // Construir dinámicamente la consulta de actualización
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Añadir cada campo a actualizar
    Object.entries(mercado).forEach(([key, value]) => {
      if (key !== "id" && value !== undefined) {
        // Manejar el caso especial de idiomas
        if (key === "idiomas" && value) {
          updates.push(`${key} = $${paramIndex}`)
          values.push(JSON.stringify(value))
        } else {
          updates.push(`${key} = $${paramIndex}`)
          values.push(value)
        }
        paramIndex++
      }
    })

    // Añadir fecha de actualización
    updates.push(`fecha_actualizacion = NOW()`)

    // Añadir el ID al final de los valores
    values.push(id)

    const result = await query(
      `UPDATE mercados 
       SET ${updates.join(", ")} 
       WHERE id = $${paramIndex} 
       RETURNING *`,
      values,
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error updating mercado with ID ${id}:`, error)
    throw error
  }
}

export async function deleteMercado(id: number) {
  try {
    // Verificar si es el mercado principal
    const mercado = await getMercadoById(id)
    if (mercado && mercado.es_principal) {
      throw new Error("No se puede eliminar el mercado principal")
    }

    const result = await query(
      `DELETE FROM mercados 
       WHERE id = $1 
       RETURNING id`,
      [id],
    )

    if (result.rows.length === 0) {
      return false
    }

    return true
  } catch (error) {
    console.error(`Error deleting mercado with ID ${id}:`, error)
    throw error
  }
}
