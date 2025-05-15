import { executeQuery } from "@/lib/db/neon-client"
import { Logger } from "next-axiom"
import { extractIdFromGid } from "@/lib/shopify"

const logger = new Logger({
  source: "product-repository",
})

// Tipos para productos
export interface ShopifyProduct {
  id: string
  title: string
  description?: string
  handle?: string
  productType?: string
  vendor?: string
  status?: string
  tags?: string[]
  featuredImage?: {
    url: string
    altText?: string
  }
  variants?: ShopifyProductVariant[]
  images?: ShopifyProductImage[]
  metafields?: ShopifyMetafield[]
  seo?: {
    title?: string
    description?: string
  }
}

export interface ShopifyProductVariant {
  id: string
  title: string
  price?: string
  compareAtPrice?: string
  sku?: string
  barcode?: string
  inventoryQuantity?: number
  inventoryPolicy?: string
  requiresShipping?: boolean
  weight?: number
  weightUnit?: string
  option1?: string
  option2?: string
  option3?: string
  position?: number
}

export interface ShopifyProductImage {
  id: string
  src: string
  alt?: string
  position?: number
  variant_ids?: string[]
}

export interface ShopifyMetafield {
  id: string
  namespace: string
  key: string
  value: string
  type: string
}

// Función para sincronizar un producto de Shopify con la base de datos
export async function syncProductWithDb(product: ShopifyProduct): Promise<number> {
  try {
    logger.info("Sincronizando producto con la base de datos", { productId: product.id })

    // Verificar si el producto ya existe
    const shopifyId = extractIdFromGid(product.id)
    const existingProduct = await getProductByShopifyId(shopifyId)

    let productId: number

    if (existingProduct) {
      // Actualizar producto existente
      productId = await updateProduct(existingProduct.id, product)
      logger.info("Producto actualizado en la base de datos", { productId, shopifyId })
    } else {
      // Crear nuevo producto
      productId = await createProduct(product)
      logger.info("Producto creado en la base de datos", { productId, shopifyId })
    }

    // Sincronizar variantes
    if (product.variants && product.variants.length > 0) {
      await syncProductVariants(productId, product.variants)
    }

    // Sincronizar imágenes
    if (product.images && product.images.length > 0) {
      await syncProductImages(productId, product.images)
    }

    // Actualizar timestamp de sincronización
    await executeQuery(`UPDATE productos SET ultima_sincronizacion = NOW() WHERE id = $1`, [productId])

    return productId
  } catch (error) {
    logger.error("Error al sincronizar producto", {
      productId: product.id,
      error: (error as Error).message,
    })
    throw error
  }
}

// Obtener un producto por su ID de Shopify
export async function getProductByShopifyId(shopifyId: string): Promise<any | null> {
  try {
    const result = await executeQuery(`SELECT * FROM productos WHERE shopify_id = $1`, [shopifyId])

    return result.length > 0 ? result[0] : null
  } catch (error) {
    logger.error("Error al obtener producto por Shopify ID", {
      shopifyId,
      error: (error as Error).message,
    })
    throw error
  }
}

