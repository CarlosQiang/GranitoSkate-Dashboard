import { sql } from "@vercel/postgres"
import type { Cliente, DireccionCliente } from "../schema"
import { logSyncEvent } from "./registro-repository"

// Obtener todos los clientes
export async function getAllClientes(): Promise<Cliente[]> {
  try {
    const result = await sql`
      SELECT * FROM clientes
      ORDER BY fecha_creacion DESC
    `
    return result.rows
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    throw error
  }
}

// Obtener un cliente por ID
export async function getClienteById(id: number): Promise<Cliente | null> {
  try {
    const result = await sql`
      SELECT * FROM clientes
      WHERE id = ${id}
    `

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener cliente con ID ${id}:`, error)
    throw error
  }
}

// Obtener un cliente por Shopify ID
export async function getClienteByShopifyId(shopifyId: string): Promise<Cliente | null> {
  try {
    const result = await sql`
      SELECT * FROM clientes
      WHERE shopify_id = ${shopifyId}
    `

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener cliente con Shopify ID ${shopifyId}:`, error)
    throw error
  }
}

// Obtener un cliente por email
export async function getClienteByEmail(email: string): Promise<Cliente | null> {
  try {
    const result = await sql`
      SELECT * FROM clientes
      WHERE email = ${email}
    `

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener cliente con email ${email}:`, error)
    throw error
  }
}

// Crear un nuevo cliente
export async function createCliente(data: Partial<Cliente>): Promise<Cliente> {
  try {
    const {
      shopify_id,
      email,
      nombre,
      apellidos,
      telefono,
      acepta_marketing = false,
      notas,
      etiquetas,
      total_pedidos = 0,
      total_gastado = 0,
      estado,
    } = data

    const result = await sql`
      INSERT INTO clientes (
        shopify_id, email, nombre, apellidos, telefono, acepta_marketing,
        notas, etiquetas, total_pedidos, total_gastado, estado,
        fecha_creacion, fecha_actualizacion
      )
      VALUES (
        ${shopify_id || null}, ${email || null}, ${nombre || null}, ${apellidos || null},
        ${telefono || null}, ${acepta_marketing}, ${notas || null},
        ${etiquetas ? JSON.stringify(etiquetas) : null}, ${total_pedidos},
        ${total_gastado}, ${estado || null}, NOW(), NOW()
      )
      RETURNING *
    `

    return result.rows[0]
  } catch (error) {
    console.error("Error al crear cliente:", error)
    throw error
  }
}

// Actualizar un cliente existente
export async function updateCliente(id: number, data: Partial<Cliente>): Promise<Cliente> {
  try {
    // Primero obtenemos el cliente actual
    const currentCliente = await getClienteById(id)
    if (!currentCliente) {
      throw new Error(`Cliente con ID ${id} no encontrado`)
    }

    // Combinamos los datos actuales con los nuevos
    const updatedData = {
      ...currentCliente,
      ...data,
      fecha_actualizacion: new Date(),
    }

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
      ultima_sincronizacion,
    } = updatedData

    const result = await sql`
      UPDATE clientes
      SET
        shopify_id = ${shopify_id || null},
        email = ${email || null},
        nombre = ${nombre || null},
        apellidos = ${apellidos || null},
        telefono = ${telefono || null},
        acepta_marketing = ${acepta_marketing},
        notas = ${notas || null},
        etiquetas = ${etiquetas ? JSON.stringify(etiquetas) : null},
        total_pedidos = ${total_pedidos},
        total_gastado = ${total_gastado},
        estado = ${estado || null},
        fecha_actualizacion = NOW(),
        ultima_sincronizacion = ${ultima_sincronizacion || null}
      WHERE id = ${id}
      RETURNING *
    `

    return result.rows[0]
  } catch (error) {
    console.error(`Error al actualizar cliente con ID ${id}:`, error)
    throw error
  }
}

// Eliminar un cliente
export async function deleteCliente(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM clientes
      WHERE id = ${id}
      RETURNING id
    `

    return result.rows.length > 0
  } catch (error) {
    console.error(`Error al eliminar cliente con ID ${id}:`, error)
    throw error
  }
}

