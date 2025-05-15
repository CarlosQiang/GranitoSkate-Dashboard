import { Logger } from "next-axiom"
import { shopifyFetch } from "@/lib/shopify-client"
import { logSyncEvent } from "@/lib/db/repositories/registro-repository"
import { executeQuery } from "@/lib/db/neon-client"
import { extractIdFromGid } from "@/lib/shopify-client"

const logger = new Logger({
  source: "customer-sync-service",
})

// Tipos para clientes
export interface ShopifyCustomer {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  numberOfOrders?: number
  amountSpent?: {
    amount: string
    currencyCode: string
  }
  verifiedEmail?: boolean
  tags?: string[]
  defaultAddress?: ShopifyAddress
  addresses?: ShopifyAddress[]
  metafields?: ShopifyMetafield[]
}

export interface ShopifyAddress {
  id?: string
  address1?: string
  address2?: string
  city?: string
  province?: string
  zip?: string
  country?: string
  phone?: string
}

export interface ShopifyMetafield {
  id: string
  namespace: string
  key: string
  value: string
}

// Función para sincronizar todos los clientes de Shopify
export async function syncAllCustomers(limit = 250): Promise<{
  created: number
  updated: number
  failed: number
  total: number
}> {
  try {
    logger.info("Iniciando sincronización de clientes", { limit })

    // Obtener clientes de Shopify
    const shopifyCustomers = await fetchCustomersFromShopify(limit)

    if (!shopifyCustomers || shopifyCustomers.length === 0) {
      logger.warn("No se encontraron clientes en Shopify")

      await logSyncEvent({
        tipo_entidad: "CUSTOMER",
        accion: "SYNC_ALL",
        resultado: "WARNING",
        mensaje: "No se encontraron clientes en Shopify",
      })

      return { created: 0, updated: 0, failed: 0, total: 0 }
    }

    // Contadores para estadísticas
    let created = 0
    let updated = 0
    let failed = 0

    // Procesar cada cliente
    for (const customer of shopifyCustomers) {
      try {
        // Verificar si el cliente ya existe en la base de datos
        const existingCustomer = await checkCustomerExists(customer.id)

        if (existingCustomer) {
          // Actualizar cliente existente
          await updateCustomerInDb(existingCustomer.id, customer)
          updated++
        } else {
          // Crear nuevo cliente
          await createCustomerInDb(customer)
          created++
        }
      } catch (error) {
        logger.error("Error al sincronizar cliente", {
          customerId: customer.id,
          error: error instanceof Error ? error.message : "Error desconocido",
        })
        failed++

        // Registrar error
        await logSyncEvent({
          tipo_entidad: "CUSTOMER",
          entidad_id: customer.id,
          accion: "SYNC",
          resultado: "ERROR",
          mensaje: `Error al sincronizar cliente: ${error instanceof Error ? error.message : "Error desconocido"}`,
        })
      }
    }

    // Registrar evento de sincronización
    await logSyncEvent({
      tipo_entidad: "CUSTOMER",
      accion: "SYNC_ALL",
      resultado: "SUCCESS",
      mensaje: `Sincronización de clientes completada: ${created} creados, ${updated} actualizados, ${failed} fallidos`,
    })

    logger.info("Sincronización de clientes completada", { created, updated, failed, total: shopifyCustomers.length })

    return { created, updated, failed, total: shopifyCustomers.length }
  } catch (error) {
    logger.error("Error al sincronizar clientes", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "CUSTOMER",
      accion: "SYNC_ALL",
      resultado: "ERROR",
      mensaje: `Error al sincronizar clientes: ${error instanceof Error ? error.message : "Error desconocido"}`,
    })

    throw error
  }
}

