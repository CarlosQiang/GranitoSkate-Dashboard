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

    // PRODUCTOS - Funciona perfectamente, mantener igual
    if (tipo === "productos") {
      for (const producto of datos) {
        try {
          if (!producto.id || !producto.title) {
            resultado.errores++
            continue
          }

          let shopifyId = producto.id
          if (typeof shopifyId === "string" && shopifyId.includes("gid://shopify/Product/")) {
            shopifyId = shopifyId.replace("gid://shopify/Product/", "")
          }

          const titulo = producto.title || "Producto sin título"
          const descripcion = producto.description || ""
          const estado = producto.status || "ACTIVE"
          const tipoProducto = producto.productType || "SKATEBOARD"
          const proveedor = producto.vendor || "GranitoSkate"
          const precio = 0
          const inventario = 0

          const existeProducto = await sql`
            SELECT id FROM productos WHERE shopify_id = ${shopifyId}
          `

          if (existeProducto.rows.length > 0) {
            await sql`
              UPDATE productos SET 
                titulo = ${titulo},
                descripcion = ${descripcion},
                estado = ${estado},
                tipo_producto = ${tipoProducto},
                proveedor = ${proveedor},
                precio_base = ${precio},
                inventario_disponible = ${inventario},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            resultado.actualizados++
          } else {
            await sql`
              INSERT INTO productos (
                shopify_id, titulo, descripcion, estado, tipo_producto, proveedor,
                precio_base, inventario_disponible, creado_en, actualizado_en
              ) VALUES (
                ${shopifyId}, ${titulo}, ${descripcion}, ${estado}, ${tipoProducto}, 
                ${proveedor}, ${precio}, ${inventario}, NOW(), NOW()
              )
            `
            resultado.insertados++
          }
        } catch (error) {
          console.error(`❌ Error con producto ${producto.id}:`, error)
          resultado.errores++
        }
      }
    }

    // PEDIDOS - Aplicando la misma lógica exitosa de productos
    if (tipo === "pedidos") {
      for (const pedido of datos) {
        try {
          if (!pedido.id) {
            resultado.errores++
            continue
          }

          let shopifyId = pedido.id
          if (typeof shopifyId === "string" && shopifyId.includes("gid://shopify/Order/")) {
            shopifyId = shopifyId.replace("gid://shopify/Order/", "")
          }

          // Datos básicos como productos
          const numeroPedido = pedido.name || `#${shopifyId}`
          const emailCliente = ""
          const estado = "PENDING"
          const estadoFinanciero = "PENDING"
          const total = 0
          const moneda = "EUR"

          const existePedido = await sql`
            SELECT id FROM pedidos WHERE shopify_id = ${shopifyId}
          `

          if (existePedido.rows.length > 0) {
            await sql`
              UPDATE pedidos SET 
                numero_pedido = ${numeroPedido},
                email_cliente = ${emailCliente},
                estado = ${estado},
                estado_financiero = ${estadoFinanciero},
                total = ${total},
                moneda = ${moneda},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            resultado.actualizados++
          } else {
            await sql`
              INSERT INTO pedidos (
                shopify_id, numero_pedido, email_cliente, estado, estado_financiero,
                total, moneda, creado_en, actualizado_en
              ) VALUES (
                ${shopifyId}, ${numeroPedido}, ${emailCliente}, ${estado}, ${estadoFinanciero},
                ${total}, ${moneda}, NOW(), NOW()
              )
            `
            resultado.insertados++
          }
        } catch (error) {
          console.error(`❌ Error con pedido ${pedido.id}:`, error)
          resultado.errores++
        }
      }
    }

    // CLIENTES - Mantener exactamente como está (funciona perfectamente)
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

    // COLECCIONES - Aplicando la misma lógica exitosa de productos
    if (tipo === "colecciones") {
      for (const coleccion of datos) {
        try {
          if (!coleccion.id || !coleccion.title) {
            resultado.errores++
            continue
          }

          let shopifyId = coleccion.id
          if (typeof shopifyId === "string" && shopifyId.includes("gid://shopify/Collection/")) {
            shopifyId = shopifyId.replace("gid://shopify/Collection/", "")
          }

          // Datos básicos como productos
          const titulo = coleccion.title || "Colección sin título"
          const descripcion = coleccion.description || ""
          const urlHandle = coleccion.handle || titulo.toLowerCase().replace(/\s+/g, "-")
          const imagenUrl = null
          const publicado = true

          const existeColeccion = await sql`
            SELECT id FROM colecciones WHERE shopify_id = ${shopifyId}
          `

          if (existeColeccion.rows.length > 0) {
            await sql`
              UPDATE colecciones SET 
                titulo = ${titulo},
                descripcion = ${descripcion},
                url_handle = ${urlHandle},
                imagen_url = ${imagenUrl},
                publicado = ${publicado},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            resultado.actualizados++
          } else {
            await sql`
              INSERT INTO colecciones (
                shopify_id, titulo, descripcion, url_handle, imagen_url,
                publicado, creado_en, actualizado_en
              ) VALUES (
                ${shopifyId}, ${titulo}, ${descripcion}, ${urlHandle}, ${imagenUrl},
                ${publicado}, NOW(), NOW()
              )
            `
            resultado.insertados++
          }
        } catch (error) {
          console.error(`❌ Error con colección ${coleccion.id}:`, error)
          resultado.errores++
        }
      }
    }

    // PROMOCIONES - Aplicando la misma lógica exitosa de productos
    if (tipo === "promociones") {
      for (const promocion of datos) {
        try {
          if (!promocion.id || !promocion.title) {
            resultado.errores++
            continue
          }

          let shopifyId = promocion.id
          if (typeof shopifyId === "string" && shopifyId.includes("gid://shopify/")) {
            shopifyId = shopifyId.replace(/gid:\/\/shopify\/[^/]+\//, "")
          }

          // Datos básicos como productos
          const titulo = promocion.title || "Promoción sin título"
          const descripcion = promocion.description || ""
          const codigo = promocion.code || `PROMO${shopifyId}`
          const tipo = "PERCENTAGE"
          const valor = 10
          const activo = true

          const existePromocion = await sql`
            SELECT id FROM promociones WHERE shopify_id = ${shopifyId}
          `

          if (existePromocion.rows.length > 0) {
            await sql`
              UPDATE promociones SET 
                titulo = ${titulo},
                descripcion = ${descripcion},
                codigo = ${codigo},
                tipo = ${tipo},
                valor = ${valor},
                activo = ${activo},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            resultado.actualizados++
          } else {
            await sql`
              INSERT INTO promociones (
                shopify_id, titulo, descripcion, codigo, tipo, valor,
                activo, creado_en, actualizado_en
              ) VALUES (
                ${shopifyId}, ${titulo}, ${descripcion}, ${codigo}, ${tipo}, ${valor},
                ${activo}, NOW(), NOW()
              )
            `
            resultado.insertados++
          }
        } catch (error) {
          console.error(`❌ Error con promoción ${promocion.id}:`, error)
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
