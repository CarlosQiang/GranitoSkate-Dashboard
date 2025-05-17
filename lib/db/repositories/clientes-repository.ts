import { query } from "@/lib/db"
import type { Cliente, DireccionCliente } from "@/lib/db/schema"

// Funciones para clientes
export async function getAllClientes() {
  try {
    const result = await query(
      `SELECT * FROM clientes 
       ORDER BY fecha_creacion DESC`,
    )

    return result.rows
  } catch (error) {
    console.error("Error getting all clientes:", error)
    throw error
  }
}

export async function getClienteById(id: number) {
  try {
    const result = await query(
      `SELECT * FROM clientes 
       WHERE id = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error getting cliente with ID ${id}:`, error)
    throw error
  }
}

export async function getClienteByShopifyId(shopifyId: string) {
  try {
    const result = await query(
      `SELECT * FROM clientes 
       WHERE shopify_id = $1`,
      [shopifyId],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error getting cliente with Shopify ID ${shopifyId}:`, error)
    throw error
  }
}

export async function getClienteByEmail(email: string) {
  try {
    const result = await query(
      `SELECT * FROM clientes 
       WHERE email = $1`,
      [email],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error getting cliente with email ${email}:`, error)
    throw error
  }
}

export async function createCliente(cliente: Partial<Cliente>) {
  try {
    const {
      shopify_id,
      email,
      nombre,
      apellidos,
      telefono,
      acepta_marketing,
      notas,
      etiquetas,
      total_pedidos,
      total_gastado,
      estado,
    } = cliente

    const result = await query(
      `INSERT INTO clientes (
        shopify_id, email, nombre, apellidos, telefono,
        acepta_marketing, notas, etiquetas, total_pedidos,
        total_gastado, estado
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *`,
      [
        shopify_id,
        email,
        nombre,
        apellidos,
        telefono,
        acepta_marketing !== undefined ? acepta_marketing : false,
        notas,
        etiquetas,
        total_pedidos || 0,
        total_gastado || 0,
        estado,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating cliente:", error)
    throw error
  }
}

export async function updateCliente(id: number, cliente: Partial<Cliente>) {
  try {
    // Construir dinámicamente la consulta de actualización
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Añadir cada campo a actualizar
    Object.entries(cliente).forEach(([key, value]) => {
      if (key !== "id" && value !== undefined) {
        updates.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    // Añadir fecha de actualización
    updates.push(`fecha_actualizacion = NOW()`)

    // Añadir el ID al final de los valores
    values.push(id)

    const result = await query(
      `UPDATE clientes 
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
    console.error(`Error updating cliente with ID ${id}:`, error)
    throw error
  }
}

export async function deleteCliente(id: number) {
  try {
    const result = await query(
      `DELETE FROM clientes 
       WHERE id = $1 
       RETURNING id`,
      [id],
    )

    if (result.rows.length === 0) {
      return false
    }

    return true
  } catch (error) {
    console.error(`Error deleting cliente with ID ${id}:`, error)
    throw error
  }
}

// Funciones para direcciones de cliente
export async function getDireccionesByClienteId(clienteId: number) {
  try {
    const result = await query(
      `SELECT * FROM direcciones_cliente 
       WHERE cliente_id = $1 
       ORDER BY es_predeterminada DESC, id`,
      [clienteId],
    )

    return result.rows
  } catch (error) {
    console.error(`Error getting direcciones for cliente ID ${clienteId}:`, error)
    throw error
  }
}

export async function getDireccionPredeterminadaByClienteId(clienteId: number) {
  try {
    const result = await query(
      `SELECT * FROM direcciones_cliente 
       WHERE cliente_id = $1 AND es_predeterminada = true 
       LIMIT 1`,
      [clienteId],
    )

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0]
  } catch (error) {
    console.error(`Error getting direccion predeterminada for cliente ID ${clienteId}:`, error)
    throw error
  }
}

export async function createDireccion(direccion: Partial<DireccionCliente>) {
  try {
    const {
      shopify_id,
      cliente_id,
      es_predeterminada,
      nombre,
      apellidos,
      empresa,
      direccion1,
      direccion2,
      ciudad,
      provincia,
      codigo_postal,
      pais,
      codigo_pais,
      telefono,
    } = direccion

    // Si es predeterminada, actualizar las demás direcciones
    if (es_predeterminada) {
      await query(
        `UPDATE direcciones_cliente 
         SET es_predeterminada = false 
         WHERE cliente_id = $1`,
        [cliente_id],
      )
    }

    const result = await query(
      `INSERT INTO direcciones_cliente (
        shopify_id, cliente_id, es_predeterminada, nombre, apellidos,
        empresa, direccion1, direccion2, ciudad, provincia,
        codigo_postal, pais, codigo_pais, telefono
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING *`,
      [
        shopify_id,
        cliente_id,
        es_predeterminada !== undefined ? es_predeterminada : false,
        nombre,
        apellidos,
        empresa,
        direccion1,
        direccion2,
        ciudad,
        provincia,
        codigo_postal,
        pais,
        codigo_pais,
        telefono,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating direccion:", error)
    throw error
  }
}

export async function updateDireccion(id: number, direccion: Partial<DireccionCliente>) {
  try {
    // Si es predeterminada, actualizar las demás direcciones
    if (direccion.es_predeterminada) {
      const currentDireccion = await query(`SELECT cliente_id FROM direcciones_cliente WHERE id = $1`, [id])

      if (currentDireccion.rows.length > 0) {
        await query(
          `UPDATE direcciones_cliente 
           SET es_predeterminada = false 
           WHERE cliente_id = $1 AND id != $2`,
          [currentDireccion.rows[0].cliente_id, id],
        )
      }
    }

    // Construir dinámicamente la consulta de actualización
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Añadir cada campo a actualizar
    Object.entries(direccion).forEach(([key, value]) => {
      if (key !== "id" && key !== "cliente_id" && value !== undefined) {
        updates.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    // Añadir fecha de actualización
    updates.push(`fecha_actualizacion = NOW()`)

    // Añadir el ID al final de los valores
    values.push(id)

    const result = await query(
      `UPDATE direcciones_cliente 
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
    console.error(`Error updating direccion with ID ${id}:`, error)
    throw error
  }
}

export async function deleteDireccion(id: number) {
  try {
    const result = await query(
      `DELETE FROM direcciones_cliente 
       WHERE id = $1 
       RETURNING id, cliente_id, es_predeterminada`,
      [id],
    )

    if (result.rows.length === 0) {
      return false
    }

    // Si era predeterminada, establecer otra dirección como predeterminada
    if (result.rows[0].es_predeterminada) {
      const clienteId = result.rows[0].cliente_id

      const otherDirecciones = await query(
        `SELECT id FROM direcciones_cliente 
         WHERE cliente_id = $1 
         ORDER BY id 
         LIMIT 1`,
        [clienteId],
      )

      if (otherDirecciones.rows.length > 0) {
        await query(
          `UPDATE direcciones_cliente 
           SET es_predeterminada = true 
           WHERE id = $1`,
          [otherDirecciones.rows[0].id],
        )
      }
    }

    return true
  } catch (error) {
    console.error(`Error deleting direccion with ID ${id}:`, error)
    throw error
  }
}
