import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

async function sincronizarProductos(productos: any[]) {
  console.log(`🔄 Sincronizando ${productos.length} productos...`)

  const resultados = {
    insertados: 0,
    actualizados: 0,
    errores: 0,
  }

  for (const producto of productos) {
    try {
      console.log(`📦 Procesando producto: ${producto.title} (ID: ${producto.id})`)

      // Verificar si el producto ya existe
      const existeProducto = await sql`
        SELECT id FROM productos WHERE shopify_id = ${producto.id}
      `

      if (existeProducto.rows.length > 0) {
        // Actualizar producto existente
        await sql`
          UPDATE productos SET 
            titulo = ${producto.title},
            descripcion = ${producto.description || ""},
            tipo_producto = ${producto.productType || ""},
            proveedor = ${producto.vendor || ""},
            estado = ${producto.status || "active"},
            publicado = ${producto.status === "active"},
            imagen_destacada_url = ${producto.featuredImage?.url || null},
            precio_base = ${Number.parseFloat(producto.variants?.edges[0]?.node?.price || "0")},
            precio_comparacion = ${producto.variants?.edges[0]?.node?.compareAtPrice ? Number.parseFloat(producto.variants.edges[0].node.compareAtPrice) : null},
            inventario_disponible = ${producto.variants?.edges[0]?.node?.inventoryQuantity || 0},
            actualizado_en = NOW()
          WHERE shopify_id = ${producto.id}
        `
        resultados.actualizados++
        console.log(`✅ Producto actualizado: ${producto.title}`)
      } else {
        // Insertar nuevo producto
        await sql`
          INSERT INTO productos (
            shopify_id, titulo, descripcion, tipo_producto, proveedor, estado,
            publicado, imagen_destacada_url, precio_base, precio_comparacion,
            inventario_disponible, creado_en, actualizado_en
          ) VALUES (
            ${producto.id},
            ${producto.title},
            ${producto.description || ""},
            ${producto.productType || ""},
            ${producto.vendor || ""},
            ${producto.status || "active"},
            ${producto.status === "active"},
            ${producto.featuredImage?.url || null},
            ${Number.parseFloat(producto.variants?.edges[0]?.node?.price || "0")},
            ${producto.variants?.edges[0]?.node?.compareAtPrice ? Number.parseFloat(producto.variants.edges[0].node.compareAtPrice) : null},
            ${producto.variants?.edges[0]?.node?.inventoryQuantity || 0},
            NOW(),
            NOW()
          )
        `
        resultados.insertados++
        console.log(`✅ Producto insertado: ${producto.title}`)
      }
    } catch (error) {
      console.error(`❌ Error al sincronizar producto ${producto.id}:`, error)
      resultados.errores++
    }
  }

  console.log(`🎉 Sincronización de productos completada:`, resultados)
  return resultados
}

async function sincronizarPedidos(pedidos: any[]) {
  console.log(`🔄 Sincronizando ${pedidos.length} pedidos...`)

  const resultados = {
    insertados: 0,
    actualizados: 0,
    errores: 0,
  }

  for (const pedido of pedidos) {
    try {
      console.log(`🛒 Procesando pedido: ${pedido.name} (ID: ${pedido.id})`)

      // Verificar si el pedido ya existe
      const existePedido = await sql`
        SELECT id FROM pedidos WHERE shopify_id = ${pedido.id}
      `

      if (existePedido.rows.length > 0) {
        // Actualizar pedido existente
        await sql`
          UPDATE pedidos SET 
            estado = ${pedido.status || "pending"},
            total = ${Number.parseFloat(pedido.totalPrice || "0")},
            actualizado_en = NOW()
          WHERE shopify_id = ${pedido.id}
        `
        resultados.actualizados++
        console.log(`✅ Pedido actualizado: ${pedido.name}`)
      } else {
        // Insertar nuevo pedido
        await sql`
          INSERT INTO pedidos (
            shopify_id, numero_pedido, email_cliente, estado, total, creado_en, actualizado_en
          ) VALUES (
            ${pedido.id},
            ${pedido.name || ""},
            ${pedido.email || ""},
            ${pedido.status || "pending"},
            ${Number.parseFloat(pedido.totalPrice || "0")},
            NOW(),
            NOW()
          )
        `
        resultados.insertados++
        console.log(`✅ Pedido insertado: ${pedido.name}`)
      }
    } catch (error) {
      console.error(`❌ Error al sincronizar pedido ${pedido.id}:`, error)
      resultados.errores++
    }
  }

  console.log(`🎉 Sincronización de pedidos completada:`, resultados)
  return resultados
}

