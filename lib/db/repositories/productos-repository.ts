import { sql } from "@vercel/postgres"
import type { Producto, ImagenProducto, VarianteProducto } from "../schema"
import { logSyncEvent } from "./registro-repository"

// Obtener todos los productos
export async function getAllProductos(): Promise<Producto[]> {
  try {
    const result = await sql`
      SELECT * FROM productos
      ORDER BY fecha_creacion DESC
    `
    return result.rows
  } catch (error) {
    console.error("Error al obtener productos:", error)
    throw error
  }
}

// Obtener un producto por ID
export async function getProductoById(id: number): Promise<Producto | null> {
  try {
    const result = await sql`
      SELECT * FROM productos
      WHERE id = ${id}
    `

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener producto con ID ${id}:`, error)
    throw error
  }
}

// Obtener un producto por Shopify ID
export async function getProductoByShopifyId(shopifyId: string): Promise<Producto | null> {
  try {
    const result = await sql`
      SELECT * FROM productos
      WHERE shopify_id = ${shopifyId}
    `

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener producto con Shopify ID ${shopifyId}:`, error)
    throw error
  }
}

// Crear un nuevo producto
export async function createProducto(data: Partial<Producto>): Promise<Producto> {
  try {
    const {
      shopify_id,
      titulo,
      descripcion,
      tipo_producto,
      proveedor,
      estado,
      publicado = false,
      destacado = false,
      etiquetas,
      imagen_destacada_url,
      precio_base,
      precio_comparacion,
      sku,
      codigo_barras,
      inventario_disponible,
      politica_inventario,
      requiere_envio = true,
      peso,
      unidad_peso = "kg",
      seo_titulo,
      seo_descripcion,
      url_handle,
      fecha_publicacion,
    } = data

    const result = await sql`
      INSERT INTO productos (
        shopify_id, titulo, descripcion, tipo_producto, proveedor, estado,
        publicado, destacado, etiquetas, imagen_destacada_url, precio_base,
        precio_comparacion, sku, codigo_barras, inventario_disponible,
        politica_inventario, requiere_envio, peso, unidad_peso, seo_titulo,
        seo_descripcion, url_handle, fecha_creacion, fecha_actualizacion,
        fecha_publicacion
      )
      VALUES (
        ${shopify_id || null}, ${titulo}, ${descripcion || null}, ${tipo_producto || null},
        ${proveedor || null}, ${estado || null}, ${publicado}, ${destacado},
        ${etiquetas ? JSON.stringify(etiquetas) : null}, ${imagen_destacada_url || null},
        ${precio_base || null}, ${precio_comparacion || null}, ${sku || null},
        ${codigo_barras || null}, ${inventario_disponible || null},
        ${politica_inventario || null}, ${requiere_envio}, ${peso || null},
        ${unidad_peso}, ${seo_titulo || null}, ${seo_descripcion || null},
        ${url_handle || null}, NOW(), NOW(), ${fecha_publicacion || null}
      )
      RETURNING *
    `

    return result.rows[0]
  } catch (error) {
    console.error("Error al crear producto:", error)
    throw error
  }
}