// Función para obtener clientes de Shopify
async function fetchCustomersFromShopify(limit = 250): Promise<ShopifyCustomer[]> {
  try {
    const query = `
      query GetCustomers($limit: Int!) {
        customers(first: $limit) {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
              numberOfOrders
              amountSpent {
                amount
                currencyCode
              }
              verifiedEmail
              tags
              defaultAddress {
                id
                address1
                address2
                city
                province
                zip
                country
                phone
              }
              addresses(first: 5) {
                edges {
                  node {
                    id
                    address1
                    address2
                    city
                    province
                    zip
                    country
                    phone
                  }
                }
              }
              metafields(first: 10) {
                edges {
                  node {
                    id
                    namespace
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    `

    const variables = {
      limit,
    }

    const { data, errors } = await shopifyFetch({ query, variables })

    if (errors) {
      logger.error("Error al obtener clientes de Shopify", { errors })
      throw new Error(`Error al obtener clientes de Shopify: ${errors[0].message}`)
    }

    if (!data || !data.customers || !data.customers.edges) {
      logger.warn("Respuesta de Shopify no contiene clientes")
      return []
    }

    // Transformar los datos al formato esperado
    return data.customers.edges.map((edge) => {
      const node = edge.node

      return {
        id: node.id,
        firstName: node.firstName,
        lastName: node.lastName,
        email: node.email,
        phone: node.phone,
        numberOfOrders: node.numberOfOrders,
        amountSpent: node.amountSpent,
        verifiedEmail: node.verifiedEmail,
        tags: node.tags,
        defaultAddress: node.defaultAddress,
        addresses: node.addresses?.edges.map((addressEdge) => addressEdge.node) || [],
        metafields:
          node.metafields?.edges.map((metafieldEdge) => ({
            id: metafieldEdge.node.id,
            namespace: metafieldEdge.node.namespace,
            key: metafieldEdge.node.key,
            value: metafieldEdge.node.value,
          })) || [],
      }
    })
  } catch (error) {
    logger.error("Error al obtener clientes de Shopify", {
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

// Verificar si un cliente existe en la base de datos
async function checkCustomerExists(shopifyId: string): Promise<any | null> {
  try {
    const result = await executeQuery(`SELECT id FROM clientes WHERE shopify_id = $1`, [extractIdFromGid(shopifyId)])
    return result.length > 0 ? result[0] : null
  } catch (error) {
    logger.error("Error al verificar existencia de cliente", {
      shopifyId,
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    return null
  }
}

// Crear un nuevo cliente en la base de datos
async function createCustomerInDb(customer: ShopifyCustomer): Promise<number> {
  try {
    const shopifyId = extractIdFromGid(customer.id)
    const etiquetas = customer.tags || []
    const totalGastado = customer.amountSpent ? Number.parseFloat(customer.amountSpent.amount) : 0

    const result = await executeQuery(
      `INSERT INTO clientes (
        shopify_id, email, nombre, apellidos, telefono, 
        total_pedidos, total_gastado, etiquetas, 
        fecha_creacion, fecha_actualizacion
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
      ) RETURNING id`,
      [
        shopifyId,
        customer.email || null,
        customer.firstName || null,
        customer.lastName || null,
        customer.phone || null,
        customer.numberOfOrders || 0,
        totalGastado,
        etiquetas,
      ],
    )

    const clienteId = result[0].id

    // Sincronizar direcciones
    if (customer.addresses && customer.addresses.length > 0) {
      await syncCustomerAddresses(clienteId, customer.addresses, customer.defaultAddress?.id)
    }

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "CUSTOMER",
      entidad_id: customer.id,
      accion: "CREATE",
      resultado: "SUCCESS",
      mensaje: `Cliente creado: ${customer.firstName} ${customer.lastName}`,
    })

    return clienteId
  } catch (error) {
    logger.error("Error al crear cliente en la base de datos", {
      customerId: customer.id,
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

// Actualizar un cliente existente en la base de datos
async function updateCustomerInDb(id: number, customer: ShopifyCustomer): Promise<void> {
  try {
    const shopifyId = extractIdFromGid(customer.id)
    const etiquetas = customer.tags || []
    const totalGastado = customer.amountSpent ? Number.parseFloat(customer.amountSpent.amount) : 0

    await executeQuery(
      `UPDATE clientes SET
        email = $1,
        nombre = $2,
        apellidos = $3,
        telefono = $4,
        total_pedidos = $5,
        total_gastado = $6,
        etiquetas = $7,
        fecha_actualizacion = NOW(),
        ultima_sincronizacion = NOW()
      WHERE id = $8`,
      [
        customer.email || null,
        customer.firstName || null,
        customer.lastName || null,
        customer.phone || null,
        customer.numberOfOrders || 0,
        totalGastado,
        etiquetas,
        id,
      ],
    )

    // Sincronizar direcciones
    if (customer.addresses && customer.addresses.length > 0) {
      await syncCustomerAddresses(id, customer.addresses, customer.defaultAddress?.id)
    }

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "CUSTOMER",
      entidad_id: customer.id,
      accion: "UPDATE",
      resultado: "SUCCESS",
      mensaje: `Cliente actualizado: ${customer.firstName} ${customer.lastName}`,
    })
  } catch (error) {
    logger.error("Error al actualizar cliente en la base de datos", {
      customerId: customer.id,
      id,
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}

// Sincronizar direcciones de un cliente
async function syncCustomerAddresses(
  clienteId: number,
  addresses: ShopifyAddress[],
  defaultAddressId?: string,
): Promise<void> {
  try {
    // Eliminar direcciones existentes
    await executeQuery(`DELETE FROM direcciones_cliente WHERE cliente_id = $1`, [clienteId])

    // Insertar nuevas direcciones
    for (const address of addresses) {
      const shopifyId = address.id ? extractIdFromGid(address.id) : null
      const esPredeterminada = address.id === defaultAddressId

      await executeQuery(
        `INSERT INTO direcciones_cliente (
          shopify_id, cliente_id, es_predeterminada, direccion1, direccion2,
          ciudad, provincia, codigo_postal, pais, telefono,
          fecha_creacion, fecha_actualizacion
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
        )`,
        [
          shopifyId,
          clienteId,
          esPredeterminada,
          address.address1 || null,
          address.address2 || null,
          address.city || null,
          address.province || null,
          address.zip || null,
          address.country || null,
          address.phone || null,
        ],
      )
    }

    logger.info("Direcciones de cliente sincronizadas", {
      clienteId,
      addressesCount: addresses.length,
    })
  } catch (error) {
    logger.error("Error al sincronizar direcciones de cliente", {
      clienteId,
      error: error instanceof Error ? error.message : "Error desconocido",
    })
    throw error
  }
}
