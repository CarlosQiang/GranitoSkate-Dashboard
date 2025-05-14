import { db } from "../db/neon"
import { productos, colecciones, promociones, clientes, pedidos, registro_sincronizacion } from "../db/schema"
import { getProducts, getCollections, getPromotions, getCustomers, getOrders } from "../api/utils"
import { eq } from "drizzle-orm"

export type SyncResult = {
  success: boolean
  message: string
  details?: {
    productos?: number
    colecciones?: number
    promociones?: number
    clientes?: number
    pedidos?: number
  }
  error?: string
}

export async function sincronizarTodo(): Promise<SyncResult> {
  try {
    console.log("Iniciando sincronización completa...")

    // Registrar inicio de sincronización
    const inicioSync = new Date()
    const registroId = await registrarSincronizacion("inicio", "Iniciando sincronización completa")

    // Sincronizar datos
    const productosCount = await sincronizarProductos()
    const coleccionesCount = await sincronizarColecciones()
    const promocionesCount = await sincronizarPromociones()
    const clientesCount = await sincronizarClientes()
    const pedidosCount = await sincronizarPedidos()

    // Actualizar registro de sincronización
    const finSync = new Date()
    const duracionMs = finSync.getTime() - inicioSync.getTime()
    await actualizarRegistroSincronizacion(
      registroId,
      "completado",
      `Sincronización completada. Productos: ${productosCount}, Colecciones: ${coleccionesCount}, Promociones: ${promocionesCount}, Clientes: ${clientesCount}, Pedidos: ${pedidosCount}`,
      duracionMs,
    )

    return {
      success: true,
      message: "Sincronización completada con éxito",
      details: {
        productos: productosCount,
        colecciones: coleccionesCount,
        promociones: promocionesCount,
        clientes: clientesCount,
        pedidos: pedidosCount,
      },
    }
  } catch (error) {
    console.error("Error en sincronización completa:", error)

    // Registrar error
    await registrarSincronizacion(
      "error",
      `Error en sincronización: ${error instanceof Error ? error.message : String(error)}`,
    )

    return {
      success: false,
      message: "Error en la sincronización",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function sincronizarProductos(): Promise<number> {
  try {
    console.log("Sincronizando productos...")
    const productosShopify = await getProducts()

    if (!productosShopify || !Array.isArray(productosShopify)) {
      throw new Error("No se pudieron obtener productos de Shopify")
    }

    let count = 0

    for (const producto of productosShopify) {
      // Verificar si el producto ya existe
      const productoExistente = await db
        .select()
        .from(productos)
        .where(eq(productos.shopify_id, String(producto.id)))
        .limit(1)

      const productoData = {
        nombre: producto.title,
        descripcion: producto.body_html || "",
        precio: Number.parseFloat(producto.variants[0]?.price || "0"),
        shopify_id: String(producto.id),
        sku: producto.variants[0]?.sku || "",
        inventario: producto.variants[0]?.inventory_quantity || 0,
        imagen_url: producto.image?.src || "",
        activo: producto.status === "active",
        meta_titulo: producto.metafields?.find((m: any) => m.key === "title")?.value || producto.title,
        meta_descripcion: producto.metafields?.find((m: any) => m.key === "description")?.value || "",
        meta_keywords: producto.metafields?.find((m: any) => m.key === "keywords")?.value || "",
        ultima_actualizacion: new Date(),
      }

      if (productoExistente.length > 0) {
        // Actualizar producto existente
        await db
          .update(productos)
          .set(productoData)
          .where(eq(productos.shopify_id, String(producto.id)))
      } else {
        // Insertar nuevo producto
        await db.insert(productos).values({
          ...productoData,
          fecha_creacion: new Date(),
        })
        count++
      }
    }

    console.log(`Sincronización de productos completada. ${count} nuevos productos insertados.`)
    return count
  } catch (error) {
    console.error("Error sincronizando productos:", error)
    await registrarSincronizacion(
      "error",
      `Error sincronizando productos: ${error instanceof Error ? error.message : String(error)}`,
    )
    throw error
  }
}

async function sincronizarColecciones(): Promise<number> {
  try {
    console.log("Sincronizando colecciones...")
    const coleccionesShopify = await getCollections()

    if (!coleccionesShopify || !Array.isArray(coleccionesShopify)) {
      throw new Error("No se pudieron obtener colecciones de Shopify")
    }

    let count = 0

    for (const coleccion of coleccionesShopify) {
      // Verificar si la colección ya existe
      const coleccionExistente = await db
        .select()
        .from(colecciones)
        .where(eq(colecciones.shopify_id, String(coleccion.id)))
        .limit(1)

      const coleccionData = {
        nombre: coleccion.title,
        descripcion: coleccion.body_html || "",
        shopify_id: String(coleccion.id),
        imagen_url: coleccion.image?.src || "",
        activo: true,
        meta_titulo: coleccion.metafields?.find((m: any) => m.key === "title")?.value || coleccion.title,
        meta_descripcion: coleccion.metafields?.find((m: any) => m.key === "description")?.value || "",
        meta_keywords: coleccion.metafields?.find((m: any) => m.key === "keywords")?.value || "",
        ultima_actualizacion: new Date(),
      }

      if (coleccionExistente.length > 0) {
        // Actualizar colección existente
        await db
          .update(colecciones)
          .set(coleccionData)
          .where(eq(colecciones.shopify_id, String(coleccion.id)))
      } else {
        // Insertar nueva colección
        await db.insert(colecciones).values({
          ...coleccionData,
          fecha_creacion: new Date(),
        })
        count++
      }
    }

    console.log(`Sincronización de colecciones completada. ${count} nuevas colecciones insertadas.`)
    return count
  } catch (error) {
    console.error("Error sincronizando colecciones:", error)
    await registrarSincronizacion(
      "error",
      `Error sincronizando colecciones: ${error instanceof Error ? error.message : String(error)}`,
    )
    throw error
  }
}

async function sincronizarPromociones(): Promise<number> {
  try {
    console.log("Sincronizando promociones...")
    const promocionesShopify = await getPromotions()

    if (!promocionesShopify || !Array.isArray(promocionesShopify)) {
      throw new Error("No se pudieron obtener promociones de Shopify")
    }

    let count = 0

    for (const promocion of promocionesShopify) {
      // Verificar si la promoción ya existe
      const promocionExistente = await db
        .select()
        .from(promociones)
        .where(eq(promociones.shopify_id, String(promocion.id)))
        .limit(1)

      const promocionData = {
        nombre: promocion.title || promocion.code,
        codigo: promocion.code,
        tipo: promocion.value_type || "percentage",
        valor: Number.parseFloat(promocion.value || "0"),
        shopify_id: String(promocion.id),
        fecha_inicio: promocion.starts_at ? new Date(promocion.starts_at) : new Date(),
        fecha_fin: promocion.ends_at ? new Date(promocion.ends_at) : null,
        activo: promocion.status === "active" || promocion.status === "enabled",
        ultima_actualizacion: new Date(),
      }

      if (promocionExistente.length > 0) {
        // Actualizar promoción existente
        await db
          .update(promociones)
          .set(promocionData)
          .where(eq(promociones.shopify_id, String(promocion.id)))
      } else {
        // Insertar nueva promoción
        await db.insert(promociones).values({
          ...promocionData,
          fecha_creacion: new Date(),
        })
        count++
      }
    }

    console.log(`Sincronización de promociones completada. ${count} nuevas promociones insertadas.`)
    return count
  } catch (error) {
    console.error("Error sincronizando promociones:", error)
    await registrarSincronizacion(
      "error",
      `Error sincronizando promociones: ${error instanceof Error ? error.message : String(error)}`,
    )
    throw error
  }
}

async function sincronizarClientes(): Promise<number> {
  try {
    console.log("Sincronizando clientes...")
    const clientesShopify = await getCustomers()

    if (!clientesShopify || !Array.isArray(clientesShopify)) {
      throw new Error("No se pudieron obtener clientes de Shopify")
    }

    let count = 0

    for (const cliente of clientesShopify) {
      // Verificar si el cliente ya existe
      const clienteExistente = await db
        .select()
        .from(clientes)
        .where(eq(clientes.shopify_id, String(cliente.id)))
        .limit(1)

      const clienteData = {
        nombre: cliente.first_name || "",
        apellido: cliente.last_name || "",
        email: cliente.email || "",
        telefono: cliente.phone || "",
        shopify_id: String(cliente.id),
        direccion: cliente.default_address?.address1 || "",
        ciudad: cliente.default_address?.city || "",
        pais: cliente.default_address?.country || "",
        codigo_postal: cliente.default_address?.zip || "",
        activo: cliente.state !== "disabled",
        ultima_actualizacion: new Date(),
      }

      if (clienteExistente.length > 0) {
        // Actualizar cliente existente
        await db
          .update(clientes)
          .set(clienteData)
          .where(eq(clientes.shopify_id, String(cliente.id)))
      } else {
        // Insertar nuevo cliente
        await db.insert(clientes).values({
          ...clienteData,
          fecha_creacion: new Date(),
        })
        count++
      }
    }

    console.log(`Sincronización de clientes completada. ${count} nuevos clientes insertados.`)
    return count
  } catch (error) {
    console.error("Error sincronizando clientes:", error)
    await registrarSincronizacion(
      "error",
      `Error sincronizando clientes: ${error instanceof Error ? error.message : String(error)}`,
    )
    throw error
  }
}

async function sincronizarPedidos(): Promise<number> {
  try {
    console.log("Sincronizando pedidos...")
    const pedidosShopify = await getOrders()

    if (!pedidosShopify || !Array.isArray(pedidosShopify)) {
      throw new Error("No se pudieron obtener pedidos de Shopify")
    }

    let count = 0

    for (const pedido of pedidosShopify) {
      // Verificar si el pedido ya existe
      const pedidoExistente = await db
        .select()
        .from(pedidos)
        .where(eq(pedidos.shopify_id, String(pedido.id)))
        .limit(1)

      const pedidoData = {
        numero: pedido.order_number?.toString() || "",
        shopify_id: String(pedido.id),
        cliente_id: pedido.customer?.id ? String(pedido.customer.id) : null,
        total: Number.parseFloat(pedido.total_price || "0"),
        subtotal: Number.parseFloat(pedido.subtotal_price || "0"),
        impuestos: Number.parseFloat(pedido.total_tax || "0"),
        estado: pedido.financial_status || "pending",
        fecha_pedido: pedido.created_at ? new Date(pedido.created_at) : new Date(),
        ultima_actualizacion: new Date(),
      }

      if (pedidoExistente.length > 0) {
        // Actualizar pedido existente
        await db
          .update(pedidos)
          .set(pedidoData)
          .where(eq(pedidos.shopify_id, String(pedido.id)))
      } else {
        // Insertar nuevo pedido
        await db.insert(pedidos).values(pedidoData)
        count++
      }
    }

    console.log(`Sincronización de pedidos completada. ${count} nuevos pedidos insertados.`)
    return count
  } catch (error) {
    console.error("Error sincronizando pedidos:", error)
    await registrarSincronizacion(
      "error",
      `Error sincronizando pedidos: ${error instanceof Error ? error.message : String(error)}`,
    )
    throw error
  }
}

async function registrarSincronizacion(estado: string, mensaje: string): Promise<number> {
  try {
    const [result] = await db
      .insert(registro_sincronizacion)
      .values({
        tipo: "completa",
        estado: estado,
        mensaje: mensaje,
        fecha: new Date(),
      })
      .returning({ id: registro_sincronizacion.id })

    return result?.id || 0
  } catch (error) {
    console.error("Error registrando sincronización:", error)
    return 0
  }
}

async function actualizarRegistroSincronizacion(
  id: number,
  estado: string,
  mensaje: string,
  duracion_ms?: number,
): Promise<void> {
  if (!id) return

  try {
    await db
      .update(registro_sincronizacion)
      .set({
        estado: estado,
        mensaje: mensaje,
        duracion_ms: duracion_ms,
        fecha_actualizacion: new Date(),
      })
      .where(eq(registro_sincronizacion.id, id))
  } catch (error) {
    console.error("Error actualizando registro de sincronización:", error)
  }
}
