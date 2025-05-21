import { shopifyFetch, extractIdFromGid } from "@/lib/shopify"
import { query } from "@/lib/db"

// Interfaces para los datos de Shopify
interface ShopifyProduct {
  id: string
  title: string
  description: string
  productType: string
  vendor: string
  status: string
  publishedAt: string | null
  handle: string
  tags: string
  featuredImage?: {
    url: string
  }
  variants: {
    edges: Array<{
      node: {
        id: string
        title: string
        price: string
        compareAtPrice: string | null
        sku: string
        barcode: string | null
        inventoryQuantity: number
        inventoryPolicy: string
        weight: number
        weightUnit: string
      }
    }>
  }
}

interface ShopifyCollection {
  id: string
  title: string
  description: string
  handle: string
  image?: {
    url: string
  }
  productsCount: number
  ruleSet?: {
    rules: Array<{
      column: string
      relation: string
      condition: string
    }>
  }
  products: {
    edges: Array<{
      node: {
        id: string
      }
    }>
  }
}

// Clase para manejar el almacenamiento temporal de datos
export class ShopifyDataCache {
  private static instance: ShopifyDataCache
  private products: ShopifyProduct[] = []
  private collections: ShopifyCollection[] = []
  private lastProductFetch: Date | null = null
  private lastCollectionFetch: Date | null = null
  private cacheTTL = 5 * 60 * 1000 // 5 minutos en milisegundos

  private constructor() {}

  public static getInstance(): ShopifyDataCache {
    if (!ShopifyDataCache.instance) {
      ShopifyDataCache.instance = new ShopifyDataCache()
    }
    return ShopifyDataCache.instance
  }

  // Métodos para productos
  public async getProducts(forceRefresh = false, limit = 100): Promise<ShopifyProduct[]> {
    const now = new Date()
    const shouldRefresh =
      forceRefresh || !this.lastProductFetch || now.getTime() - this.lastProductFetch.getTime() > this.cacheTTL

    if (shouldRefresh) {
      try {
        console.log(`Obteniendo ${limit} productos de Shopify...`)
        const products = await this.fetchProductsFromShopify(limit)
        this.products = products
        this.lastProductFetch = now
        console.log(`Se obtuvieron ${products.length} productos de Shopify`)
      } catch (error) {
        console.error("Error al obtener productos de Shopify:", error)
        // Si hay un error y no tenemos datos en caché, lanzar el error
        if (this.products.length === 0) {
          throw error
        }
        // Si tenemos datos en caché, usarlos aunque estén desactualizados
        console.warn("Usando datos en caché desactualizados debido a un error en la API")
      }
    }

    return this.products
  }

