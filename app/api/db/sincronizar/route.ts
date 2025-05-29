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
      console.log(
        `📦 Procesando producto: ${producto.title || producto.node?.title} (ID: ${producto.id || producto.node?.id})`,
      )

      // Normalizar datos del producto
      const productoData = {
        id: producto.id || producto.node?.id,
        title: producto.title || producto.node?.title || "",
        description: producto.description || producto.node?.description || "",
        productType: producto.productType || producto.node?.productType || "",
        vendor: producto.vendor || producto.node?.vendor || "",
        status: producto.status || producto.node?.status || "active",
        featuredImageUrl: producto.featuredImage?.url || producto.node?.featuredImage?.url || null,
        price: producto.variants?.edges?.[0]?.node?.price || producto.node?.variants?.edges?.[0]?.node?.price || "0",
        compareAtPrice:
          producto.variants?.edges?.[0]?.node?.compareAtPrice ||
          producto.node?.variants?.edges?.[0]?.node?.compareAtPrice ||
          null,
        inventoryQuantity:
          producto.variants?.edges?.[0]?.node?.inventoryQuantity ||
          producto.node?.variants?.edges?.[0]?.node?.inventoryQuantity ||
          0,
      }

      // Verificar si el producto ya existe
      const existeProducto = await sql`
        SELECT id FROM productos WHERE shopify_id = ${productoData.id}
      `

      console.log(
        `🔍 Verificando si existe producto con ID ${productoData.id}: ${existeProducto.rows.length > 0 ? "Sí" : "No"}`,
      )

      if (existeProducto.rows.length > 0) {
        // Actualizar producto existente
        console.log(`🔄 Actualizando producto existente: ${productoData.title}`)

        await sql`
          UPDATE productos SET 
            titulo = ${productoData.title},
            descripcion = ${productoData.description},
            tipo_producto = ${productoData.productType},
            proveedor = ${productoData.vendor},
            estado = ${productoData.status},
            publicado = ${productoData.status === "active"},
            imagen_destacada_url = ${productoData.featuredImageUrl},
            precio_base = ${Number.parseFloat(productoData.price)},
            precio_comparacion = ${productoData.compareAtPrice ? Number.parseFloat(productoData.compareAtPrice) : null},
            inventario_disponible = ${productoData.inventoryQuantity},
            actualizado_en = NOW()
          WHERE shopify_id = ${productoData.id}
        `
        resultados.actualizados++
        console.log(`✅ Producto actualizado: ${productoData.title}`)
      } else {
        // Insertar nuevo producto
        console.log(`➕ Insertando nuevo producto: ${productoData.title}`)

        await sql`
          INSERT INTO productos (
            shopify_id, titulo, descripcion, tipo_producto, proveedor, estado,
            publicado, imagen_destacada_url, precio_base, precio_comparacion,
            inventario_disponible, creado_en, actualizado_en
          ) VALUES (
            ${productoData.id},
            ${productoData.title},
            ${productoData.description},
            ${productoData.productType},
            ${productoData.vendor},
            ${productoData.status},
            ${productoData.status === "active"},
            ${productoData.featuredImageUrl},
            ${Number.parseFloat(productoData.price)},
            ${productoData.compareAtPrice ? Number.parseFloat(productoData.compareAtPrice) : null},
            ${productoData.inventoryQuantity},
            NOW(),
            NOW()
          )
        `
        resultados.insertados++
        console.log(`✅ Producto insertado: ${productoData.title}`)
      }
    } catch (error) {
      console.error(`❌ Error al sincronizar producto:`, error)
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
      console.log(`🛒 Procesando pedido: ${pedido.name || pedido.node?.name} (ID: ${pedido.id || pedido.node?.id})`)

      // Normalizar datos del pedido
      const pedidoData = {
        id: pedido.id || pedido.node?.id,
        name: pedido.name || pedido.node?.name || "",
        email: pedido.email || pedido.node?.email || "",
        status: pedido.status || pedido.node?.status || "pending",
        totalPrice: pedido.totalPrice || pedido.node?.totalPrice || "0",
      }

      // Verificar si el pedido ya existe
      const existePedido = await sql`
        SELECT id FROM pedidos WHERE shopify_id = ${pedidoData.id}
      `

      console.log(
        `🔍 Verificando si existe pedido con ID ${pedidoData.id}: ${existePedido.rows.length > 0 ? "Sí" : "No"}`,
      )

      if (existePedido.rows.length > 0) {
        // Actualizar pedido existente
        console.log(`🔄 Actualizando pedido existente: ${pedidoData.name}`)

        await sql`
          UPDATE pedidos SET 
            estado = ${pedidoData.status},
            total = ${Number.parseFloat(pedidoData.totalPrice)},
            actualizado_en = NOW()
          WHERE shopify_id = ${pedidoData.id}
        `
        resultados.actualizados++
        console.log(`✅ Pedido actualizado: ${pedidoData.name}`)
      } else {
        // Insertar nuevo pedido
        console.log(`➕ Insertando nuevo pedido: ${pedidoData.name}`)

        await sql`
          INSERT INTO pedidos (
            shopify_id, numero_pedido, email_cliente, estado, total, creado_en, actualizado_en
          ) VALUES (
            ${pedidoData.id},
            ${pedidoData.name},
            ${pedidoData.email},
            ${pedidoData.status},
            ${Number.parseFloat(pedidoData.totalPrice)},
            NOW(),
            NOW()
          )
        `
        resultados.insertados++
        console.log(`✅ Pedido insertado: ${pedidoData.name}`)
      }
    } catch (error) {
      console.error(`❌ Error al sincronizar pedido:`, error)
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