// Crear un nuevo producto
async function createProduct(product: ShopifyProduct): Promise<number> {
  const shopifyId = extractIdFromGid(product.id)
  const publicado = product.status === "ACTIVE"
  const etiquetas = product.tags || []

  // Extraer datos de SEO
  const seoTitulo = product.seo?.title || product.title
  const seoDescripcion = product.seo?.description || product.description?.substring(0, 160) || null

  // Extraer datos de la primera variante (si existe)
  const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null
  const precioBase = firstVariant?.price ? Number.parseFloat(firstVariant.price) : null
  const precioComparacion = firstVariant?.compareAtPrice ? Number.parseFloat(firstVariant.compareAtPrice) : null
  const sku = firstVariant?.sku || null
  const codigoBarras = firstVariant?.barcode || null
  const inventarioDisponible = firstVariant?.inventoryQuantity || 0
  const politicaInventario = firstVariant?.inventoryPolicy || null
  const requiereEnvio = firstVariant?.requiresShipping !== false
  const peso = firstVariant?.weight || null
  const unidadPeso = firstVariant?.weightUnit || "kg"

  // Imagen destacada
  const imagenDestacadaUrl = product.featuredImage?.url || null

  try {
    const result = await executeQuery(
      `INSERT INTO productos (
        shopify_id, titulo, descripcion, tipo_producto, proveedor, estado,
        publicado, destacado, etiquetas, imagen_destacada_url, precio_base,
        precio_comparacion, sku, codigo_barras, inventario_disponible,
        politica_inventario, requiere_envio, peso, unidad_peso, seo_titulo,
        seo_descripcion, url_handle, fecha_creacion, fecha_actualizacion
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, NOW(), NOW()
      ) RETURNING id`,
      [
        shopifyId,
        product.title,
        product.description || null,
        product.productType || null,
        product.vendor || null,
        product.status || null,
        publicado,
        false, // destacado por defecto a false
        etiquetas,
        imagenDestacadaUrl,
        precioBase,
        precioComparacion,
        sku,
        codigoBarras,
        inventarioDisponible,
        politicaInventario,
        requiereEnvio,
        peso,
        unidadPeso,
        seoTitulo,
        seoDescripcion,
        product.handle || null,
      ],
    )

    return result[0].id
  } catch (error) {
    logger.error("Error al crear producto en la base de datos", {
      productId: shopifyId,
      error: (error as Error).message,
    })
    throw error
  }
}

// Actualizar un producto existente
async function updateProduct(id: number, product: ShopifyProduct): Promise<number> {
  const shopifyId = extractIdFromGid(product.id)
  const publicado = product.status === "ACTIVE"
  const etiquetas = product.tags || []

  // Extraer datos de SEO
  const seoTitulo = product.seo?.title || product.title
  const seoDescripcion = product.seo?.description || product.description?.substring(0, 160) || null

  // Extraer datos de la primera variante (si existe)
  const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null
  const precioBase = firstVariant?.price ? Number.parseFloat(firstVariant.price) : null
  const precioComparacion = firstVariant?.compareAtPrice ? Number.parseFloat(firstVariant.compareAtPrice) : null
  const sku = firstVariant?.sku || null
  const codigoBarras = firstVariant?.barcode || null
  const inventarioDisponible = firstVariant?.inventoryQuantity || 0
  const politicaInventario = firstVariant?.inventoryPolicy || null
  const requiereEnvio = firstVariant?.requiresShipping !== false
  const peso = firstVariant?.weight || null
  const unidadPeso = firstVariant?.weightUnit || "kg"

  // Imagen destacada
  const imagenDestacadaUrl = product.featuredImage?.url || null

  try {
    await executeQuery(
      `UPDATE productos SET
        titulo = $1,
        descripcion = $2,
        tipo_producto = $3,
        proveedor = $4,
        estado = $5,
        publicado = $6,
        etiquetas = $7,
        imagen_destacada_url = $8,
        precio_base = $9,
        precio_comparacion = $10,
        sku = $11,
        codigo_barras = $12,
        inventario_disponible = $13,
        politica_inventario = $14,
        requiere_envio = $15,
        peso = $16,
        unidad_peso = $17,
        seo_titulo = $18,
        seo_descripcion = $19,
        url_handle = $20,
        fecha_actualizacion = NOW()
      WHERE id = $21`,
      [
        product.title,
        product.description || null,
        product.productType || null,
        product.vendor || null,
        product.status || null,
        publicado,
        etiquetas,
        imagenDestacadaUrl,
        precioBase,
        precioComparacion,
        sku,
        codigoBarras,
        inventarioDisponible,
        politicaInventario,
        requiereEnvio,
        peso,
        unidadPeso,
        seoTitulo,
        seoDescripcion,
        product.handle || null,
        id,
      ],
    )

    return id
  } catch (error) {
    logger.error("Error al actualizar producto en la base de datos", {
      productId: id,
      shopifyId,
      error: (error as Error).message,
    })
    throw error
  }
}

