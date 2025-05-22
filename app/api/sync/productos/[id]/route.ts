import { NextResponse } from "next/server"
import { shopifyConfig } from "@/lib/config/shopify"
import db from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    // Verificar que las variables de entorno estén configuradas
    if (!shopifyConfig.shopDomain || !shopifyConfig.accessToken) {
      return NextResponse.json({ error: "Faltan credenciales de Shopify en las variables de entorno" }, { status: 500 })
    }

    // Construir la URL de la API de Shopify
    const url = `https://${shopifyConfig.shopDomain}/admin/api/${shopifyConfig.apiVersion}/products/${productId}.json`

    // Realizar la petición a Shopify
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": shopifyConfig.accessToken,
      },
    })

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Error en la respuesta de Shopify (${response.status}):`, errorText)
      return NextResponse.json(
        { error: `Error al obtener el producto de Shopify: ${response.statusText}` },
        { status: response.status },
      )
    }

    // Obtener los datos del producto
    const data = await response.json()
    const product = data.product

    // Transformar los datos para guardarlos en la base de datos
    const transformedProduct = {
      shopify_id: product.id.toString(),
      id_numerico: product.id.toString(),
      titulo: product.title,
      descripcion: product.body_html,
      descripcion_html: product.body_html,
      tipo_producto: product.product_type,
      proveedor: product.vendor,
      estado: product.status,
      publicado_en: product.published_at,
      handle: product.handle,
      etiquetas: product.tags,
      imagen_url: product.image?.src || null,
      imagen_alt: product.image?.altText || null,
      precio: product.variants[0]?.price || "0.00",
      precio_comparacion: product.variants[0]?.compare_at_price || null,
      sku: product.variants[0]?.sku || null,
      codigo_barras: product.variants[0]?.barcode || null,
      inventario: product.variants[0]?.inventory_quantity || 0,
      politica_inventario: product.variants[0]?.inventory_policy || null,
      peso: product.variants[0]?.weight || null,
      unidad_peso: product.variants[0]?.weight_unit || null,
      variantes: JSON.stringify(product.variants),
      imagenes: JSON.stringify(product.images),
      metadatos: JSON.stringify(product.metafields || []),
      actualizado_en: new Date().toISOString(),
    }

    // Guardar el producto en la base de datos
    try {
      // Verificar si el producto ya existe
      const existingProduct = await db.query("SELECT * FROM productos WHERE shopify_id = $1", [
        transformedProduct.shopify_id,
      ])

      let savedProduct

      if (existingProduct.rows.length > 0) {
        // Actualizar el producto existente
        const updateResult = await db.query(
          `
          UPDATE productos SET
            titulo = $1,
            descripcion = $2,
            descripcion_html = $3,
            tipo_producto = $4,
            proveedor = $5,
            estado = $6,
            publicado_en = $7,
            handle = $8,
            etiquetas = $9,
            imagen_url = $10,
            imagen_alt = $11,
            precio = $12,
            precio_comparacion = $13,
            sku = $14,
            codigo_barras = $15,
            inventario = $16,
            politica_inventario = $17,
            peso = $18,
            unidad_peso = $19,
            variantes = $20,
            imagenes = $21,
            metadatos = $22,
            actualizado_en = $23
          WHERE shopify_id = $24
          RETURNING *
          `,
          [
            transformedProduct.titulo,
            transformedProduct.descripcion,
            transformedProduct.descripcion_html,
            transformedProduct.tipo_producto,
            transformedProduct.proveedor,
            transformedProduct.estado,
            transformedProduct.publicado_en,
            transformedProduct.handle,
            transformedProduct.etiquetas,
            transformedProduct.imagen_url,
            transformedProduct.imagen_alt,
            transformedProduct.precio,
            transformedProduct.precio_comparacion,
            transformedProduct.sku,
            transformedProduct.codigo_barras,
            transformedProduct.inventario,
            transformedProduct.politica_inventario,
            transformedProduct.peso,
            transformedProduct.unidad_peso,
            transformedProduct.variantes,
            transformedProduct.imagenes,
            transformedProduct.metadatos,
            transformedProduct.actualizado_en,
            transformedProduct.shopify_id,
          ],
        )

        savedProduct = updateResult.rows[0]
      } else {
        // Insertar un nuevo producto
        const insertResult = await db.query(
          `
          INSERT INTO productos (
            shopify_id,
            id_numerico,
            titulo,
            descripcion,
            descripcion_html,
            tipo_producto,
            proveedor,
            estado,
            publicado_en,
            handle,
            etiquetas,
            imagen_url,
            imagen_alt,
            precio,
            precio_comparacion,
            sku,
            codigo_barras,
            inventario,
            politica_inventario,
            peso,
            unidad_peso,
            variantes,
            imagenes,
            metadatos,
            creado_en,
            actualizado_en
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26
          )
          RETURNING *
          `,
          [
            transformedProduct.shopify_id,
            transformedProduct.id_numerico,
            transformedProduct.titulo,
            transformedProduct.descripcion,
            transformedProduct.descripcion_html,
            transformedProduct.tipo_producto,
            transformedProduct.proveedor,
            transformedProduct.estado,
            transformedProduct.publicado_en,
            transformedProduct.handle,
            transformedProduct.etiquetas,
            transformedProduct.imagen_url,
            transformedProduct.imagen_alt,
            transformedProduct.precio,
            transformedProduct.precio_comparacion,
            transformedProduct.sku,
            transformedProduct.codigo_barras,
            transformedProduct.inventario,
            transformedProduct.politica_inventario,
            transformedProduct.peso,
            transformedProduct.unidad_peso,
            transformedProduct.variantes,
            transformedProduct.imagenes,
            transformedProduct.metadatos,
            new Date().toISOString(),
            new Date().toISOString(),
          ],
        )

        savedProduct = insertResult.rows[0]
      }

      // Registrar la sincronización
      await db.query(
        `
        INSERT INTO registro_sincronizacion (
          tipo,
          cantidad,
          detalles,
          fecha
        ) VALUES (
          $1, $2, $3, $4
        )
        `,
        ["producto_individual", 1, JSON.stringify({ id: productId }), new Date().toISOString()],
      )

      return NextResponse.json({
        success: true,
        message: `Producto ${existingProduct.rows.length > 0 ? "actualizado" : "creado"} correctamente`,
        data: savedProduct,
      })
    } catch (dbError) {
      console.error(`Error al guardar el producto en la base de datos:`, dbError)

      // Si hay un error en la base de datos, devolver el producto de Shopify de todos modos
      return NextResponse.json({
        success: true,
        message: "Producto obtenido de Shopify correctamente, pero no se pudo guardar en la base de datos",
        data: transformedProduct,
        dbError: dbError.message,
      })
    }
  } catch (error: any) {
    console.error("Error al sincronizar el producto:", error)
    return NextResponse.json({ error: `Error al sincronizar el producto: ${error.message}` }, { status: 500 })
  }
}