// Actualizar un producto existente
export async function updateProducto(id: number, data: Partial<Producto>): Promise<Producto> {
  try {
    // Primero obtenemos el producto actual
    const currentProducto = await getProductoById(id)
    if (!currentProducto) {
      throw new Error(`Producto con ID ${id} no encontrado`)
    }

    // Combinamos los datos actuales con los nuevos
    const updatedData = {
      ...currentProducto,
      ...data,
      fecha_actualizacion: new Date(),
    }

    const {
      shopify_id,
      titulo,
      descripcion,
      tipo_producto,
      proveedor,
      estado,
      publicado,
      destacado,
      etiquetas,
      imagen_destacada_url,
      precio_base,
      precio_comparacion,
      sku,
      codigo_barras,
      inventario_disponible,
      politica_inventario,
      requiere_envio,
      peso,
      unidad_peso,
      seo_titulo,
      seo_descripcion,
      url_handle,
      fecha_publicacion,
      ultima_sincronizacion,
    } = updatedData

    const result = await sql`
      UPDATE productos
      SET
        shopify_id = ${shopify_id || null},
        titulo = ${titulo},
        descripcion = ${descripcion || null},
        tipo_producto = ${tipo_producto || null},
        proveedor = ${proveedor || null},
        estado = ${estado || null},
        publicado = ${publicado},
        destacado = ${destacado},
        etiquetas = ${etiquetas ? JSON.stringify(etiquetas) : null},
        imagen_destacada_url = ${imagen_destacada_url || null},
        precio_base = ${precio_base || null},
        precio_comparacion = ${precio_comparacion || null},
        sku = ${sku || null},
        codigo_barras = ${codigo_barras || null},
        inventario_disponible = ${inventario_disponible || null},
        politica_inventario = ${politica_inventario || null},
        requiere_envio = ${requiere_envio},
        peso = ${peso || null},
        unidad_peso = ${unidad_peso},
        seo_titulo = ${seo_titulo || null},
        seo_descripcion = ${seo_descripcion || null},
        url_handle = ${url_handle || null},
        fecha_actualizacion = NOW(),
        fecha_publicacion = ${fecha_publicacion || null},
        ultima_sincronizacion = ${ultima_sincronizacion || null}
      WHERE id = ${id}
      RETURNING *
    `

    return result.rows[0]
  } catch (error) {
    console.error(`Error al actualizar producto con ID ${id}:`, error)
    throw error
  }
}

// Eliminar un producto
export async function deleteProducto(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM productos
      WHERE id = ${id}
      RETURNING id
    `

    return result.rows.length > 0
  } catch (error) {
    console.error(`Error al eliminar producto con ID ${id}:`, error)
    throw error
  }
}

// Buscar productos
export async function searchProductos(
  query: string,
  limit = 10,
  offset = 0,
): Promise<{ productos: Producto[]; total: number }> {
  try {
    const searchQuery = `%${query}%`

    const productsResult = await sql`
      SELECT * FROM productos
      WHERE 
        titulo ILIKE ${searchQuery} OR
        descripcion ILIKE ${searchQuery} OR
        tipo_producto ILIKE ${searchQuery} OR
        proveedor ILIKE ${searchQuery} OR
        sku ILIKE ${searchQuery}
      ORDER BY fecha_creacion DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const countResult = await sql`
      SELECT COUNT(*) as total FROM productos
      WHERE 
        titulo ILIKE ${searchQuery} OR
        descripcion ILIKE ${searchQuery} OR
        tipo_producto ILIKE ${searchQuery} OR
        proveedor ILIKE ${searchQuery} OR
        sku ILIKE ${searchQuery}
    `

    return {
      productos: productsResult.rows,
      total: Number.parseInt(countResult.rows[0].total),
    }
  } catch (error) {
    console.error(`Error al buscar productos con query "${query}":`, error)
    throw error
  }
}

