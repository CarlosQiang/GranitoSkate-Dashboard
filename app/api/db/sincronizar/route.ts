import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

async function sincronizarProductos(productos: any[]) {
  console.log(`🔄 Sincronizando ${productos.length} productos...`)
  console.log("📋 Estructura del primer producto:", JSON.stringify(productos[0], null, 2))

  const resultados = {
    insertados: 0,
    actualizados: 0,
    errores: 0,
    detalles: [] as any[],
  }

  for (let i = 0; i < productos.length; i++) {
    const producto = productos[i]
    try {
      console.log(`📦 [${i + 1}/${productos.length}] Procesando producto:`, {
        id: producto.id,
        title: producto.title,
        status: producto.status,
      })

      // Verificar si el producto ya existe
      console.log(`🔍 Verificando existencia del producto con ID: ${producto.id}`)
      const existeProducto = await sql`
        SELECT id FROM productos WHERE shopify_id = ${producto.id}
      `
      console.log(`📊 Resultado de verificación: ${existeProducto.rows.length} registros encontrados`)

      const precio = Number.parseFloat(producto.variants?.edges?.[0]?.node?.price || "0")
      const inventario = producto.variants?.edges?.[0]?.node?.inventoryQuantity || 0

      if (existeProducto.rows.length > 0) {
        // Actualizar producto existente
        console.log(`🔄 Actualizando producto existente: ${producto.title}`)

        const updateResult = await sql`
          UPDATE productos SET 
            titulo = ${producto.title},
            descripcion = ${producto.description || ""},
            tipo_producto = ${producto.productType || ""},
            proveedor = ${producto.vendor || ""},
            estado = ${producto.status || "active"},
            publicado = ${producto.status === "active"},
            imagen_destacada_url = ${producto.featuredImage?.url || null},
            precio_base = ${precio},
            inventario_disponible = ${inventario},
            actualizado_en = NOW()
          WHERE shopify_id = ${producto.id}
          RETURNING id
        `

        console.log(`✅ Producto actualizado. Filas afectadas: ${updateResult.rowCount}`)
        resultados.actualizados++
        resultados.detalles.push({
          accion: "actualizado",
          producto: producto.title,
          id: producto.id,
          filasAfectadas: updateResult.rowCount,
        })
      } else {
        // Insertar nuevo producto
        console.log(`➕ Insertando nuevo producto: ${producto.title}`)

        const insertResult = await sql`
          INSERT INTO productos (
            shopify_id, titulo, descripcion, tipo_producto, proveedor, estado,
            publicado, imagen_destacada_url, precio_base, inventario_disponible, 
            creado_en, actualizado_en
          ) VALUES (
            ${producto.id},
            ${producto.title},
            ${producto.description || ""},
            ${producto.productType || ""},
            ${producto.vendor || ""},
            ${producto.status || "active"},
            ${producto.status === "active"},
            ${producto.featuredImage?.url || null},
            ${precio},
            ${inventario},
            NOW(),
            NOW()
          ) RETURNING id
        `

        console.log(`✅ Producto insertado. ID generado: ${insertResult.rows[0]?.id}`)
        resultados.insertados++
        resultados.detalles.push({
          accion: "insertado",
          producto: producto.title,
          id: producto.id,
          idGenerado: insertResult.rows[0]?.id,
        })
      }
    } catch (error) {
      console.error(`❌ Error al sincronizar producto ${producto.id}:`, error)
      resultados.errores++
      resultados.detalles.push({
        accion: "error",
        producto: producto.title || "Desconocido",
        id: producto.id,
        error: error instanceof Error ? error.message : "Error desconocido",
      })
    }
  }

  // Verificar el conteo final
  const conteoFinal = await sql`SELECT COUNT(*) as count FROM productos`
  console.log(`📊 Conteo final de productos en la base de datos: ${conteoFinal.rows[0].count}`)

  console.log(`🎉 Sincronización de productos completada:`, resultados)
  return resultados
}

async function sincronizarPedidos(pedidos: any[]) {
  console.log(`🔄 Sincronizando ${pedidos.length} pedidos...`)
  console.log("📋 Estructura del primer pedido:", JSON.stringify(pedidos[0], null, 2))

  const resultados = {
    insertados: 0,
    actualizados: 0,
    errores: 0,
    detalles: [] as any[],
  }

  for (let i = 0; i < pedidos.length; i++) {
    const pedido = pedidos[i]
    try {
      console.log(`🛒 [${i + 1}/${pedidos.length}] Procesando pedido:`, {
        id: pedido.id,
        name: pedido.name,
        status: pedido.status,
      })

      // Verificar si el pedido ya existe
      const existePedido = await sql`
        SELECT id FROM pedidos WHERE shopify_id = ${pedido.id}
      `

      const total = Number.parseFloat(pedido.totalPrice || "0")

      if (existePedido.rows.length > 0) {
        // Actualizar pedido existente
        const updateResult = await sql`
          UPDATE pedidos SET 
            estado = ${pedido.status || "pending"},
            total = ${total},
            actualizado_en = NOW()
          WHERE shopify_id = ${pedido.id}
          RETURNING id
        `

        console.log(`✅ Pedido actualizado. Filas afectadas: ${updateResult.rowCount}`)
        resultados.actualizados++
      } else {
        // Insertar nuevo pedido
        const insertResult = await sql`
          INSERT INTO pedidos (
            shopify_id, numero_pedido, email_cliente, estado, total, creado_en, actualizado_en
          ) VALUES (
            ${pedido.id},
            ${pedido.name || ""},
            ${pedido.email || ""},
            ${pedido.status || "pending"},
            ${total},
            NOW(),
            NOW()
          ) RETURNING id
        `

        console.log(`✅ Pedido insertado. ID generado: ${insertResult.rows[0]?.id}`)
        resultados.insertados++
      }
    } catch (error) {
      console.error(`❌ Error al sincronizar pedido ${pedido.id}:`, error)
      resultados.errores++
    }
  }

  // Verificar el conteo final
  const conteoFinal = await sql`SELECT COUNT(*) as count FROM pedidos`
  console.log(`📊 Conteo final de pedidos en la base de datos: ${conteoFinal.rows[0].count}`)

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

    // Verificar conexión antes de proceder
    const connectionTest = await sql`SELECT NOW() as current_time`
    console.log("✅ Conexión verificada:", connectionTest.rows[0])

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