// Buscar clientes
export async function searchClientes(
  query: string,
  limit = 10,
  offset = 0,
): Promise<{ clientes: Cliente[]; total: number }> {
  try {
    const searchQuery = `%${query}%`

    const clientesResult = await sql`
      SELECT * FROM clientes
      WHERE 
        email ILIKE ${searchQuery} OR
        nombre ILIKE ${searchQuery} OR
        apellidos ILIKE ${searchQuery} OR
        telefono ILIKE ${searchQuery}
      ORDER BY fecha_creacion DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const countResult = await sql`
      SELECT COUNT(*) as total FROM clientes
      WHERE 
        email ILIKE ${searchQuery} OR
        nombre ILIKE ${searchQuery} OR
        apellidos ILIKE ${searchQuery} OR
        telefono ILIKE ${searchQuery}
    `

    return {
      clientes: clientesResult.rows,
      total: Number.parseInt(countResult.rows[0].total),
    }
  } catch (error) {
    console.error(`Error al buscar clientes con query "${query}":`, error)
    throw error
  }
}

// Obtener direcciones de un cliente
export async function getDireccionesByClienteId(clienteId: number): Promise<DireccionCliente[]> {
  try {
    const result = await sql`
      SELECT * FROM direcciones_cliente
      WHERE cliente_id = ${clienteId}
      ORDER BY es_predeterminada DESC, fecha_creacion ASC
    `
    return result.rows
  } catch (error) {
    console.error(`Error al obtener direcciones del cliente con ID ${clienteId}:`, error)
    throw error
  }
}

// Obtener dirección predeterminada de un cliente
export async function getDireccionPredeterminadaByClienteId(clienteId: number): Promise<DireccionCliente | null> {
  try {
    const result = await sql`
      SELECT * FROM direcciones_cliente
      WHERE cliente_id = ${clienteId} AND es_predeterminada = true
      LIMIT 1
    `
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener dirección predeterminada del cliente con ID ${clienteId}:`, error)
    throw error
  }
}

// Crear una nueva dirección de cliente
export async function createDireccionCliente(data: Partial<DireccionCliente>): Promise<DireccionCliente> {
  try {
    const {
      shopify_id,
      cliente_id,
      es_predeterminada = false,
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
    } = data

    // Si es predeterminada, actualizar las demás direcciones del cliente
    if (es_predeterminada) {
      await sql`
        UPDATE direcciones_cliente
        SET es_predeterminada = false
        WHERE cliente_id = ${cliente_id}
      `
    }

    const result = await sql`
      INSERT INTO direcciones_cliente (
        shopify_id, cliente_id, es_predeterminada, nombre, apellidos,
        empresa, direccion1, direccion2, ciudad, provincia, codigo_postal,
        pais, codigo_pais, telefono, fecha_creacion, fecha_actualizacion
      )
      VALUES (
        ${shopify_id || null}, ${cliente_id}, ${es_predeterminada}, ${nombre || null},
        ${apellidos || null}, ${empresa || null}, ${direccion1 || null},
        ${direccion2 || null}, ${ciudad || null}, ${provincia || null},
        ${codigo_postal || null}, ${pais || null}, ${codigo_pais || null},
        ${telefono || null}, NOW(), NOW()
      )
      RETURNING *
    `

    return result.rows[0]
  } catch (error) {
    console.error("Error al crear dirección de cliente:", error)
    throw error
  }
}

// Actualizar una dirección de cliente existente
export async function updateDireccionCliente(id: number, data: Partial<DireccionCliente>): Promise<DireccionCliente> {
  try {
    // Primero obtenemos la dirección actual
    const result = await sql`
      SELECT * FROM direcciones_cliente
      WHERE id = ${id}
    `

    if (result.rows.length === 0) {
      throw new Error(`Dirección con ID ${id} no encontrada`)
    }

    const currentDireccion = result.rows[0]

    // Si se está estableciendo como predeterminada, actualizar las demás direcciones
    if (data.es_predeterminada && !currentDireccion.es_predeterminada) {
      await sql`
        UPDATE direcciones_cliente
        SET es_predeterminada = false
        WHERE cliente_id = ${currentDireccion.cliente_id}
      `
    }

    // Combinamos los datos actuales con los nuevos
    const updatedData = {
      ...currentDireccion,
      ...data,
      fecha_actualizacion: new Date(),
    }

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
      ultima_sincronizacion,
    } = updatedData

    const updateResult = await sql`
      UPDATE direcciones_cliente
      SET
        shopify_id = ${shopify_id || null},
        cliente_id = ${cliente_id},
        es_predeterminada = ${es_predeterminada},
        nombre = ${nombre || null},
        apellidos = ${apellidos || null},
        empresa = ${empresa || null},
        direccion1 = ${direccion1 || null},
        direccion2 = ${direccion2 || null},
        ciudad = ${ciudad || null},
        provincia = ${provincia || null},
        codigo_postal = ${codigo_postal || null},
        pais = ${pais || null},
        codigo_pais = ${codigo_pais || null},
        telefono = ${telefono || null},
        fecha_actualizacion = NOW(),
        ultima_sincronizacion = ${ultima_sincronizacion || null}
      WHERE id = ${id}
      RETURNING *
    `

    return updateResult.rows[0]
  } catch (error) {
    console.error(`Error al actualizar dirección con ID ${id}:`, error)
    throw error
  }
}