// Crear o actualizar una variante de producto
export async function upsertVarianteProducto(data: Partial<VarianteProducto>): Promise<VarianteProducto> {
  try {
    const {
      shopify_id,
      producto_id,
      titulo,
      precio,
      precio_comparacion,
      sku,
      codigo_barras,
      inventario_disponible,
      politica_inventario,
      requiere_envio,
      peso,
      unidad_peso,
      opcion1_nombre,
      opcion1_valor,
      opcion2_nombre,
      opcion2_valor,
      opcion3_nombre,
      opcion3_valor,
      posicion,
    } = data

    // Verificar si la variante ya existe
    const existingVariant = await sql`
      SELECT id FROM variantes_producto
      WHERE shopify_id = ${shopify_id}
    `

    if (existingVariant.rows.length > 0) {
      // Actualizar variante existente
      const result = await sql`
        UPDATE variantes_producto
        SET
          producto_id = ${producto_id},
          titulo = ${titulo},
          precio = ${precio || null},
          precio_comparacion = ${precio_comparacion || null},
          sku = ${sku || null},
          codigo_barras = ${codigo_barras || null},
          inventario_disponible = ${inventario_disponible || null},
          politica_inventario = ${politica_inventario || null},
          requiere_envio = ${requiere_envio !== undefined ? requiere_envio : true},
          peso = ${peso || null},
          unidad_peso = ${unidad_peso || "kg"},
          opcion1_nombre = ${opcion1_nombre || null},
          opcion1_valor = ${opcion1_valor || null},
          opcion2_nombre = ${opcion2_nombre || null},
          opcion2_valor = ${opcion2_valor || null},
          opcion3_nombre = ${opcion3_nombre || null},
          opcion3_valor = ${opcion3_valor || null},
          posicion = ${posicion || 1},
          fecha_actualizacion = NOW(),
          ultima_sincronizacion = NOW()
        WHERE shopify_id = ${shopify_id}
        RETURNING *
      `

      return result.rows[0]
    } else {
      // Crear nueva variante
      const result = await sql`
        INSERT INTO variantes_producto (
          shopify_id, producto_id, titulo, precio, precio_comparacion,
          sku, codigo_barras, inventario_disponible, politica_inventario,
          requiere_envio, peso, unidad_peso, opcion1_nombre, opcion1_valor,
          opcion2_nombre, opcion2_valor, opcion3_nombre, opcion3_valor,
          posicion, fecha_creacion, fecha_actualizacion, ultima_sincronizacion
        )
        VALUES (
          ${shopify_id}, ${producto_id}, ${titulo}, ${precio || null},
          ${precio_comparacion || null}, ${sku || null}, ${codigo_barras || null},
          ${inventario_disponible || null}, ${politica_inventario || null},
          ${requiere_envio !== undefined ? requiere_envio : true}, ${peso || null},
          ${unidad_peso || "kg"}, ${opcion1_nombre || null}, ${opcion1_valor || null},
          ${opcion2_nombre || null}, ${opcion2_valor || null}, ${opcion3_nombre || null},
          ${opcion3_valor || null}, ${posicion || 1}, NOW(), NOW(), NOW()
        )
        RETURNING *
      `

      return result.rows[0]
    }
  } catch (error) {
    console.error("Error al crear/actualizar variante de producto:", error)
    throw error
  }
}

// Crear o actualizar una imagen de producto
export async function upsertImagenProducto(data: Partial<ImagenProducto>): Promise<ImagenProducto> {
  try {
    const { shopify_id, producto_id, variante_id, url, texto_alternativo, posicion, es_destacada } = data

    // Verificar si la imagen ya existe
    const existingImage = await sql`
      SELECT id FROM imagenes_producto
      WHERE shopify_id = ${shopify_id}
    `

    if (existingImage.rows.length > 0) {
      // Actualizar imagen existente
      const result = await sql`
        UPDATE imagenes_producto
        SET
          producto_id = ${producto_id},
          variante_id = ${variante_id || null},
          url = ${url},
          texto_alternativo = ${texto_alternativo || null},
          posicion = ${posicion || 1},
          es_destacada = ${es_destacada || false},
          fecha_actualizacion = NOW(),
          ultima_sincronizacion = NOW()
        WHERE shopify_id = ${shopify_id}
        RETURNING *
      `

      return result.rows[0]
    } else {
      // Crear nueva imagen
      const result = await sql`
        INSERT INTO imagenes_producto (
          shopify_id, producto_id, variante_id, url, texto_alternativo,
          posicion, es_destacada, fecha_creacion, fecha_actualizacion, ultima_sincronizacion
        )
        VALUES (
          ${shopify_id}, ${producto_id}, ${variante_id || null}, ${url},
          ${texto_alternativo || null}, ${posicion || 1}, ${es_destacada || false},
          NOW(), NOW(), NOW()
        )
        RETURNING *
      `

      return result.rows[0]
    }
  } catch (error) {
    console.error("Error al crear/actualizar imagen de producto:", error)
    throw error
  }
}

