import { NextResponse } from "next/server"
import { sincronizarProductos } from "@/lib/services/sync-service"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { shopifyConfig } from "@/lib/config/shopify"
import db from "@/lib/db"

// Marcar la ruta como dinámica para evitar errores de renderizado estático
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Verificar que las variables de entorno estén configuradas
    if (!shopifyConfig.shopDomain || !shopifyConfig.accessToken) {
      return NextResponse.json({ error: "Faltan credenciales de Shopify en las variables de entorno" }, { status: 500 })
    }

    // Construir la URL de la API de Shopify
    const url = `https://${shopifyConfig.shopDomain}/admin/api/${shopifyConfig.apiVersion}/products.json?limit=50`

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
        { error: `Error al obtener productos de Shopify: ${response.statusText}` },
        { status: response.status },
      )
    }

    // Obtener los datos de los productos
    const data = await response.json()
    const products = data.products

    // Transformar los datos para guardarlos en la base de datos
    const transformedProducts = products.map((product) => ({
      id: product.id.toString(),
      shopify_id: product.id.toString(),
      title: product.title,
      titulo: product.title,
      description: product.body_html,
      descripcion: product.body_html,
      price: product.variants[0]?.price || "0.00",
      precio: product.variants[0]?.price || "0.00",
      image: product.image?.src || null,
      imagen_url: product.image?.src || null,
      status: product.status,
      estado: product.status,
      created_at: product.created_at,
      updated_at: product.updated_at,
      vendor: product.vendor,
      proveedor: product.vendor,
      product_type: product.product_type,
      tipo_producto: product.product_type,
      tags: product.tags,
      etiquetas: product.tags,
      handle: product.handle,
      url: product.handle,
      variants: product.variants,
      variantes: product.variants,
      inventory: product.variants[0]?.inventory_quantity || 0,
      inventario: product.variants[0]?.inventory_quantity || 0,
    }))

    // Guardar los productos en la base de datos
    const savedProducts = []
    for (const product of transformedProducts) {
      try {
        // Verificar si el producto ya existe
        const existingProduct = await db.query("SELECT * FROM productos WHERE shopify_id = $1", [product.shopify_id])

        if (existingProduct.rows.length > 0) {
          // Actualizar el producto existente
          const updateResult = await db.query(
            `
            UPDATE productos SET
              titulo = $1,
              descripcion = $2,
              imagen_url = $3,
              estado = $4,
              inventario = $5,
              actualizado_en = $6
            WHERE shopify_id = $7
            RETURNING *
            `,
            [
              product.titulo,
              product.descripcion,
              product.imagen_url,
              product.estado,
              product.inventario,
              new Date().toISOString(),
              product.shopify_id,
            ],
          )

          savedProducts.push(updateResult.rows[0])
        } else {
          // Insertar un nuevo producto
          const insertResult = await db.query(
            `
            INSERT INTO productos (
              shopify_id,
              id_numerico,
              titulo,
              descripcion,
              imagen_url,
              estado,
              inventario,
              creado_en,
              actualizado_en
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9
            )
            RETURNING *
            `,
            [
              product.shopify_id,
              product.id,
              product.titulo,
              product.descripcion,
              product.imagen_url,
              product.estado,
              product.inventario,
              new Date().toISOString(),
              new Date().toISOString(),
            ],
          )

          savedProducts.push(insertResult.rows[0])
        }
      } catch (error) {
        console.error(`Error al guardar el producto ${product.titulo}:`, error)
      }
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
      ["productos", savedProducts.length, JSON.stringify({ total: products.length }), new Date().toISOString()],
    )

    return NextResponse.json({
      success: true,
      message: `Se sincronizaron ${savedProducts.length} productos de ${products.length} obtenidos de Shopify`,
      data: {
        total: products.length,
        saved: savedProducts.length,
      },
    })
  } catch (error: any) {
    console.error("Error al sincronizar productos:", error)
    return NextResponse.json({ error: `Error al sincronizar productos: ${error.message}` }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de la solicitud
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)

    // Sincronizar productos reales de Shopify
    const resultados = await sincronizarProductos(limit)

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${resultados.creados} creados, ${resultados.actualizados} actualizados, ${resultados.errores} errores`,
      resultados,
    })
  } catch (error) {
    console.error("Error en la sincronización de productos:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