async function sincronizarColecciones(colecciones: any[]) {
  console.log(`🔄 Sincronizando ${colecciones.length} colecciones...`)

  const resultados = {
    insertados: 0,
    actualizados: 0,
    errores: 0,
  }

  for (const coleccion of colecciones) {
    try {
      console.log(`📚 Procesando colección: ${coleccion.title} (ID: ${coleccion.id})`)

      // Verificar si la colección ya existe
      const existeColeccion = await sql`
        SELECT id FROM colecciones WHERE shopify_id = ${coleccion.id}
      `

      if (existeColeccion.rows.length > 0) {
        // Actualizar colección existente
        await sql`
          UPDATE colecciones SET 
            titulo = ${coleccion.title},
            descripcion = ${coleccion.description || ""},
            imagen_url = ${coleccion.image?.url || null},
            actualizado_en = NOW()
          WHERE shopify_id = ${coleccion.id}
        `
        resultados.actualizados++
        console.log(`✅ Colección actualizada: ${coleccion.title}`)
      } else {
        // Insertar nueva colección
        await sql`
          INSERT INTO colecciones (
            shopify_id, titulo, descripcion, imagen_url, creado_en, actualizado_en
          ) VALUES (
            ${coleccion.id},
            ${coleccion.title},
            ${coleccion.description || ""},
            ${coleccion.image?.url || null},
            NOW(),
            NOW()
          )
        `
        resultados.insertados++
        console.log(`✅ Colección insertada: ${coleccion.title}`)
      }
    } catch (error) {
      console.error(`❌ Error al sincronizar colección ${coleccion.id}:`, error)
      resultados.errores++
    }
  }

  console.log(`🎉 Sincronización de colecciones completada:`, resultados)
  return resultados
}

async function registrarActividad(accion: string, tipo_entidad: string, resultado: string, descripcion: string) {
  try {
    await sql`
      INSERT INTO registros_actividad (
        accion, tipo_entidad, resultado, descripcion, creado_en
      ) VALUES (
        ${accion},
        ${tipo_entidad},
        ${resultado},
        ${descripcion},
        NOW()
      )
    `
    console.log(`📝 Actividad registrada: ${accion} - ${tipo_entidad}`)
  } catch (error) {
    console.error("❌ Error al registrar actividad:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tipo, datos } = await request.json()

    if (!tipo || !datos) {
      return NextResponse.json({ error: "Parámetros requeridos: tipo, datos" }, { status: 400 })
    }

    console.log(`📥 Recibida solicitud de sincronización para ${tipo}`)
    console.log(`📊 Cantidad de elementos a sincronizar: ${datos.length}`)

    let resultado
    switch (tipo) {
      case "productos":
        resultado = await sincronizarProductos(datos)
        break
      case "pedidos":
        resultado = await sincronizarPedidos(datos)
        break
      case "colecciones":
        resultado = await sincronizarColecciones(datos)
        break
      default:
        return NextResponse.json({ error: `Tipo no válido: ${tipo}` }, { status: 400 })
    }

    // Registrar la actividad
    await registrarActividad(
      "sincronizar",
      tipo,
      "completado",
      `Sincronización de ${tipo} completada: ${resultado.insertados} insertados, ${resultado.actualizados} actualizados, ${resultado.errores} errores`,
    )

    return NextResponse.json({
      success: true,
      mensaje: `Sincronización de ${tipo} completada con éxito`,
      resultado,
    })
  } catch (error) {
    console.error("❌ Error en POST /api/db/sincronizar:", error)

    // Registrar el error
    await registrarActividad(
      "sincronizar",
      "error",
      "error",
      `Error en sincronización: ${error instanceof Error ? error.message : "Error desconocido"}`,
    )

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        mensaje: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