// Obtener variantes de un producto
export async function getVariantesByProductoId(productoId: number): Promise<VarianteProducto[]> {
  try {
    const result = await sql`
      SELECT * FROM variantes_producto
      WHERE producto_id = ${productoId}
      ORDER BY posicion ASC
    `

    return result.rows
  } catch (error) {
    console.error(`Error al obtener variantes del producto con ID ${productoId}:`, error)
    throw error
  }
}

// Obtener imágenes de un producto
export async function getImagenesByProductoId(productoId: number): Promise<ImagenProducto[]> {
  try {
    const result = await sql`
      SELECT * FROM imagenes_producto
      WHERE producto_id = ${productoId}
      ORDER BY posicion ASC
    `

    return result.rows
  } catch (error) {
    console.error(`Error al obtener imágenes del producto con ID ${productoId}:`, error)
    throw error
  }
}

// Eliminar variantes de un producto que no estén en la lista proporcionada
export async function deleteVariantesNotInList(productoId: number, variantIds: string[]): Promise<void> {
  try {
    if (!variantIds.length) {
      // Si no hay IDs, eliminar todas las variantes del producto
      await sql`
        DELETE FROM variantes_producto
        WHERE producto_id = ${productoId}
      `
    } else {
      // Eliminar solo las variantes que no están en la lista
      const placeholders = variantIds.map((_, i) => `$${i + 2}`).join(", ")
      const query = `
        DELETE FROM variantes_producto
        WHERE producto_id = $1 AND shopify_id NOT IN (${placeholders})
      `
      await sql.query(query, [productoId, ...variantIds])
    }
  } catch (error) {
    console.error(`Error al eliminar variantes del producto con ID ${productoId}:`, error)
    throw error
  }
}

// Eliminar imágenes de un producto que no estén en la lista proporcionada
export async function deleteImagenesNotInList(productoId: number, imageIds: string[]): Promise<void> {
  try {
    if (!imageIds.length) {
      // Si no hay IDs, eliminar todas las imágenes del producto
      await sql`
        DELETE FROM imagenes_producto
        WHERE producto_id = ${productoId}
      `
    } else {
      // Eliminar solo las imágenes que no están en la lista
      const placeholders = imageIds.map((_, i) => `$${i + 2}`).join(", ")
      const query = `
        DELETE FROM imagenes_producto
        WHERE producto_id = $1 AND shopify_id NOT IN (${placeholders})
      `
      await sql.query(query, [productoId, ...imageIds])
    }
  } catch (error) {
    console.error(`Error al eliminar imágenes del producto con ID ${productoId}:`, error)
    throw error
  }
}

