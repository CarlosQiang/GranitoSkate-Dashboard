import { findAll, findById, findByField, insert, update, remove } from "@/lib/db"

export type Producto = {
  id?: number
  shopify_id?: string
  titulo: string
  descripcion?: string
  precio?: number
  inventario?: number
  imagen_url?: string
  datos_adicionales?: any
  fecha_creacion?: Date
  fecha_actualizacion?: Date
}

export async function getAllProductos() {
  return findAll("productos")
}

export async function getProductoById(id: number) {
  return findById("productos", id)
}

export async function getProductoByShopifyId(shopifyId: string) {
  return findByField("productos", "shopify_id", shopifyId)
}

export async function createProducto(producto: Producto) {
  return insert("productos", producto)
}

export async function updateProducto(id: number, producto: Partial<Producto>) {
  return update("productos", id, producto)
}

export async function deleteProducto(id: number) {
  return remove("productos", id)
}

export async function saveProductFromShopify(shopifyData: any) {
  try {
    // Extraer datos básicos del producto de Shopify
    const shopifyId = shopifyData.id.split("/").pop() || ""

    // Verificar si el producto ya existe
    const existingProduct = await getProductoByShopifyId(shopifyId)

    // Preparar datos del producto
    const productoData: Producto = {
      shopify_id: shopifyId,
      titulo: shopifyData.title || "",
      descripcion: shopifyData.description || "",
      precio: shopifyData.variants?.edges?.length > 0 ? Number.parseFloat(shopifyData.variants.edges[0].node.price) : 0,
      inventario:
        shopifyData.variants?.edges?.length > 0 ? shopifyData.variants.edges[0].node.inventoryQuantity || 0 : 0,
      imagen_url: shopifyData.images?.edges?.length > 0 ? shopifyData.images.edges[0].node.url : "",
      datos_adicionales: JSON.stringify({
        tipo_producto: shopifyData.productType || "",
        proveedor: shopifyData.vendor || "",
        estado: shopifyData.status || "",
        etiquetas: shopifyData.tags || [],
        variantes: shopifyData.variants?.edges?.map((edge: any) => edge.node) || [],
        imagenes: shopifyData.images?.edges?.map((edge: any) => edge.node) || [],
      }),
    }

    // Crear o actualizar el producto
    if (existingProduct) {
      return updateProducto(existingProduct.id, productoData)
    } else {
      return createProducto(productoData)
    }
  } catch (error) {
    console.error("Error al guardar producto desde Shopify:", error)
    throw error
  }
}
