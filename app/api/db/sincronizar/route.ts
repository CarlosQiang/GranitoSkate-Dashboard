import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    const { tipo, datos } = await request.json()

    if (!tipo || !datos || !Array.isArray(datos)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    console.log(`🔄 Sincronizando ${tipo}: ${datos.length} elementos`)

    const resultado = {
      insertados: 0,
      actualizados: 0,
      errores: 0,
    }

    if (tipo === "productos") {
      for (const producto of datos) {
        try {
          if (!producto.id || !producto.title) {
            resultado.errores++
            continue
          }

          const shopifyId = producto.id.replace("gid://shopify/Product/", "")

          // Verificar si existe
          const existeProducto = await sql`
            SELECT id FROM productos WHERE shopify_id = ${shopifyId}
          `

          if (existeProducto.rows.length > 0) {
            // Actualizar
            await sql`
              UPDATE productos SET 
                titulo = ${producto.title},
                estado = ${producto.status || "ACTIVE"},
                precio_base = ${Number.parseFloat(producto.price || "0")},
                inventario_disponible = ${Number.parseInt(producto.inventory || "0")},
                tipo_producto = ${producto.productType || "SKATEBOARD"},
                proveedor = ${producto.vendor || "GranitoSkate"},
                imagen_destacada_url = ${producto.image || null},
                url_handle = ${producto.handle || producto.title.toLowerCase().replace(/\s+/g, "-")},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            resultado.actualizados++
          } else {
            // Insertar
            await sql`
              INSERT INTO productos (
                shopify_id, titulo, estado, precio_base, inventario_disponible,
                tipo_producto, proveedor, imagen_destacada_url, url_handle,
                creado_en, actualizado_en
              ) VALUES (
                ${shopifyId}, ${producto.title}, ${producto.status || "ACTIVE"},
                ${Number.parseFloat(producto.price || "0")}, ${Number.parseInt(producto.inventory || "0")},
                ${producto.productType || "SKATEBOARD"}, ${producto.vendor || "GranitoSkate"},
                ${producto.image || null}, ${producto.handle || producto.title.toLowerCase().replace(/\s+/g, "-")},
                NOW(), NOW()
              )
            `
            resultado.insertados++
          }
        } catch (error) {
          console.error(`Error con producto ${producto.id}:`, error)
          resultado.errores++
        }
      }
    }

    if (tipo === "pedidos") {
      for (const pedido of datos) {
        try {
          if (!pedido.id) {
            resultado.errores++
            continue
          }

          const shopifyId = pedido.id.replace("gid://shopify/Order/", "")

          const existePedido = await sql`
            SELECT id FROM pedidos WHERE shopify_id = ${shopifyId}
          `

          if (existePedido.rows.length > 0) {
            await sql`
              UPDATE pedidos SET 
                numero_pedido = ${pedido.name || `#${shopifyId}`},
                total = ${Number.parseFloat(pedido.total || "0")},
                moneda = ${pedido.currency || "EUR"},
                email_cliente = ${pedido.customer?.email || ""},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            resultado.actualizados++
          } else {
            await sql`
              INSERT INTO pedidos (
                shopify_id, numero_pedido, total, moneda, email_cliente,
                creado_en, actualizado_en
              ) VALUES (
                ${shopifyId}, ${pedido.name || `#${shopifyId}`}, ${Number.parseFloat(pedido.total || "0")},
                ${pedido.currency || "EUR"}, ${pedido.customer?.email || ""},
                NOW(), NOW()
              )
            `
            resultado.insertados++
          }
        } catch (error) {
          console.error(`Error con pedido ${pedido.id}:`, error)
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

          const shopifyId = cliente.id.replace("gid://shopify/Customer/", "")
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
          console.error(`Error con cliente ${cliente.id}:`, error)
          resultado.errores++
        }
      }
    }

    if (tipo === "colecciones") {
      for (const coleccion of datos) {
        try {
          if (!coleccion.id || !coleccion.title) {
            resultado.errores++
            continue
          }

          const shopifyId = coleccion.id.replace("gid://shopify/Collection/", "")

          const existeColeccion = await sql`
            SELECT id FROM colecciones WHERE shopify_id = ${shopifyId}
          `

          if (existeColeccion.rows.length > 0) {
            await sql`
              UPDATE colecciones SET 
                titulo = ${coleccion.title},
                descripcion = ${coleccion.description || ""},
                url_handle = ${coleccion.handle || coleccion.title.toLowerCase().replace(/\s+/g, "-")},
                imagen_url = ${coleccion.image || null},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            resultado.actualizados++
          } else {
            await sql`
              INSERT INTO colecciones (
                shopify_id, titulo, descripcion, url_handle, imagen_url,
                creado_en, actualizado_en
              ) VALUES (
                ${shopifyId}, ${coleccion.title}, ${coleccion.description || ""},
                ${coleccion.handle || coleccion.title.toLowerCase().replace(/\s+/g, "-")},
                ${coleccion.image || null}, NOW(), NOW()
              )
            `
            resultado.insertados++
          }
        } catch (error) {
          console.error(`Error con colección ${coleccion.id}:`, error)
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