// Función para sincronizar un producto de Shopify con la base de datos
export async function syncProductoWithShopify(product: any) {
  try {
    // Verificar si el producto ya existe
    const existingProduct = await checkProductExists(product.id)
    let productDbId

    if (existingProduct) {
      // Actualizar producto existente
      productDbId = existingProduct.id
      await updateProductInDB(productDbId, product)

      // Registrar evento
      await logSyncEvent({
        tipo_entidad: "PRODUCT",
        entidad_id: product.id,
        accion: "UPDATE",
        resultado: "SUCCESS",
        mensaje: `Producto actualizado: ${product.title}`,
      })
    } else {
      // Crear nuevo producto
      productDbId = await insertProductIntoDB(product)

      // Registrar evento
      await logSyncEvent({
        tipo_entidad: "PRODUCT",
        entidad_id: product.id,
        accion: "CREATE",
        resultado: "SUCCESS",
        mensaje: `Producto creado: ${product.title}`,
      })
    }

    // Sincronizar variantes
    if (product.variants && Array.isArray(product.variants)) {
      await syncProductVariants(productDbId, product.id, product.variants)
    }

    // Sincronizar imágenes
    if (product.images && Array.isArray(product.images)) {
      await syncProductImages(productDbId, product.id, product.images)
    }

    return productDbId
  } catch (error) {
    console.error(`Error al sincronizar producto ${product.id}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "PRODUCT",
      entidad_id: product.id,
      accion: "SYNC",
      resultado: "ERROR",
      mensaje: `Error al sincronizar producto: ${(error as Error).message}`,
    })

    throw error
  }
}

// Verificar si un producto existe en la base de datos
async function checkProductExists(shopifyId: string) {
  const result = await sql`SELECT id FROM productos WHERE shopify_id = ${shopifyId}`
  return result.rows.length > 0 ? result.rows[0] : null
}

// Insertar un nuevo producto en la base de datos
async function insertProductIntoDB(product: any) {
  const {
    id: shopify_id,
    title: titulo,
    description: descripcion,
    productType: tipo_producto,
    vendor: proveedor,
    status: estado,
    handle: url_handle,
    tags,
  } = product

  // Extraer datos adicionales
  const publicado = estado === "active"
  const imagen_destacada_url = product.image?.src || null
  const precio_base = product.variants?.[0]?.price || 0
  const precio_comparacion = product.variants?.[0]?.compareAtPrice || null
  const sku = product.variants?.[0]?.sku || null
  const codigo_barras = product.variants?.[0]?.barcode || null
  const inventario_disponible = product.variants?.[0]?.inventoryQuantity || 0
  const politica_inventario = product.variants?.[0]?.inventoryPolicy || null
  const requiere_envio = product.variants?.[0]?.requiresShipping || true
  const peso = product.variants?.[0]?.weight || 0
  const unidad_peso = product.variants?.[0]?.weightUnit || "kg"
  const seo_titulo = product.seo?.title || titulo
  const seo_descripcion = product.seo?.description || descripcion?.substring(0, 160) || null

  // Convertir etiquetas a array si es necesario
  const etiquetas = tags ? (typeof tags === "string" ? tags.split(",") : Array.isArray(tags) ? tags : []) : []

  const result = await sql`
    INSERT INTO productos (
      shopify_id, titulo, descripcion, tipo_producto, proveedor, estado,
      publicado, imagen_destacada_url, precio_base, precio_comparacion, sku,
      codigo_barras, inventario_disponible, politica_inventario, requiere_envio,
      peso, unidad_peso, seo_titulo, seo_descripcion, url_handle, etiquetas,
      fecha_creacion, fecha_actualizacion, ultima_sincronizacion
    ) VALUES (
      ${shopify_id}, ${titulo}, ${descripcion || null}, ${tipo_producto || null}, 
      ${proveedor || null}, ${estado || null}, ${publicado}, 
      ${imagen_destacada_url}, ${precio_base}, ${precio_comparacion}, ${sku},
      ${codigo_barras}, ${inventario_disponible}, ${politica_inventario}, ${requiere_envio},
      ${peso}, ${unidad_peso}, ${seo_titulo}, ${seo_descripcion}, ${url_handle}, 
      ${etiquetas}, NOW(), NOW(), NOW()
    ) RETURNING id
  `

  return result.rows[0].id
}

// Actualizar un producto existente en la base de datos
async function updateProductInDB(id: number, product: any) {
  const {
    id: shopify_id,
    title: titulo,
    description: descripcion,
    productType: tipo_producto,
    vendor: proveedor,
    status: estado,
    handle: url_handle,
    tags,
  } = product

  // Extraer datos adicionales
  const publicado = estado === "active"
  const imagen_destacada_url = product.image?.src || null
  const precio_base = product.variants?.[0]?.price || 0
  const precio_comparacion = product.variants?.[0]?.compareAtPrice || null
  const sku = product.variants?.[0]?.sku || null
  const codigo_barras = product.variants?.[0]?.barcode || null
  const inventario_disponible = product.variants?.[0]?.inventoryQuantity || 0
  const politica_inventario = product.variants?.[0]?.inventoryPolicy || null
  const requiere_envio = product.variants?.[0]?.requiresShipping || true
  const peso = product.variants?.[0]?.weight || 0
  const unidad_peso = product.variants?.[0]?.weightUnit || "kg"
  const seo_titulo = product.seo?.title || titulo
  const seo_descripcion = product.seo?.description || descripcion?.substring(0, 160) || null

  // Convertir etiquetas a array si es necesario
  const etiquetas = tags ? (typeof tags === "string" ? tags.split(",") : Array.isArray(tags) ? tags : []) : []

  await sql`
    UPDATE productos SET
      titulo = ${titulo},
      descripcion = ${descripcion || null},
      tipo_producto = ${tipo_producto || null},
      proveedor = ${proveedor || null},
      estado = ${estado || null},
      publicado = ${publicado},
      imagen_destacada_url = ${imagen_destacada_url},
      precio_base = ${precio_base},
      precio_comparacion = ${precio_comparacion},
      sku = ${sku},
      codigo_barras = ${codigo_barras},
      inventario_disponible = ${inventario_disponible},
      politica_inventario = ${politica_inventario},
      requiere_envio = ${requiere_envio},
      peso = ${peso},
      unidad_peso = ${unidad_peso},
      seo_titulo = ${seo_titulo},
      seo_descripcion = ${seo_descripcion},
      url_handle = ${url_handle},
      etiquetas = ${etiquetas},
      fecha_actualizacion = NOW(),
      ultima_sincronizacion = NOW()
    WHERE id = ${id}
  `
}

// Sincronizar variantes de un producto
async function syncProductVariants(productDbId: number, shopifyProductId: string, variants: any[]) {
  try {
    // Eliminar variantes existentes
    await sql`DELETE FROM variantes_producto WHERE producto_id = ${productDbId}`

    // Insertar nuevas variantes
    for (const variant of variants) {
      await insertProductVariant(productDbId, variant)
    }

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "PRODUCT_VARIANTS",
      entidad_id: shopifyProductId,
      accion: "SYNC",
      resultado: "SUCCESS",
      mensaje: `Variantes sincronizadas: ${variants.length} variantes`,
    })
  } catch (error) {
    console.error(`Error al sincronizar variantes del producto ${shopifyProductId}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "PRODUCT_VARIANTS",
      entidad_id: shopifyProductId,
      accion: "SYNC",
      resultado: "ERROR",
      mensaje: `Error al sincronizar variantes: ${(error as Error).message}`,
    })

    throw error
  }
}

