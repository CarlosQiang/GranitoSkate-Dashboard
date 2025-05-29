import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    const { tipo, datos } = await request.json()

    if (!tipo || !datos || !Array.isArray(datos)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    console.log(`🔄 Sincronizando ${tipo}: ${datos.length} elementos`)
    console.log(`📋 Estructura del primer elemento:`, JSON.stringify(datos[0], null, 2))

    const resultado = {
      insertados: 0,
      actualizados: 0,
      errores: 0,
    }

    if (tipo === "productos") {
      for (const producto of datos) {
        try {
          console.log(`📦 Procesando producto:`, {
            id: producto.id,
            title: producto.title,
            status: producto.status,
            variants: producto.variants?.length || 0,
          })

          if (!producto.id || !producto.title) {
            console.warn(`⚠️ Producto sin ID o título:`, producto)
            resultado.errores++
            continue
          }

          // Extraer ID de Shopify correctamente
          let shopifyId = producto.id
          if (typeof shopifyId === "string" && shopifyId.includes("gid://shopify/Product/")) {
            shopifyId = shopifyId.replace("gid://shopify/Product/", "")
          }

          // Obtener datos del primer variant
          const variant = producto.variants?.[0] || {}
          const precio = Number.parseFloat(variant.price || "0")
          const inventario = Number.parseInt(variant.inventoryQuantity || "0")

          // Obtener imagen
          const imagen = producto.featuredImage?.url || producto.image?.url || null

          console.log(`💰 Datos del producto: precio=${precio}, inventario=${inventario}, imagen=${imagen}`)

          // Verificar si existe
          const existeProducto = await sql`
            SELECT id FROM productos WHERE shopify_id = ${shopifyId}
          `

          if (existeProducto.rows.length > 0) {
            // Actualizar
            await sql`
              UPDATE productos SET 
                titulo = ${producto.title},
                descripcion = ${producto.description || ""},
                estado = ${producto.status || "ACTIVE"},
                precio_base = ${precio},
                inventario_disponible = ${inventario},
                tipo_producto = ${producto.productType || "SKATEBOARD"},
                proveedor = ${producto.vendor || "GranitoSkate"},
                imagen_destacada_url = ${imagen},
                url_handle = ${producto.handle || producto.title.toLowerCase().replace(/\s+/g, "-")},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            resultado.actualizados++
            console.log(`✅ Producto actualizado: ${producto.title}`)
          } else {
            // Insertar
            await sql`
              INSERT INTO productos (
                shopify_id, titulo, descripcion, estado, precio_base, inventario_disponible,
                tipo_producto, proveedor, imagen_destacada_url, url_handle,
                creado_en, actualizado_en
              ) VALUES (
                ${shopifyId}, ${producto.title}, ${producto.description || ""}, ${producto.status || "ACTIVE"},
                ${precio}, ${inventario}, ${producto.productType || "SKATEBOARD"}, 
                ${producto.vendor || "GranitoSkate"}, ${imagen}, 
                ${producto.handle || producto.title.toLowerCase().replace(/\s+/g, "-")},
                NOW(), NOW()
              )
            `
            resultado.insertados++
            console.log(`✅ Producto insertado: ${producto.title}`)
          }
        } catch (error) {
          console.error(`❌ Error con producto ${producto.id}:`, error)
          resultado.errores++
        }
      }
    }

    if (tipo === "pedidos") {
      for (const pedido of datos) {
        try {
          console.log(`🛒 Procesando pedido:`, {
            id: pedido.id,
            name: pedido.name,
            totalPrice: pedido.totalPrice,
            customer: pedido.customer?.email,
          })

          if (!pedido.id) {
            console.warn(`⚠️ Pedido sin ID:`, pedido)
            resultado.errores++
            continue
          }

          // Extraer ID de Shopify correctamente
          let shopifyId = pedido.id
          if (typeof shopifyId === "string" && shopifyId.includes("gid://shopify/Order/")) {
            shopifyId = shopifyId.replace("gid://shopify/Order/", "")
          }

          const total = Number.parseFloat(pedido.totalPrice || "0")
          const numeroOrden = pedido.name || `#${shopifyId}`
          const emailCliente = pedido.customer?.email || ""

          console.log(`💰 Datos del pedido: total=${total}, numero=${numeroOrden}, email=${emailCliente}`)

          const existePedido = await sql`
            SELECT id FROM pedidos WHERE shopify_id = ${shopifyId}
          `

          if (existePedido.rows.length > 0) {
            await sql`
              UPDATE pedidos SET 
                numero_pedido = ${numeroOrden},
                total = ${total},
                moneda = ${pedido.currencyCode || "EUR"},
                email_cliente = ${emailCliente},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            resultado.actualizados++
            console.log(`✅ Pedido actualizado: ${numeroOrden}`)
          } else {
            await sql`
              INSERT INTO pedidos (
                shopify_id, numero_pedido, total, moneda, email_cliente,
                creado_en, actualizado_en
              ) VALUES (
                ${shopifyId}, ${numeroOrden}, ${total}, ${pedido.currencyCode || "EUR"}, 
                ${emailCliente}, NOW(), NOW()
              )
            `
            resultado.insertados++
            console.log(`✅ Pedido insertado: ${numeroOrden}`)
          }
        } catch (error) {
          console.error(`❌ Error con pedido ${pedido.id}:`, error)
          resultado.errores++
        }
      }
    }

    if (tipo === "clientes") {
      for (const cliente of datos) {
        try {
          if (!cliente.id || !cliente.email) {
            resultado.errores++
            continue
          }

          let shopifyId = cliente.id
          if (typeof shopifyId === "string" && shopifyId.includes("gid://shopify/Customer/")) {
            shopifyId = shopifyId.replace("gid://shopify/Customer/", "")
          }

          const nombreCompleto = `${cliente.firstName || ""} ${cliente.lastName || ""}`.trim() || "Cliente"

          const existeCliente = await sql`
            SELECT id FROM clientes WHERE shopify_id = ${shopifyId}
          `

          if (existeCliente.rows.length > 0) {
            await sql`
              UPDATE clientes SET 
                email = ${cliente.email},
                nombre = ${nombreCompleto},
                telefono = ${cliente.phone || null},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            resultado.actualizados++
          } else {
            await sql`
              INSERT INTO clientes (
                shopify_id, email, nombre, telefono, creado_en, actualizado_en
              ) VALUES (
                ${shopifyId}, ${cliente.email}, ${nombreCompleto},
                ${cliente.phone || null}, NOW(), NOW()
              )
            `
            resultado.insertados++
          }
        } catch (error) {
          console.error(`❌ Error con cliente ${cliente.id}:`, error)
          resultado.errores++
        }
      }
    }

    if (tipo === "colecciones") {
      for (const coleccion of datos) {
        try {
          console.log(`📚 Procesando colección:`, {
            id: coleccion.id,
            title: coleccion.title,
            handle: coleccion.handle,
            image: coleccion.image?.url,
          })

          if (!coleccion.id || !coleccion.title) {
            console.warn(`⚠️ Colección sin ID o título:`, coleccion)
            resultado.errores++
            continue
          }

          // Extraer ID de Shopify correctamente
          let shopifyId = coleccion.id
          if (typeof shopifyId === "string" && shopifyId.includes("gid://shopify/Collection/")) {
            shopifyId = shopifyId.replace("gid://shopify/Collection/", "")
          }

          const imagen = coleccion.image?.url || null
          const handle = coleccion.handle || coleccion.title.toLowerCase().replace(/\s+/g, "-")

          console.log(`📋 Datos de la colección: handle=${handle}, imagen=${imagen}`)

          const existeColeccion = await sql`
            SELECT id FROM colecciones WHERE shopify_id = ${shopifyId}
          `

          if (existeColeccion.rows.length > 0) {
            await sql`
              UPDATE colecciones SET 
                titulo = ${coleccion.title},
                descripcion = ${coleccion.description || ""},
                url_handle = ${handle},
                imagen_url = ${imagen},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            resultado.actualizados++
            console.log(`✅ Colección actualizada: ${coleccion.title}`)
          } else {
            await sql`
              INSERT INTO colecciones (
                shopify_id, titulo, descripcion, url_handle, imagen_url,
                creado_en, actualizado_en
              ) VALUES (
                ${shopifyId}, ${coleccion.title}, ${coleccion.description || ""},
                ${handle}, ${imagen}, NOW(), NOW()
              )
            `
            resultado.insertados++
            console.log(`✅ Colección insertada: ${coleccion.title}`)
          }
        } catch (error) {
          console.error(`❌ Error con colección ${coleccion.id}:`, error)
          resultado.errores++
        }
      }
    }

    console.log(
      `✅ ${tipo} sincronizado: ${resultado.insertados} insertados, ${resultado.actualizados} actualizados, ${resultado.errores} errores`,
    )

    return NextResponse.json({
      success: true,
      mensaje: `${tipo} sincronizado exitosamente`,
      resultado,
    })
  } catch (error) {
    console.error("❌ Error en sincronización:", error)
    return NextResponse.json(
      {
        error: "Error en la sincronización",
        mensaje: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
