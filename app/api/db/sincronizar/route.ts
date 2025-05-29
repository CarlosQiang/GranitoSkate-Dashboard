import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

async function sincronizarProductos(productos: any[]) {
  console.log(`🔄 Sincronizando ${productos.length} productos...`)

  const resultados = {
    insertados: 0,
    actualizados: 0,
    errores: 0,
  }

  for (const producto of productos) {
    try {
      // Verificar si el producto ya existe
      const existeProducto = await query("SELECT id FROM productos WHERE shopify_id = $1", [producto.id])

      if (existeProducto.rows.length > 0) {
        // Actualizar producto existente
        await query(
          `UPDATE productos SET 
            titulo = $1,
            descripcion = $2,
            tipo_producto = $3,
            proveedor = $4,
            estado = $5,
            publicado = $6,
            imagen_destacada_url = $7,
            precio_base = $8,
            precio_comparacion = $9,
            inventario_disponible = $10,
            actualizado_en = NOW()
          WHERE shopify_id = $11`,
          [
            producto.title,
            producto.description || "",
            producto.productType || "",
            producto.vendor || "",
            producto.status || "active",
            producto.status === "active",
            producto.featuredImage?.url || null,
            Number.parseFloat(producto.variants?.edges[0]?.node?.price || "0"),
            producto.variants?.edges[0]?.node?.compareAtPrice
              ? Number.parseFloat(producto.variants.edges[0].node.compareAtPrice)
              : null,
            producto.variants?.edges[0]?.node?.inventoryQuantity || 0,
            producto.id,
          ],
        )
        resultados.actualizados++
      } else {
        // Insertar nuevo producto
        await query(
          `INSERT INTO productos (
            shopify_id, titulo, descripcion, tipo_producto, proveedor, estado,
            publicado, imagen_destacada_url, precio_base, precio_comparacion,
            inventario_disponible, creado_en, actualizado_en
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
          [
            producto.id,
            producto.title,
            producto.description || "",
            producto.productType || "",
            producto.vendor || "",
            producto.status || "active",
            producto.status === "active",
            producto.featuredImage?.url || null,
            Number.parseFloat(producto.variants?.edges[0]?.node?.price || "0"),
            producto.variants?.edges[0]?.node?.compareAtPrice
              ? Number.parseFloat(producto.variants.edges[0].node.compareAtPrice)
              : null,
            producto.variants?.edges[0]?.node?.inventoryQuantity || 0,
          ],
        )
        resultados.insertados++
      }
    } catch (error) {
      console.error(`Error al sincronizar producto ${producto.id}:`, error)
      resultados.errores++
    }
  }

  console.log(`✅ Sincronización de productos completada:`, resultados)
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
      // Verificar si el pedido ya existe
      const existePedido = await query("SELECT id FROM pedidos WHERE shopify_id = $1", [pedido.id])

      if (existePedido.rows.length > 0) {
        // Actualizar pedido existente
        await query(
          `UPDATE pedidos SET 
            estado = $1,
            total = $2,
            actualizado_en = NOW()
          WHERE shopify_id = $3`,
          [pedido.status || "pending", Number.parseFloat(pedido.totalPrice || "0"), pedido.id],
        )
        resultados.actualizados++
      } else {
        // Insertar nuevo pedido
        await query(
          `INSERT INTO pedidos (
            shopify_id, numero_pedido, email_cliente, estado, total, creado_en, actualizado_en
          ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
          [
            pedido.id,
            pedido.name || "",
            pedido.email || "",
            pedido.status || "pending",
            Number.parseFloat(pedido.totalPrice || "0"),
          ],
        )
        resultados.insertados++
      }
    } catch (error) {
      console.error(`Error al sincronizar pedido ${pedido.id}:`, error)
      resultados.errores++
    }
  }

  console.log(`✅ Sincronización de pedidos completada:`, resultados)
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
      // Verificar si la colección ya existe
      const existeColeccion = await query("SELECT id FROM colecciones WHERE shopify_id = $1", [coleccion.id])

      if (existeColeccion.rows.length > 0) {
        // Actualizar colección existente
        await query(
          `UPDATE colecciones SET 
            titulo = $1,
            descripcion = $2,
            imagen_url = $3,
            actualizado_en = NOW()
          WHERE shopify_id = $4`,
          [coleccion.title, coleccion.description || "", coleccion.image?.url || null, coleccion.id],
        )
        resultados.actualizados++
      } else {
        // Insertar nueva colección
        await query(
          `INSERT INTO colecciones (
            shopify_id, titulo, descripcion, imagen_url, creado_en, actualizado_en
          ) VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [coleccion.id, coleccion.title, coleccion.description || "", coleccion.image?.url || null],
        )
        resultados.insertados++
      }
    } catch (error) {
      console.error(`Error al sincronizar colección ${coleccion.id}:`, error)
      resultados.errores++
    }
  }

  console.log(`✅ Sincronización de colecciones completada:`, resultados)
  return resultados
}

async function registrarActividad(accion: string, tipo_entidad: string, resultado: string, descripcion: string) {
  try {
    await query(
      `INSERT INTO registros_actividad (
        accion, tipo_entidad, resultado, descripcion, creado_en
      ) VALUES ($1, $2, $3, $4, NOW())`,
      [accion, tipo_entidad, resultado, descripcion],
    )
    console.log(`✅ Actividad registrada: ${accion} - ${tipo_entidad}`)
  } catch (error) {
    console.error("Error al registrar actividad:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tipo, datos } = await request.json()

    if (!tipo || !datos) {
      return NextResponse.json({ error: "Parámetros requeridos: tipo, datos" }, { status: 400 })
    }

    console.log(`📥 Recibida solicitud de sincronización para ${tipo}:`, datos)

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
    await registrarActividad("sincronizar", tipo, "completado", `Sincronización de ${tipo} completada`)

    return NextResponse.json({
      success: true,
      mensaje: `Sincronización de ${tipo} completada con éxito`,
      resultado,
    })
  } catch (error) {
    console.error("Error en POST /api/db/sincronizar:", error)

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
