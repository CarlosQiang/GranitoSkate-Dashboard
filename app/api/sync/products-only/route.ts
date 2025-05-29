import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    const { products } = await request.json()

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: "No se proporcionaron productos para sincronizar" }, { status: 400 })
    }

    console.log("🔄 Iniciando sincronización SOLO de productos...")
    console.log("📦 Productos recibidos:", products.length)
    console.log("📋 Primer producto de ejemplo:", products[0])

    const results = {
      insertados: 0,
      actualizados: 0,
      errores: 0,
      detalles: [],
    }

    // Verificar que la tabla productos existe
    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'productos'
        );
      `
      console.log("🔍 Tabla productos existe:", tableCheck.rows[0].exists)

      if (!tableCheck.rows[0].exists) {
        console.log("❌ La tabla productos no existe, creándola...")
        await sql`
          CREATE TABLE productos (
            id SERIAL PRIMARY KEY,
            shopify_id VARCHAR(255) UNIQUE NOT NULL,
            titulo VARCHAR(500) NOT NULL,
            descripcion TEXT,
            estado VARCHAR(50) DEFAULT 'ACTIVE',
            precio_base DECIMAL(10,2) DEFAULT 0,
            inventario_disponible INTEGER DEFAULT 0,
            tipo_producto VARCHAR(100),
            proveedor VARCHAR(255),
            imagen_destacada_url TEXT,
            url_handle VARCHAR(255),
            publicado BOOLEAN DEFAULT true,
            creado_en TIMESTAMP DEFAULT NOW(),
            actualizado_en TIMESTAMP DEFAULT NOW()
          );
        `
        console.log("✅ Tabla productos creada")
      }
    } catch (error) {
      console.error("❌ Error verificando/creando tabla productos:", error)
      return NextResponse.json({ error: "Error con la tabla productos" }, { status: 500 })
    }

    // Procesar cada producto
    for (let i = 0; i < products.length; i++) {
      const producto = products[i]

      try {
        console.log(`\n📝 Procesando producto ${i + 1}/${products.length}:`, {
          id: producto.id,
          title: producto.title,
          price: producto.price,
          inventory: producto.inventory,
        })

        if (!producto.id || !producto.title) {
          console.warn("⚠️ Producto sin ID o título:", producto)
          results.errores++
          results.detalles.push(`Error: Producto sin ID o título`)
          continue
        }

        // Limpiar el ID de Shopify
        const shopifyId = String(producto.id).replace("gid://shopify/Product/", "")
        console.log("🔑 Shopify ID limpio:", shopifyId)

        // Verificar si el producto ya existe
        const existingProduct = await sql`
          SELECT id FROM productos WHERE shopify_id = ${shopifyId}
        `
        console.log("🔍 Producto existente:", existingProduct.rows.length > 0)

        // Preparar datos del producto
        const productData = {
          shopify_id: shopifyId,
          titulo: String(producto.title),
          descripcion: String(producto.description || ""),
          estado: String(producto.status || "ACTIVE"),
          precio_base: Number.parseFloat(String(producto.price || "0")),
          inventario_disponible: Number.parseInt(String(producto.inventory || "0")),
          tipo_producto: String(producto.productType || "SKATEBOARD"),
          proveedor: String(producto.vendor || "GranitoSkate"),
          imagen_destacada_url: producto.image ? String(producto.image) : null,
          url_handle: String(producto.handle || producto.title.toLowerCase().replace(/\s+/g, "-")),
          publicado: true,
        }

        console.log("📊 Datos preparados:", productData)

        if (existingProduct.rows.length > 0) {
          // Actualizar producto existente
          console.log("🔄 Actualizando producto existente...")
          await sql`
            UPDATE productos SET
              titulo = ${productData.titulo},
              descripcion = ${productData.descripcion},
              estado = ${productData.estado},
              precio_base = ${productData.precio_base},
              inventario_disponible = ${productData.inventario_disponible},
              tipo_producto = ${productData.tipo_producto},
              proveedor = ${productData.proveedor},
              imagen_destacada_url = ${productData.imagen_destacada_url},
              url_handle = ${productData.url_handle},
              publicado = ${productData.publicado},
              actualizado_en = NOW()
            WHERE shopify_id = ${shopifyId}
          `
          results.actualizados++
          results.detalles.push(`Actualizado: ${productData.titulo}`)
          console.log("✅ Producto actualizado")
        } else {
          // Insertar nuevo producto
          console.log("➕ Insertando nuevo producto...")
          await sql`
            INSERT INTO productos (
              shopify_id, titulo, descripcion, estado, precio_base,
              inventario_disponible, tipo_producto, proveedor,
              imagen_destacada_url, url_handle, publicado,
              creado_en, actualizado_en
            ) VALUES (
              ${productData.shopify_id}, ${productData.titulo}, ${productData.descripcion},
              ${productData.estado}, ${productData.precio_base}, ${productData.inventario_disponible},
              ${productData.tipo_producto}, ${productData.proveedor}, ${productData.imagen_destacada_url},
              ${productData.url_handle}, ${productData.publicado}, NOW(), NOW()
            )
          `
          results.insertados++
          results.detalles.push(`Insertado: ${productData.titulo}`)
          console.log("✅ Producto insertado")
        }
      } catch (error) {
        console.error(`❌ Error procesando producto ${i + 1}:`, error)
        results.errores++
        results.detalles.push(
          `Error en producto ${i + 1}: ${error instanceof Error ? error.message : "Error desconocido"}`,
        )
      }
    }

    // Verificar el resultado final
    const finalCount = await sql`SELECT COUNT(*) as count FROM productos`
    console.log("📊 Total productos en BD después de sincronización:", finalCount.rows[0].count)

    console.log("✅ Sincronización de productos completada:", results)

    return NextResponse.json({
      success: true,
      message: `Productos sincronizados: ${results.insertados} insertados, ${results.actualizados} actualizados, ${results.errores} errores`,
      results,
      totalEnBD: Number.parseInt(finalCount.rows[0].count),
    })
  } catch (error) {
    console.error("❌ Error general en sincronización de productos:", error)
    return NextResponse.json(
      {
        error: "Error en la sincronización de productos",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
