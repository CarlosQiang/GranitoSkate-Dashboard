import { sql } from "@vercel/postgres"
import type { Producto } from "../schema"

// Obtener todos los productos
export async function getAllProductos(): Promise<Producto[]> {
  try {
    const result = await sql.query(`
      SELECT * FROM productos
      ORDER BY fecha_creacion DESC
    `)
    return result.rows
  } catch (error) {
    console.error("Error al obtener productos:", error)
    throw error
  }
}

// Obtener un producto por ID
export async function getProductoById(id: number): Promise<Producto | null> {
  try {
    const result = await sql.query(
      `
      SELECT * FROM productos
      WHERE id = $1
    `,
      [id],
    )

    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error(`Error al obtener producto con ID ${id}:`, error)
    throw error
  }
}

// Obtener un producto por Shopify ID
export async function getProductoByShopifyId(shopifyId: string): Promise<Producto | null> {
  try {
    const result = await sql.query(
      `
      SELECT * FROM productos
      WHERE shopify_id = $1
    `,
      [shopifyId],
    )

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

    const result = await sql.query(
      `
      INSERT INTO productos (
        shopify_id, titulo, descripcion, tipo_producto, proveedor, estado,
        publicado, destacado, etiquetas, imagen_destacada_url, precio_base,
        precio_comparacion, sku, codigo_barras, inventario_disponible,
        politica_inventario, requiere_envio, peso, unidad_peso, seo_titulo,
        seo_descripcion, url_handle, fecha_creacion, fecha_actualizacion,
        fecha_publicacion
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, NOW(), NOW(), $23
      )
      RETURNING *
    `,
      [
        shopify_id || null,
        titulo,
        descripcion || null,
        tipo_producto || null,
        proveedor || null,
        estado || null,
        publicado,
        destacado,
        etiquetas ? JSON.stringify(etiquetas) : null,
        imagen_destacada_url || null,
        precio_base || null,
        precio_comparacion || null,
        sku || null,
        codigo_barras || null,
        inventario_disponible || null,
        politica_inventario || null,
        requiere_envio,
        peso || null,
        unidad_peso,
        seo_titulo || null,
        seo_descripcion || null,
        url_handle || null,
        fecha_publicacion || null,
      ],
    )

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

    const result = await sql.query(
      `
      UPDATE productos
      SET
        shopify_id = $1,
        titulo = $2,
        descripcion = $3,
        tipo_producto = $4,
        proveedor = $5,
        estado = $6,
        publicado = $7,
        destacado = $8,
        etiquetas = $9,
        imagen_destacada_url = $10,
        precio_base = $11,
        precio_comparacion = $12,
        sku = $13,
        codigo_barras = $14,
        inventario_disponible = $15,
        politica_inventario = $16,
        requiere_envio = $17,
        peso = $18,
        unidad_peso = $19,
        seo_titulo = $20,
        seo_descripcion = $21,
        url_handle = $22,
        fecha_actualizacion = NOW(),
        fecha_publicacion = $23,
        ultima_sincronizacion = $24
      WHERE id = $25
      RETURNING *
    `,
      [
        shopify_id || null,
        titulo,
        descripcion || null,
        tipo_producto || null,
        proveedor || null,
        estado || null,
        publicado,
        destacado,
        etiquetas ? JSON.stringify(etiquetas) : null,
        imagen_destacada_url || null,
        precio_base || null,
        precio_comparacion || null,
        sku || null,
        codigo_barras || null,
        inventario_disponible || null,
        politica_inventario || null,
        requiere_envio,
        peso || null,
        unidad_peso,
        seo_titulo || null,
        seo_descripcion || null,
        url_handle || null,
        fecha_publicacion || null,
        ultima_sincronizacion || null,
        id,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error(`Error al actualizar producto con ID ${id}:`, error)
    throw error
  }
}

// Eliminar un producto
export async function deleteProducto(id: number): Promise<boolean> {
  try {
    const result = await sql.query(
      `
      DELETE FROM productos
      WHERE id = $1
      RETURNING id
    `,
      [id],
    )

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

    const productsResult = await sql.query(
      `
      SELECT * FROM productos
      WHERE 
        titulo ILIKE $1 OR
        descripcion ILIKE $1 OR
        tipo_producto ILIKE $1 OR
        proveedor ILIKE $1 OR
        sku ILIKE $1
      ORDER BY fecha_creacion DESC
      LIMIT $2 OFFSET $3
    `,
      [searchQuery, limit, offset],
    )

    const countResult = await sql.query(
      `
      SELECT COUNT(*) as total FROM productos
      WHERE 
        titulo ILIKE $1 OR
        descripcion ILIKE $1 OR
        tipo_producto ILIKE $1 OR
        proveedor ILIKE $1 OR
        sku ILIKE $1
    `,
      [searchQuery],
    )

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
export async function upsertVarianteProducto(data: any): Promise<any> {
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
    const existingVariant = await sql.query(
      `
      SELECT id FROM variantes_producto
      WHERE shopify_id = $1
    `,
      [shopify_id],
    )

    if (existingVariant.rows.length > 0) {
      // Actualizar variante existente
      const result = await sql.query(
        `
        UPDATE variantes_producto
        SET
          producto_id = $2,
          titulo = $3,
          precio = $4,
          precio_comparacion = $5,
          sku = $6,
          codigo_barras = $7,
          inventario_disponible = $8,
          politica_inventario = $9,
          requiere_envio = $10,
          peso = $11,
          unidad_peso = $12,
          opcion1_nombre = $13,
          opcion1_valor = $14,
          opcion2_nombre = $15,
          opcion2_valor = $16,
          opcion3_nombre = $17,
          opcion3_valor = $18,
          posicion = $19,
          fecha_actualizacion = NOW(),
          ultima_sincronizacion = NOW()
        WHERE shopify_id = $1
        RETURNING *
      `,
        [
          shopify_id,
          producto_id,
          titulo,
          precio || null,
          precio_comparacion || null,
          sku || null,
          codigo_barras || null,
          inventario_disponible || null,
          politica_inventario || null,
          requiere_envio !== undefined ? requiere_envio : true,
          peso || null,
          unidad_peso || "kg",
          opcion1_nombre || null,
          opcion1_valor || null,
          opcion2_nombre || null,
          opcion2_valor || null,
          opcion3_nombre || null,
          opcion3_valor || null,
          posicion || 1,
        ],
      )

      return result.rows[0]
    } else {
      // Crear nueva variante
      const result = await sql.query(
        `
        INSERT INTO variantes_producto (
          shopify_id, producto_id, titulo, precio, precio_comparacion,
          sku, codigo_barras, inventario_disponible, politica_inventario,
          requiere_envio, peso, unidad_peso, opcion1_nombre, opcion1_valor,
          opcion2_nombre, opcion2_valor, opcion3_nombre, opcion3_valor,
          posicion, fecha_creacion, fecha_actualizacion, ultima_sincronizacion
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, NOW(), NOW(), NOW()
        )
        RETURNING *
      `,
        [
          shopify_id,
          producto_id,
          titulo,
          precio || null,
          precio_comparacion || null,
          sku || null,
          codigo_barras || null,
          inventario_disponible || null,
          politica_inventario || null,
          requiere_envio !== undefined ? requiere_envio : true,
          peso || null,
          unidad_peso || "kg",
          opcion1_nombre || null,
          opcion1_valor || null,
          opcion2_nombre || null,
          opcion2_valor || null,
          opcion3_nombre || null,
          opcion3_valor || null,
          posicion || 1,
        ],
      )

      return result.rows[0]
    }
  } catch (error) {
    console.error("Error al crear/actualizar variante de producto:", error)
    throw error
  }
}

// Crear o actualizar una imagen de producto
export async function upsertImagenProducto(data: any): Promise<any> {
  try {
    const { shopify_id, producto_id, variante_id, url, texto_alternativo, posicion, es_destacada } = data

    // Verificar si la imagen ya existe
    const existingImage = await sql.query(
      `
      SELECT id FROM imagenes_producto
      WHERE shopify_id = $1
    `,
      [shopify_id],
    )

    if (existingImage.rows.length > 0) {
      // Actualizar imagen existente
      const result = await sql.query(
        `
        UPDATE imagenes_producto
        SET
          producto_id = $2,
          variante_id = $3,
          url = $4,
          texto_alternativo = $5,
          posicion = $6,
          es_destacada = $7,
          fecha_actualizacion = NOW(),
          ultima_sincronizacion = NOW()
        WHERE shopify_id = $1
        RETURNING *
      `,
        [
          shopify_id,
          producto_id,
          variante_id || null,
          url,
          texto_alternativo || null,
          posicion || 1,
          es_destacada || false,
        ],
      )

      return result.rows[0]
    } else {
      // Crear nueva imagen
      const result = await sql.query(
        `
        INSERT INTO imagenes_producto (
          shopify_id, producto_id, variante_id, url, texto_alternativo,
          posicion, es_destacada, fecha_creacion, fecha_actualizacion, ultima_sincronizacion
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW()
        )
        RETURNING *
      `,
        [
          shopify_id,
          producto_id,
          variante_id || null,
          url,
          texto_alternativo || null,
          posicion || 1,
          es_destacada || false,
        ],
      )

      return result.rows[0]
    }
  } catch (error) {
    console.error("Error al crear/actualizar imagen de producto:", error)
    throw error
  }
}

// Obtener variantes de un producto
export async function getVariantesByProductoId(productoId: number): Promise<any[]> {
  try {
    const result = await sql.query(
      `
      SELECT * FROM variantes_producto
      WHERE producto_id = $1
      ORDER BY posicion ASC
    `,
      [productoId],
    )

    return result.rows
  } catch (error) {
    console.error(`Error al obtener variantes del producto con ID ${productoId}:`, error)
    throw error
  }
}

// Obtener imágenes de un producto
export async function getImagenesByProductoId(productoId: number): Promise<any[]> {
  try {
    const result = await sql.query(
      `
      SELECT * FROM imagenes_producto
      WHERE producto_id = $1
      ORDER BY posicion ASC
    `,
      [productoId],
    )

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
      await sql.query(
        `
        DELETE FROM variantes_producto
        WHERE producto_id = $1
      `,
        [productoId],
      )
    } else {
      // Eliminar solo las variantes que no están en la lista
      await sql.query(
        `
        DELETE FROM variantes_producto
        WHERE producto_id = $1 AND shopify_id NOT IN (${variantIds.map((_, i) => `$${i + 2}`).join(", ")})
      `,
        [productoId, ...variantIds],
      )
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
      await sql.query(
        `
        DELETE FROM imagenes_producto
        WHERE producto_id = $1
      `,
        [productoId],
      )
    } else {
      // Eliminar solo las imágenes que no están en la lista
      await sql.query(
        `
        DELETE FROM imagenes_producto
        WHERE producto_id = $1 AND shopify_id NOT IN (${imageIds.map((_, i) => `$${i + 2}`).join(", ")})
      `,
        [productoId, ...imageIds],
      )
    }
  } catch (error) {
    console.error(`Error al eliminar imágenes del producto con ID ${productoId}:`, error)
    throw error
  }
}

// Sincronizar un producto con Shopify
export async function syncProductoWithShopify(shopifyProducto: any): Promise<Producto> {
  try {
    // Extraer datos del producto
    const {
      id: shopifyId,
      title: titulo,
      body_html: descripcion,
      product_type: tipo_producto,
      vendor: proveedor,
      status: estado,
      published_at: fecha_publicacion,
      handle: url_handle,
      tags,
      variants: variantes,
      images: imagenes,
      options: opciones,
    } = shopifyProducto

    // Procesar etiquetas
    const etiquetasArray = tags ? tags.split(",").map((tag: string) => tag.trim()) : []

    // Determinar si el producto está publicado
    const publicado = estado === "active"

    // Obtener la imagen destacada
    const imagen_destacada = imagenes && imagenes.length > 0 ? imagenes.find((img: any) => img.position === 1) : null
    const imagen_destacada_url = imagen_destacada ? imagen_destacada.src : null

    // Obtener datos de la primera variante para valores por defecto
    const primeraVariante = variantes && variantes.length > 0 ? variantes[0] : null
    const precio_base = primeraVariante ? primeraVariante.price : null
    const precio_comparacion = primeraVariante ? primeraVariante.compare_at_price : null
    const sku = primeraVariante ? primeraVariante.sku : null
    const codigo_barras = primeraVariante ? primeraVariante.barcode : null
    const inventario_disponible = primeraVariante ? primeraVariante.inventory_quantity : null
    const politica_inventario = primeraVariante ? primeraVariante.inventory_policy : null
    const requiere_envio = primeraVariante ? primeraVariante.requires_shipping : true
    const peso = primeraVariante ? primeraVariante.weight : null
    const unidad_peso = primeraVariante ? primeraVariante.weight_unit : "kg"

    // Buscar si el producto ya existe
    const existingProducto = await getProductoByShopifyId(shopifyId)

    let producto: Producto

    if (existingProducto) {
      // Actualizar producto existente
      producto = await updateProducto(existingProducto.id, {
        titulo,
        descripcion,
        tipo_producto,
        proveedor,
        estado,
        publicado,
        etiquetas: etiquetasArray,
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
        url_handle,
        fecha_publicacion: fecha_publicacion ? new Date(fecha_publicacion) : null,
        ultima_sincronizacion: new Date(),
      })
    } else {
      // Crear nuevo producto
      producto = await createProducto({
        shopify_id: shopifyId,
        titulo,
        descripcion,
        tipo_producto,
        proveedor,
        estado,
        publicado,
        destacado: false,
        etiquetas: etiquetasArray,
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
        url_handle,
        fecha_publicacion: fecha_publicacion ? new Date(fecha_publicacion) : null,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
        ultima_sincronizacion: new Date(),
      })
    }

    // Sincronizar variantes
    const variantIds: string[] = []
    if (variantes && variantes.length > 0) {
      for (const variante of variantes) {
        const varianteData = {
          shopify_id: variante.id,
          producto_id: producto.id,
          titulo: variante.title,
          precio: variante.price,
          precio_comparacion: variante.compare_at_price,
          sku: variante.sku,
          codigo_barras: variante.barcode,
          inventario_disponible: variante.inventory_quantity,
          politica_inventario: variante.inventory_policy,
          requiere_envio: variante.requires_shipping,
          peso: variante.weight,
          unidad_peso: variante.weight_unit,
          opcion1_nombre: opciones && opciones.length > 0 ? opciones[0].name : null,
          opcion1_valor: variante.option1,
          opcion2_nombre: opciones && opciones.length > 1 ? opciones[1].name : null,
          opcion2_valor: variante.option2,
          opcion3_nombre: opciones && opciones.length > 2 ? opciones[2].name : null,
          opcion3_valor: variante.option3,
          posicion: variante.position,
        }

        await upsertVarianteProducto(varianteData)
        variantIds.push(variante.id)
      }
    }

    // Eliminar variantes que ya no existen
    await deleteVariantesNotInList(producto.id, variantIds)

    // Sincronizar imágenes
    const imageIds: string[] = []
    if (imagenes && imagenes.length > 0) {
      for (const imagen of imagenes) {
        // Buscar la variante asociada a esta imagen
        let varianteId = null
        if (imagen.variant_ids && imagen.variant_ids.length > 0) {
          const varianteResult = await sql.query(
            `
            SELECT id FROM variantes_producto
            WHERE shopify_id = $1
          `,
            [imagen.variant_ids[0]],
          )
          if (varianteResult.rows.length > 0) {
            varianteId = varianteResult.rows[0].id
          }
        }

        const imagenData = {
          shopify_id: imagen.id,
          producto_id: producto.id,
          variante_id: varianteId,
          url: imagen.src,
          texto_alternativo: imagen.alt,
          posicion: imagen.position,
          es_destacada: imagen.position === 1,
        }

        await upsertImagenProducto(imagenData)
        imageIds.push(imagen.id)
      }
    }

    // Eliminar imágenes que ya no existen
    await deleteImagenesNotInList(producto.id, imageIds)

    return producto
  } catch (error) {
    console.error(`Error al sincronizar producto con Shopify ID ${shopifyProducto.id}:`, error)
    throw error
  }
}

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
