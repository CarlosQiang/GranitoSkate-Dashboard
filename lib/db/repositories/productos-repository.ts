import { db } from "../neon"
import { productos } from "../schema"
import { eq } from "drizzle-orm"

export async function getAllProductos() {
  return db.select().from(productos)
}

export async function getProductoById(id: number) {
  return db.select().from(productos).where(eq(productos.id, id))
}

export async function getProductoByShopifyId(shopifyId: string) {
  return db.select().from(productos).where(eq(productos.shopify_id, shopifyId))
}

export async function createProducto(data: any) {
  return db.insert(productos).values(data).returning()
}

export async function updateProducto(id: number, data: any) {
  return db
    .update(productos)
    .set({
      ...data,
      fecha_actualizacion: new Date(),
    })
    .where(eq(productos.id, id))
    .returning()
}

export async function deleteProducto(id: number) {
  return db.delete(productos).where(eq(productos.id, id)).returning()
}

export async function syncProductoWithShopify(shopifyProducto: any) {
  // Buscar si el producto ya existe
  const existingProductos = await getProductoByShopifyId(shopifyProducto.id)

  if (existingProductos.length > 0) {
    // Actualizar producto existente
    const productoId = existingProductos[0].id
    return updateProducto(productoId, {
      titulo: shopifyProducto.title,
      descripcion: shopifyProducto.description || shopifyProducto.descriptionHtml,
      tipo_producto: shopifyProducto.productType,
      proveedor: shopifyProducto.vendor,
      estado: shopifyProducto.status,
      publicado: shopifyProducto.status === "ACTIVE",
      etiquetas: shopifyProducto.tags || [],
      precio_base: shopifyProducto.priceRangeV2?.minVariantPrice?.amount || 0,
      precio_comparacion: shopifyProducto.compareAtPriceRange?.minVariantPrice?.amount || null,
      imagen_destacada_url: shopifyProducto.images?.edges?.[0]?.node?.url || null,
      ultima_sincronizacion: new Date(),
    })
  } else {
    // Crear nuevo producto
    return createProducto({
      shopify_id: shopifyProducto.id,
      titulo: shopifyProducto.title,
      descripcion: shopifyProducto.description || shopifyProducto.descriptionHtml,
      tipo_producto: shopifyProducto.productType,
      proveedor: shopifyProducto.vendor,
      estado: shopifyProducto.status,
      publicado: shopifyProducto.status === "ACTIVE",
      etiquetas: shopifyProducto.tags || [],
      precio_base: shopifyProducto.priceRangeV2?.minVariantPrice?.amount || 0,
      precio_comparacion: shopifyProducto.compareAtPriceRange?.minVariantPrice?.amount || null,
      imagen_destacada_url: shopifyProducto.images?.edges?.[0]?.node?.url || null,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
      ultima_sincronizacion: new Date(),
    })
  }
}