// Insertar una variante de producto
async function insertProductVariant(productDbId: number, variant: any) {
  const {
    id: shopify_id,
    title: titulo,
    price: precio,
    compareAtPrice: precio_comparacion,
    sku,
    barcode: codigo_barras,
    inventoryQuantity: inventario_disponible,
    inventoryPolicy: politica_inventario,
    requiresShipping: requiere_envio,
    weight: peso,
    weightUnit: unidad_peso,
    option1: opcion1_valor,
    option2: opcion2_valor,
    option3: opcion3_valor,
    position: posicion,
  } = variant

  // Obtener nombres de opciones del producto padre si están disponibles
  const opcion1_nombre = variant.option1Name || null
  const opcion2_nombre = variant.option2Name || null
  const opcion3_nombre = variant.option3Name || null

  await sql`
    INSERT INTO variantes_producto (
      shopify_id, producto_id, titulo, precio, precio_comparacion, sku,
      codigo_barras, inventario_disponible, politica_inventario, requiere_envio,
      peso, unidad_peso, opcion1_nombre, opcion1_valor, opcion2_nombre, opcion2_valor,
      opcion3_nombre, opcion3_valor, posicion, fecha_creacion, fecha_actualizacion, ultima_sincronizacion
    ) VALUES (
      ${shopify_id}, ${productDbId}, ${titulo}, ${precio || 0}, ${precio_comparacion || null}, ${sku || null},
      ${codigo_barras || null}, ${inventario_disponible || 0}, ${politica_inventario || null}, ${requiere_envio !== false},
      ${peso || 0}, ${unidad_peso || "kg"}, ${opcion1_nombre}, ${opcion1_valor || null},
      ${opcion2_nombre}, ${opcion2_valor || null}, ${opcion3_nombre}, ${opcion3_valor || null},
      ${posicion || 1}, NOW(), NOW(), NOW()
    )
  `
}