// Eliminar una dirección de cliente
export async function deleteDireccionCliente(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM direcciones_cliente
      WHERE id = ${id}
      RETURNING id
    `

    return result.rows.length > 0
  } catch (error) {
    console.error(`Error al eliminar dirección con ID ${id}:`, error)
    throw error
  }
}

// Sincronizar un cliente con Shopify
export async function syncClienteWithShopify(customer: any): Promise<number> {
  try {
    // Verificar si el cliente ya existe
    const existingCustomer = await getClienteByShopifyId(customer.id)

    if (existingCustomer) {
      // Actualizar cliente existente
      const updatedCustomer = await updateCliente(existingCustomer.id, {
        email: customer.email,
        nombre: customer.firstName,
        apellidos: customer.lastName,
        telefono: customer.phone,
        acepta_marketing: customer.acceptsMarketing || false,
        total_pedidos: customer.ordersCount || 0,
        total_gastado: customer.totalSpent?.amount || 0,
        etiquetas: customer.tags || [],
        ultima_sincronizacion: new Date(),
      })

      // Registrar evento
      await logSyncEvent({
        tipo_entidad: "CUSTOMER",
        entidad_id: customer.id,
        accion: "UPDATE",
        resultado: "SUCCESS",
        mensaje: `Cliente actualizado: ${customer.firstName} ${customer.lastName}`,
      })

      // Sincronizar direcciones
      if (customer.addresses && Array.isArray(customer.addresses)) {
        await syncDireccionesCliente(updatedCustomer.id, customer.id, customer.addresses, customer.defaultAddress?.id)
      }

      return updatedCustomer.id
    } else {
      // Crear nuevo cliente
      const newCustomer = await createCliente({
        shopify_id: customer.id,
        email: customer.email,
        nombre: customer.firstName,
        apellidos: customer.lastName,
        telefono: customer.phone,
        acepta_marketing: customer.acceptsMarketing || false,
        total_pedidos: customer.ordersCount || 0,
        total_gastado: customer.totalSpent?.amount || 0,
        etiquetas: customer.tags || [],
        ultima_sincronizacion: new Date(),
      })

      // Registrar evento
      await logSyncEvent({
        tipo_entidad: "CUSTOMER",
        entidad_id: customer.id,
        accion: "CREATE",
        resultado: "SUCCESS",
        mensaje: `Cliente creado: ${customer.firstName} ${customer.lastName}`,
      })

      // Sincronizar direcciones
      if (customer.addresses && Array.isArray(customer.addresses)) {
        await syncDireccionesCliente(newCustomer.id, customer.id, customer.addresses, customer.defaultAddress?.id)
      }

      return newCustomer.id
    }
  } catch (error) {
    console.error(`Error al sincronizar cliente ${customer.id}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "CUSTOMER",
      entidad_id: customer.id,
      accion: "SYNC",
      resultado: "ERROR",
      mensaje: `Error al sincronizar cliente: ${(error as Error).message}`,
    })

    throw error
  }
}

// Sincronizar direcciones de un cliente
async function syncDireccionesCliente(
  clienteDbId: number,
  shopifyClienteId: string,
  addresses: any[],
  defaultAddressId?: string,
): Promise<void> {
  try {
    // Eliminar direcciones existentes
    await sql`DELETE FROM direcciones_cliente WHERE cliente_id = ${clienteDbId}`

    // Insertar nuevas direcciones
    for (const address of addresses) {
      const esPredeterminada = defaultAddressId ? address.id === defaultAddressId : false

      await sql`
        INSERT INTO direcciones_cliente (
          shopify_id, cliente_id, es_predeterminada, nombre, apellidos,
          empresa, direccion1, direccion2, ciudad, provincia, codigo_postal,
          pais, codigo_pais, telefono, fecha_creacion, fecha_actualizacion, ultima_sincronizacion
        )
        VALUES (
          ${address.id}, ${clienteDbId}, ${esPredeterminada}, ${address.firstName || null},
          ${address.lastName || null}, ${address.company || null}, ${address.address1 || null},
          ${address.address2 || null}, ${address.city || null}, ${address.province || null},
          ${address.zip || null}, ${address.country || null}, ${address.countryCode || null},
          ${address.phone || null}, NOW(), NOW(), NOW()
        )
      `
    }

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "CUSTOMER_ADDRESSES",
      entidad_id: shopifyClienteId,
      accion: "SYNC",
      resultado: "SUCCESS",
      mensaje: `Direcciones de cliente sincronizadas: ${addresses.length} direcciones`,
    })
  } catch (error) {
    console.error(`Error al sincronizar direcciones del cliente ${shopifyClienteId}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "CUSTOMER_ADDRESSES",
      entidad_id: shopifyClienteId,
      accion: "SYNC",
      resultado: "ERROR",
      mensaje: `Error al sincronizar direcciones de cliente: ${(error as Error).message}`,
    })

    throw error
  }
}