// Sincronizar variantes de un producto
async function syncProductVariants(productId: number, variants: ShopifyProductVariant[]): Promise<void> {
  try {
    // Eliminar variantes existentes
    await executeQuery(`DELETE FROM variantes_producto WHERE producto_id = $1`, [productId])

    // Insertar nuevas variantes
    for (const variant of variants) {
      const shopifyId = extractIdFromGid(variant.id)

      await executeQuery(
        `INSERT INTO variantes_producto (
          shopify_id, producto_id, titulo, precio, precio_comparacion, sku,
          codigo_barras, inventario_disponible, politica_inventario, requiere_envio,
          peso, unidad_peso, opcion1_valor, opcion2_valor, opcion3_valor,
          posicion, fecha_creacion, fecha_actualizacion
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW()
        )`,
        [
          shopifyId,
          productId,
          variant.title,
          variant.price ? Number.parseFloat(variant.price) : null,
          variant.compareAtPrice ? Number.parseFloat(variant.compareAtPrice) : null,
          variant.sku || null,
          variant.barcode || null,
          variant.inventoryQuantity || 0,
          variant.inventoryPolicy || null,
          variant.requiresShipping !== false,
          variant.weight || null,
          variant.weightUnit || "kg",
          variant.option1 || null,
          variant.option2 || null,
          variant.option3 || null,
          variant.position || 1,
        ],
      )
    }

    logger.info("Variantes de producto sincronizadas", {
      productId,
      variantsCount: variants.length,
    })
  } catch (error) {
    logger.error("Error al sincronizar variantes de producto", {
      productId,
      error: (error as Error).message,
    })
    throw error
  }
}

// Sincronizar imágenes de un producto
async function syncProductImages(productId: number, images: ShopifyProductImage[]): Promise<void> {
  try {
    // Eliminar imágenes existentes
    await executeQuery(`DELETE FROM imagenes_producto WHERE producto_id = $1`, [productId])

    // Insertar nuevas imágenes
    for (const image of images) {
      const shopifyId = extractIdFromGid(image.id)
      const esDestacada = image.position === 1

      await executeQuery(
        `INSERT INTO imagenes_producto (
          shopify_id, producto_id, url, texto_alternativo,
          posicion, es_destacada, fecha_creacion, fecha_actualizacion
        ) VALUES (
          $1, $2, $3, $4, $5, $6, NOW(), NOW()
        )`,
        [shopifyId, productId, image.src, image.alt || null, image.position || 1, esDestacada],
      )
    }

    logger.info("Imágenes de producto sincronizadas", {
      productId,
      imagesCount: images.length,
    })
  } catch (error) {
    logger.error("Error al sincronizar imágenes de producto", {
      productId,
      error: (error as Error).message,
    })
    throw error
  }
}

// Obtener todos los productos de la base de datos
export async function getAllProducts(limit = 100, offset = 0): Promise<any[]> {
  try {
    const result = await executeQuery(`SELECT * FROM productos ORDER BY fecha_creacion DESC LIMIT $1 OFFSET $2`, [
      limit,
      offset,
    ])

    return result
  } catch (error) {
    logger.error("Error al obtener todos los productos", {
      error: (error as Error).message,
    })
    throw error
  }
}

// Contar el total de productos en la base de datos
export async function countProducts(): Promise<number> {
  try {
    const result = await executeQuery(`SELECT COUNT(*) as total FROM productos`, [])
    return Number.parseInt(result[0].total)
  } catch (error) {
    logger.error("Error al contar productos", {
      error: (error as Error).message,
    })
    throw error
  }
}

// Obtener un producto completo con sus variantes e imágenes
export async function getProductWithDetails(id: number): Promise<any> {
  try {
    // Obtener producto
    const productResult = await executeQuery(`SELECT * FROM productos WHERE id = $1`, [id])

    if (productResult.length === 0) {
      return null
    }

    const product = productResult[0]

    // Obtener variantes
    const variantsResult = await executeQuery(
      `SELECT * FROM variantes_producto WHERE producto_id = $1 ORDER BY posicion ASC`,
      [id],
    )

    // Obtener imágenes
    const imagesResult = await executeQuery(
      `SELECT * FROM imagenes_producto WHERE producto_id = $1 ORDER BY posicion ASC`,
      [id],
    )

    return {
      ...product,
      variantes: variantsResult,
      imagenes: imagesResult,
    }
  } catch (error) {
    logger.error("Error al obtener producto con detalles", {
      productId: id,
      error: (error as Error).message,
    })
    throw error
  }
}