  private async fetchProductsFromShopify(limit = 100): Promise<ShopifyProduct[]> {
    const query = `
      query {
        products(first: ${limit}, sortKey: UPDATED_AT, reverse: true) {
          edges {
            node {
              id
              title
              description
              productType
              vendor
              status
              publishedAt
              handle
              tags
              featuredImage {
                url
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    sku
                    barcode
                    inventoryQuantity
                    inventoryPolicy
                    weight
                    weightUnit
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      const errorMessage = response.errors.map((e: any) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.products || !response.data.products.edges) {
      throw new Error("Respuesta de Shopify inválida o vacía")
    }

    return response.data.products.edges.map((edge: any) => edge.node)
  }

  // Métodos para colecciones
  public async getCollections(forceRefresh = false, limit = 50): Promise<ShopifyCollection[]> {
    const now = new Date()
    const shouldRefresh =
      forceRefresh || !this.lastCollectionFetch || now.getTime() - this.lastCollectionFetch.getTime() > this.cacheTTL

    if (shouldRefresh) {
      try {
        console.log(`Obteniendo ${limit} colecciones de Shopify...`)
        const collections = await this.fetchCollectionsFromShopify(limit)
        this.collections = collections
        this.lastCollectionFetch = now
        console.log(`Se obtuvieron ${collections.length} colecciones de Shopify`)
      } catch (error) {
        console.error("Error al obtener colecciones de Shopify:", error)
        if (this.collections.length === 0) {
          throw error
        }
        console.warn("Usando datos en caché desactualizados debido a un error en la API")
      }
    }

    return this.collections
  }

  private async fetchCollectionsFromShopify(limit = 50): Promise<ShopifyCollection[]> {
    const query = `
      query {
        collections(first: ${limit}) {
          edges {
            node {
              id
              title
              description
              handle
              image {
                url
              }
              productsCount
              ruleSet {
                rules {
                  column
                  relation
                  condition
                }
              }
              products(first: 10) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await shopifyFetch({ query })

    if (response.errors) {
      const errorMessage = response.errors.map((e: any) => e.message).join(", ")
      throw new Error(`Error en la API de Shopify: ${errorMessage}`)
    }

    if (!response.data || !response.data.collections || !response.data.collections.edges) {
      throw new Error("Respuesta de Shopify inválida o vacía")
    }

    return response.data.collections.edges.map((edge: any) => edge.node)
  }

  // Métodos para guardar en la base de datos
  public async saveProductsToDatabase(products = this.products): Promise<{ success: number; errors: number }> {
    let success = 0
    let errors = 0

    for (const product of products) {
      try {
        await this.saveProductToDatabase(product)
        success++
      } catch (error) {
        console.error(`Error al guardar producto ${product.id} en la base de datos:`, error)
        errors++
      }
    }

    return { success, errors }
  }

  private async saveProductToDatabase(product: ShopifyProduct): Promise<void> {
    // Extraer el ID numérico de Shopify
    const shopifyId = extractIdFromGid(product.id)

    // Verificar si el producto ya existe en la base de datos
    const existingProduct = await this.getProductByShopifyId(shopifyId)

    if (existingProduct) {
      // Actualizar producto existente
      await this.updateProductInDatabase(existingProduct.id, product)
    } else {
      // Crear nuevo producto
      await this.insertProductIntoDatabase(product)
    }
  }

  private async getProductByShopifyId(shopifyId: string): Promise<any | null> {
    try {
      const result = await query(`SELECT * FROM productos WHERE shopify_id = $1`, [shopifyId])

      if (result.rows.length === 0) {
        return null
      }

      return result.rows[0]
    } catch (error) {
      console.error(`Error al buscar producto con Shopify ID ${shopifyId}:`, error)
      return null
    }
  }

  private async insertProductIntoDatabase(product: ShopifyProduct): Promise<void> {
    const shopifyId = extractIdFromGid(product.id)
    const featuredImageUrl = product.featuredImage?.url || null

    // Obtener la primera variante para datos básicos
    const firstVariant = product.variants.edges[0]?.node
    const precio = firstVariant ? Number.parseFloat(firstVariant.price) : 0
    const precioComparacion = firstVariant?.compareAtPrice ? Number.parseFloat(firstVariant.compareAtPrice) : null
    const sku = firstVariant?.sku || ""
    const codigoBarras = firstVariant?.barcode || null
    const inventarioDisponible = firstVariant?.inventoryQuantity || 0

    try {
      // Insertar el producto
      const result = await query(
        `INSERT INTO productos (
          shopify_id, titulo, descripcion, tipo_producto, proveedor, estado,
          publicado, imagen_destacada_url, precio_base, precio_comparacion,
          sku, codigo_barras, inventario_disponible, url_handle, ultima_sincronizacion
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW()
        ) RETURNING id`,
        [
          shopifyId,
          product.title,
          product.description,
          product.productType,
          product.vendor,
          product.status,
          product.publishedAt !== null,
          featuredImageUrl,
          precio,
          precioComparacion,
          sku,
          codigoBarras,
          inventarioDisponible,
          product.handle,
        ],
      )

      const productoId = result.rows[0].id

      // Insertar variantes
      for (const variantEdge of product.variants.edges) {
        const variant = variantEdge.node
        const variantShopifyId = extractIdFromGid(variant.id)

        await query(
          `INSERT INTO variantes_producto (
            shopify_id, producto_id, titulo, precio, precio_comparacion,
            sku, codigo_barras, inventario_disponible, ultima_sincronizacion
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, NOW()
          )`,
          [
            variantShopifyId,
            productoId,
            variant.title,
            Number.parseFloat(variant.price),
            variant.compareAtPrice ? Number.parseFloat(variant.compareAtPrice) : null,
            variant.sku,
            variant.barcode,
            variant.inventoryQuantity,
          ],
        )
      }

      // Registrar la sincronización
      await this.registrarSincronizacion(
        "productos",
        shopifyId,
        "crear",
        "completado",
        `Producto ${product.title} creado correctamente`,
      )
    } catch (error) {
      console.error(`Error al insertar producto ${shopifyId} en la base de datos:`, error)

      // Registrar el error
      await this.registrarSincronizacion(
        "productos",
        shopifyId,
        "crear",
        "error",
        `Error al crear producto: ${error instanceof Error ? error.message : "Error desconocido"}`,
      )

      throw error
    }
  }

  private async updateProductInDatabase(id: number, product: ShopifyProduct): Promise<void> {
    const shopifyId = extractIdFromGid(product.id)
    const featuredImageUrl = product.featuredImage?.url || null

    // Obtener la primera variante para datos básicos
    const firstVariant = product.variants.edges[0]?.node
    const precio = firstVariant ? Number.parseFloat(firstVariant.price) : 0
    const precioComparacion = firstVariant?.compareAtPrice ? Number.parseFloat(firstVariant.compareAtPrice) : null
    const sku = firstVariant?.sku || ""
    const codigoBarras = firstVariant?.barcode || null
    const inventarioDisponible = firstVariant?.inventoryQuantity || 0

    try {
      // Actualizar el producto
      await query(
        `UPDATE productos SET
          titulo = $1,
          descripcion = $2,
          tipo_producto = $3,
          proveedor = $4,
          estado = $5,
          publicado = $6,
          imagen_destacada_url = $7,
          precio_base = $8,
          precio_comparacion = $9,
          sku = $10,
          codigo_barras = $11,
          inventario_disponible = $12,
          url_handle = $13,
          ultima_sincronizacion = NOW()
        WHERE id = $14`,
        [
          product.title,
          product.description,
          product.productType,
          product.vendor,
          product.status,
          product.publishedAt !== null,
          featuredImageUrl,
          precio,
          precioComparacion,
          sku,
          codigoBarras,
          inventarioDisponible,
          product.handle,
          id,
        ],
      )

      // Actualizar variantes (primero eliminar las existentes)
      await query(`DELETE FROM variantes_producto WHERE producto_id = $1`, [id])

      // Insertar las nuevas variantes
      for (const variantEdge of product.variants.edges) {
        const variant = variantEdge.node
        const variantShopifyId = extractIdFromGid(variant.id)

        await query(
          `INSERT INTO variantes_producto (
            shopify_id, producto_id, titulo, precio, precio_comparacion,
            sku, codigo_barras, inventario_disponible, ultima_sincronizacion
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, NOW()
          )`,
          [
            variantShopifyId,
            id,
            variant.title,
            Number.parseFloat(variant.price),
            variant.compareAtPrice ? Number.parseFloat(variant.compareAtPrice) : null,
            variant.sku,
            variant.barcode,
            variant.inventoryQuantity,
          ],
        )
      }

      // Registrar la sincronización
      await this.registrarSincronizacion(
        "productos",
        shopifyId,
        "actualizar",
        "completado",
        `Producto ${product.title} actualizado correctamente`,
      )
    } catch (error) {
      console.error(`Error al actualizar producto ${shopifyId} en la base de datos:`, error)

      // Registrar el error
      await this.registrarSincronizacion(
        "productos",
        shopifyId,
        "actualizar",
        "error",
        `Error al actualizar producto: ${error instanceof Error ? error.message : "Error desconocido"}`,
      )

      throw error
    }
  }

  // Método para registrar la sincronización
  private async registrarSincronizacion(
    tipoEntidad: string,
    entidadId: string | null,
    accion: string,
    resultado: string,
    mensaje: string,
    detalles?: any,
  ): Promise<void> {
    try {
      await query(
        `INSERT INTO registro_sincronizacion (
          tipo_entidad, entidad_id, accion, resultado, mensaje, detalles
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [tipoEntidad, entidadId, accion, resultado, mensaje, detalles ? JSON.stringify(detalles) : null],
      )
    } catch (error) {
      console.error("Error al registrar sincronización:", error)
    }
  }

  // Métodos para colecciones en la base de datos
  public async saveCollectionsToDatabase(collections = this.collections): Promise<{ success: number; errors: number }> {
    let success = 0
    let errors = 0

    for (const collection of collections) {
      try {
        await this.saveCollectionToDatabase(collection)
        success++
      } catch (error) {
        console.error(`Error al guardar colección ${collection.id} en la base de datos:`, error)
        errors++
      }
    }

    return { success, errors }
  }

  private async saveCollectionToDatabase(collection: ShopifyCollection): Promise<void> {
    // Implementación similar a saveProductToDatabase
    // ...
    // Esta es una versión simplificada para no hacer el código demasiado largo
    const shopifyId = extractIdFromGid(collection.id)

    try {
      // Verificar si la colección ya existe
      const existingCollection = await query(`SELECT * FROM colecciones WHERE shopify_id = $1`, [shopifyId])

      if (existingCollection.rows.length > 0) {
        // Actualizar colección existente
        await query(
          `UPDATE colecciones SET
            titulo = $1,
            descripcion = $2,
            url_handle = $3,
            imagen_url = $4,
            es_automatica = $5,
            condiciones_automaticas = $6,
            fecha_actualizacion = NOW()
          WHERE shopify_id = $7`,
          [
            collection.title,
            collection.description,
            collection.handle,
            collection.image?.url || null,
            !!collection.ruleSet,
            collection.ruleSet ? JSON.stringify(collection.ruleSet.rules) : null,
            shopifyId,
          ],
        )
      } else {
        // Crear nueva colección
        await query(
          `INSERT INTO colecciones (
            shopify_id, titulo, descripcion, url_handle, imagen_url,
            es_automatica, condiciones_automaticas
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7
          )`,
          [
            shopifyId,
            collection.title,
            collection.description,
            collection.handle,
            collection.image?.url || null,
            !!collection.ruleSet,
            collection.ruleSet ? JSON.stringify(collection.ruleSet.rules) : null,
          ],
        )
      }

      // Registrar la sincronización
      await this.registrarSincronizacion(
        "colecciones",
        shopifyId,
        existingCollection.rows.length > 0 ? "actualizar" : "crear",
        "completado",
        `Colección ${collection.title} ${existingCollection.rows.length > 0 ? "actualizada" : "creada"} correctamente`,
      )
    } catch (error) {
      console.error(`Error al guardar colección ${shopifyId} en la base de datos:`, error)

      // Registrar el error
      await this.registrarSincronizacion(
        "colecciones",
        shopifyId,
        "guardar",
        "error",
        `Error al guardar colección: ${error instanceof Error ? error.message : "Error desconocido"}`,
      )

      throw error
    }
  }
}

// Exportar una instancia singleton
export const shopifyDataService = ShopifyDataCache.getInstance()

// Función de utilidad para obtener productos
export async function getShopifyProducts(forceRefresh = false, limit = 100) {
  return await shopifyDataService.getProducts(forceRefresh, limit)
}

// Función de utilidad para obtener colecciones
export async function getShopifyCollections(forceRefresh = false, limit = 50) {
  return await shopifyDataService.getCollections(forceRefresh, limit)
}

// Función de utilidad para sincronizar productos con la base de datos
export async function syncProductsToDatabase(limit = 100) {
  // Primero obtenemos los productos frescos de Shopify
  const products = await shopifyDataService.getProducts(true, limit)

  // Luego los guardamos en la base de datos
  return await shopifyDataService.saveProductsToDatabase(products)
}

// Función de utilidad para sincronizar colecciones con la base de datos
export async function syncCollectionsToDatabase(limit = 50) {
  // Primero obtenemos las colecciones frescas de Shopify
  const collections = await shopifyDataService.getCollections(true, limit)

  // Luego las guardamos en la base de datos
  return await shopifyDataService.saveCollectionsToDatabase(collections)
}