// Sincronizar imágenes de un producto
async function syncProductImages(productDbId: number, shopifyProductId: string, images: any[]) {
  try {
    // Eliminar imágenes existentes
    await sql`DELETE FROM imagenes_producto WHERE producto_id = ${productDbId}`

    // Insertar nuevas imágenes
    for (const image of images) {
      await insertProductImage(productDbId, image)
    }

    // Registrar evento
    await logSyncEvent({
      tipo_entidad: "PRODUCT_IMAGES",
      entidad_id: shopifyProductId,
      accion: "SYNC",
      resultado: "SUCCESS",
      mensaje: `Imágenes sincronizadas: ${images.length} imágenes`,
    })
  } catch (error) {
    console.error(`Error al sincronizar imágenes del producto ${shopifyProductId}:`, error)

    // Registrar error
    await logSyncEvent({
      tipo_entidad: "PRODUCT_IMAGES",
      entidad_id: shopifyProductId,
      accion: "SYNC",
      resultado: "ERROR",
      mensaje: `Error al sincronizar imágenes: ${(error as Error).message}`,
    })

    throw error
  }
}

// Insertar una imagen de producto
async function insertProductImage(productDbId: number, image: any) {
  const { id: shopify_id, src: url, alt: texto_alternativo, position: posicion } = image

  // Determinar si es la imagen destacada
  const es_destacada = posicion === 1

  // Obtener variante asociada si existe
  let variante_id = null
  if (image.variant_ids && image.variant_ids.length > 0) {
    const variantResult = await sql`
      SELECT id FROM variantes_producto 
      WHERE producto_id = ${productDbId} AND shopify_id = ${image.variant_ids[0]}
    `
    if (variantResult.rows.length > 0) {
      variante_id = variantResult.rows[0].id
    }
  }

  await sql`
    INSERT INTO imagenes_producto (
      shopify_id, producto_id, variante_id, url, texto_alternativo,
      posicion, es_destacada, fecha_creacion, fecha_actualizacion, ultima_sincronizacion
    ) VALUES (
      ${shopify_id}, ${productDbId}, ${variante_id}, ${url}, ${texto_alternativo || null},
      ${posicion || 1}, ${es_destacada}, NOW(), NOW(), NOW()
    )
  `
}

// Exportar funciones auxiliares para uso en otros módulos
export { checkProductExists, insertProductIntoDB, updateProductInDB, syncProductVariants, syncProductImages }

// Obtener un producto completo con sus variantes e imágenes
export async function getProductoCompleto(id: number): Promise<any> {
  try {
    const producto = await getProductoById(id)
    if (!producto) {
      throw new Error(`Producto con ID ${id} no encontrado`)
    }

    const variantes = await getVariantesByProductoId(id)
    const imagenes = await getImagenesByProductoId(id)

    return {
      ...producto,
      variantes,
      imagenes,
    }
  } catch (error) {
    console.error(`Error al obtener producto completo con ID ${id}:`, error)
    throw error
  }
}

// Obtener un producto completo por Shopify ID
export async function getProductoCompletoByShopifyId(shopifyId: string): Promise<any> {
  try {
    const producto = await getProductoByShopifyId(shopifyId)
    if (!producto) {
      throw new Error(`Producto con Shopify ID ${shopifyId} no encontrado`)
    }

    return getProductoCompleto(producto.id)
  } catch (error) {
    console.error(`Error al obtener producto completo con Shopify ID ${shopifyId}:`, error)
    throw error
  }
}
