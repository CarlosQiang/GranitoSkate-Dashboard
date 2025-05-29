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

    // PRODUCTOS - Usando la misma lógica que funciona para clientes
    if (tipo === "productos") {
      for (const producto of datos) {
        try {
          if (!producto.id || !producto.title) {
            resultado.errores++
            continue
          }

          // Usar la misma lógica de ID que funciona para clientes
          let shopifyId = producto.id
          if (typeof shopifyId === "string" && shopifyId.includes("gid://shopify/Product/")) {
            shopifyId = shopifyId.replace("gid://shopify/Product/", "")
          }

          // Datos básicos como en clientes
          const titulo = producto.title || "Producto sin título"
          const descripcion = producto.description || ""
          const estado = producto.status || "ACTIVE"
          const tipoProducto = producto.productType || "SKATEBOARD"
          const proveedor = producto.vendor || "GranitoSkate"

          // Precio e inventario básicos
          const precio = 0 // Empezamos con 0 como valor seguro
          const inventario = 0 // Empezamos con 0 como valor seguro

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

    // PEDIDOS - Usando la misma lógica que funciona para clientes
    if (tipo === "pedidos") {
      for (const pedido of datos) {
        try {
          if (!pedido.id) {
            resultado.errores++
            continue
          }

          // Usar la misma lógica de ID que funciona para clientes
          let shopifyId = pedido.id
          if (typeof shopifyId === "string" && shopifyId.includes("gid://shopify/Order/")) {
            shopifyId = shopifyId.replace("gid://shopify/Order/", "")
          }

          // Datos básicos como en clientes
          const numeroPedido = pedido.name || `#${shopifyId}`
          const total = 0 // Empezamos con 0 como valor seguro
          const moneda = "EUR"
          const emailCliente = ""

          const existePedido = await sql`
            SELECT id FROM pedidos WHERE shopify_id = ${shopifyId}
          `

          if (existePedido.rows.length > 0) {
            await sql`
              UPDATE pedidos SET 
                numero_pedido = ${numeroPedido},
                total = ${total},
                moneda = ${moneda},
                email_cliente = ${emailCliente},
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
                ${shopifyId}, ${numeroPedido}, ${total}, ${moneda}, 
                ${emailCliente}, NOW(), NOW()
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

    // COLECCIONES - Usando la misma lógica que funciona para clientes
    if (tipo === "colecciones") {
      for (const coleccion of datos) {
        try {
          if (!coleccion.id || !coleccion.title) {
            resultado.errores++
            continue
          }

          // Usar la misma lógica de ID que funciona para clientes
          let shopifyId = coleccion.id
          if (typeof shopifyId === "string" && shopifyId.includes("gid://shopify/Collection/")) {
            shopifyId = shopifyId.replace("gid://shopify/Collection/", "")
          }

          // Datos básicos como en clientes
          const titulo = coleccion.title || "Colección sin título"
          const descripcion = coleccion.description || ""
          const urlHandle = coleccion.handle || titulo.toLowerCase().replace(/\s+/g, "-")

          const existeColeccion = await sql`
            SELECT id FROM colecciones WHERE shopify_id = ${shopifyId}
          `

          if (existeColeccion.rows.length > 0) {
            await sql`
              UPDATE colecciones SET 
                titulo = ${titulo},
                descripcion = ${descripcion},
                url_handle = ${urlHandle},
                actualizado_en = NOW()
              WHERE shopify_id = ${shopifyId}
            `
            resultado.actualizados++
          } else {
            await sql`
              INSERT INTO colecciones (
                shopify_id, titulo, descripcion, url_handle,
                creado_en, actualizado_en
              ) VALUES (
                ${shopifyId}, ${titulo}, ${descripcion}, ${urlHandle}, NOW(), NOW()
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
