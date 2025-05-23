import { insert, update, findById, findAll, findByField, remove } from "@/lib/db"

export type Coleccion = {
  id?: number
  shopify_id?: string
  titulo: string
  descripcion?: string
  imagen_url?: string
  datos_adicionales?: any
  fecha_creacion?: Date
  fecha_actualizacion?: Date
}

export async function getAllColecciones() {
  return findAll("colecciones")
}

export async function getColeccionById(id: number) {
  return findById("colecciones", id)
}

export async function getColeccionByShopifyId(shopifyId: string) {
  return findByField("colecciones", "shopify_id", shopifyId)
}

export async function createColeccion(coleccion: Coleccion) {
  return insert("colecciones", coleccion)
}

export async function updateColeccion(id: number, coleccion: Partial<Coleccion>) {
  return update("colecciones", id, coleccion)
}

export async function deleteColeccion(id: number) {
  return remove("colecciones", id)
}

export async function saveColeccionFromShopify(shopifyData: any) {
  try {
    // Extraer datos básicos de la colección de Shopify
    const shopifyId = shopifyData.id.split("/").pop() || ""

    // Verificar si la colección ya existe
    const existingCollection = await getColeccionByShopifyId(shopifyId)

    // Preparar datos de la colección
    const coleccionData: Coleccion = {
      shopify_id: shopifyId,
      titulo: shopifyData.title || "",
      descripcion: shopifyData.description || "",
      imagen_url: shopifyData.image?.url || "",
      datos_adicionales: JSON.stringify({
        handle: shopifyData.handle || "",
        productos:
          shopifyData.products?.edges?.map((edge: any) => ({
            id: edge.node.id.split("/").pop(),
            title: edge.node.title,
          })) || [],
      }),
    }

    // Crear o actualizar la colección
    if (existingCollection) {
      return updateColeccion(existingCollection.id, coleccionData)
    } else {
      return createColeccion(coleccionData)
    }
  } catch (error) {
    console.error("Error al guardar colección desde Shopify:", error)
    throw error
  }
}
