import { insert, update, findById, findAll, findByField, remove } from "@/lib/db"

export type Cliente = {
  id?: number
  shopify_id?: string
  email?: string
  nombre?: string
  telefono?: string
  datos_adicionales?: any
  fecha_creacion?: Date
  fecha_actualizacion?: Date
}

export async function getAllClientes() {
  return findAll("clientes")
}

export async function getClienteById(id: number) {
  return findById("clientes", id)
}

export async function getClienteByShopifyId(shopifyId: string) {
  return findByField("clientes", "shopify_id", shopifyId)
}

export async function getClienteByEmail(email: string) {
  return findByField("clientes", "email", email)
}

export async function createCliente(cliente: Cliente) {
  return insert("clientes", cliente)
}

export async function updateCliente(id: number, cliente: Partial<Cliente>) {
  return update("clientes", id, cliente)
}

export async function deleteCliente(id: number) {
  return remove("clientes", id)
}

export async function saveClienteFromShopify(shopifyData: any) {
  try {
    // Extraer datos básicos del cliente de Shopify
    const shopifyId = shopifyData.id.split("/").pop() || ""

    // Verificar si el cliente ya existe
    const existingCustomer = await getClienteByShopifyId(shopifyId)

    // Preparar datos del cliente
    const clienteData: Cliente = {
      shopify_id: shopifyId,
      email: shopifyData.email || "",
      nombre: `${shopifyData.firstName || ""} ${shopifyData.lastName || ""}`.trim(),
      telefono: shopifyData.phone || "",
      datos_adicionales: JSON.stringify({
        acceptsMarketing: shopifyData.acceptsMarketing || false,
        note: shopifyData.note || "",
        tags: shopifyData.tags || [],
        addresses: shopifyData.addresses?.edges?.map((edge: any) => edge.node) || [],
        defaultAddress: shopifyData.defaultAddress || null,
        orders:
          shopifyData.orders?.edges?.map((edge: any) => ({
            id: edge.node.id.split("/").pop(),
            name: edge.node.name,
            totalPrice: edge.node.totalPriceSet?.shopMoney?.amount || 0,
          })) || [],
      }),
    }

    // Crear o actualizar el cliente
    if (existingCustomer) {
      return updateCliente(existingCustomer.id, clienteData)
    } else {
      return createCliente(clienteData)
    }
  } catch (error) {
    console.error("Error al guardar cliente desde Shopify:", error)
    throw error
  }
}
