import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    const { dashboardData } = await request.json()

    if (!dashboardData) {
      return NextResponse.json({ error: "No se proporcionaron datos para sincronizar" }, { status: 400 })
    }

    console.log("🔄 Iniciando sincronización completa con limpieza previa...")
    console.log("📊 Datos recibidos:", {
      productos: dashboardData.allProducts?.length || 0,
      pedidos: dashboardData.allOrders?.length || 0,
      clientes: dashboardData.allCustomers?.length || 0,
      colecciones: dashboardData.allCollections?.length || 0,
      promociones: dashboardData.allPromotions?.length || 0,
    })

    const results = {
      limpieza: { productos: 0, pedidos: 0, clientes: 0, colecciones: 0, promociones: 0 },
      productos: { insertados: 0, actualizados: 0, errores: 0 },
      pedidos: { insertados: 0, actualizados: 0, errores: 0 },
      clientes: { insertados: 0, actualizados: 0, errores: 0 },
      colecciones: { insertados: 0, actualizados: 0, errores: 0 },
      promociones: { insertados: 0, actualizados: 0, errores: 0 },
      configuracion: { guardada: false },
      seo: { guardado: false },
      personalizacion: { guardada: false },
    }

    // PASO 1: LIMPIAR TABLAS EXISTENTES (excepto administradores)
    console.log("🧹 Limpiando datos existentes...")

    try {
      // Limpiar relaciones primero para evitar errores de foreign key
      await sql`DELETE FROM productos_colecciones`
      console.log("🗑️ Limpiadas relaciones productos-colecciones")

      // Limpiar productos
      const productosEliminados = await sql`DELETE FROM productos`
      results.limpieza.productos = productosEliminados.rowCount || 0
      console.log(`🗑️ Eliminados ${results.limpieza.productos} productos existentes`)

      // Limpiar pedidos
      const pedidosEliminados = await sql`DELETE FROM pedidos`
      results.limpieza.pedidos = pedidosEliminados.rowCount || 0
      console.log(`🗑️ Eliminados ${results.limpieza.pedidos} pedidos existentes`)

      // Limpiar clientes
      const clientesEliminados = await sql`DELETE FROM clientes`
      results.limpieza.clientes = clientesEliminados.rowCount || 0
      console.log(`🗑️ Eliminados ${results.limpieza.clientes} clientes existentes`)

      // Limpiar colecciones
      const coleccionesEliminadas = await sql`DELETE FROM colecciones`
      results.limpieza.colecciones = coleccionesEliminadas.rowCount || 0
      console.log(`🗑️ Eliminadas ${results.limpieza.colecciones} colecciones existentes`)

      // Limpiar promociones
      const promocionesEliminadas = await sql`DELETE FROM promociones`
      results.limpieza.promociones = promocionesEliminadas.rowCount || 0
      console.log(`🗑️ Eliminadas ${results.limpieza.promociones} promociones existentes`)

      console.log("✅ Limpieza completada - Base de datos lista para nuevos datos")
    } catch (error) {
      console.error("❌ Error durante la limpieza:", error)
      throw new Error("Error al limpiar la base de datos antes de la sincronización")
    }

    // PASO 2: INSERTAR PRODUCTOS FRESCOS
    if (dashboardData.allProducts && Array.isArray(dashboardData.allProducts) && dashboardData.allProducts.length > 0) {
      console.log(`📦 Insertando ${dashboardData.allProducts.length} productos frescos...`)

      for (const producto of dashboardData.allProducts) {
        try {
          // Validar que el producto tenga los datos mínimos necesarios
          if (!producto.id || !producto.title) {
            console.warn("⚠️ Producto sin ID o título, saltando:", producto)
            results.productos.errores++
            continue
          }

          const shopifyId = producto.id.replace("gid://shopify/Product/", "")

          // Preparar datos con valores por defecto seguros
          const titulo = producto.title || "Producto sin título"
          const descripcion = producto.description || ""
          const estado = producto.status || "ACTIVE"
          const precio = Number.parseFloat(producto.price || "0")
          const inventario = Number.parseInt(producto.inventory || "0")
          const tipoProducto = producto.productType || "SKATEBOARD"
          const proveedor = producto.vendor || "GranitoSkate"
          const imagen = producto.image || null
          const handle =
            producto.handle ||
            titulo
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")

          await sql`
            INSERT INTO productos (
              shopify_id, titulo, descripcion, estado, precio_base, inventario_disponible,
              tipo_producto, proveedor, imagen_destacada_url, url_handle,
              creado_en, actualizado_en
            ) VALUES (
              ${shopifyId}, ${titulo}, ${descripcion}, ${estado}, ${precio}, ${inventario},
              ${tipoProducto}, ${proveedor}, ${imagen}, ${handle},
              NOW(), NOW()
            )
          `
          results.productos.insertados++

          if (results.productos.insertados % 5 === 0) {
            console.log(`📦 Insertados ${results.productos.insertados} productos...`)
          }
        } catch (error) {
          console.error(`❌ Error insertando producto ${producto.id}:`, error)
          results.productos.errores++
        }
      }
      console.log(
        `✅ Productos completados: ${results.productos.insertados} insertados, ${results.productos.errores} errores`,
      )
    } else {
      console.log("⚠️ No hay productos para insertar")
    }

    // PASO 3: INSERTAR PEDIDOS FRESCOS
    if (dashboardData.allOrders && Array.isArray(dashboardData.allOrders) && dashboardData.allOrders.length > 0) {
      console.log(`🛒 Insertando ${dashboardData.allOrders.length} pedidos frescos...`)

      for (const pedido of dashboardData.allOrders) {
        try {
          if (!pedido.id || !pedido.name) {
            console.warn("⚠️ Pedido sin ID o nombre, saltando:", pedido)
            results.pedidos.errores++
            continue
          }

          const shopifyId = pedido.id.replace("gid://shopify/Order/", "")
          const numeroPedido = pedido.name || `#${shopifyId}`
          const total = Number.parseFloat(pedido.total || "0")
          const moneda = pedido.currency || "EUR"
          const emailCliente = pedido.customer?.email || ""
          const estado = pedido.fulfillmentStatus || "PENDING"

          await sql`
            INSERT INTO pedidos (
              shopify_id, numero_pedido, total, moneda, email_cliente,
              estado, creado_en, actualizado_en
            ) VALUES (
              ${shopifyId}, ${numeroPedido}, ${total}, ${moneda}, ${emailCliente},
              ${estado}, NOW(), NOW()
            )
          `
          results.pedidos.insertados++
        } catch (error) {
          console.error(`❌ Error insertando pedido ${pedido.id}:`, error)
          results.pedidos.errores++
        }
      }
      console.log(
        `✅ Pedidos completados: ${results.pedidos.insertados} insertados, ${results.pedidos.errores} errores`,
      )
    } else {
      console.log("⚠️ No hay pedidos para insertar")
    }

    // PASO 4: INSERTAR CLIENTES FRESCOS
    if (
      dashboardData.allCustomers &&
      Array.isArray(dashboardData.allCustomers) &&
      dashboardData.allCustomers.length > 0
    ) {
      console.log(`👥 Insertando ${dashboardData.allCustomers.length} clientes frescos...`)

      for (const cliente of dashboardData.allCustomers) {
        try {
          if (!cliente.id || !cliente.email) {
            console.warn("⚠️ Cliente sin ID o email, saltando:", cliente)
            results.clientes.errores++
            continue
          }

          const shopifyId = cliente.id.replace("gid://shopify/Customer/", "")
          const email = cliente.email
          const nombre = `${cliente.firstName || ""} ${cliente.lastName || ""}`.trim() || "Cliente sin nombre"
          const telefono = cliente.phone || null
          const estado = cliente.state || "ENABLED"
          const totalPedidos = Number.parseInt(cliente.numberOfOrders || "0")
          const totalGastado = Number.parseFloat(cliente.totalSpent || "0")

          await sql`
            INSERT INTO clientes (
              shopify_id, email, nombre, telefono, estado,
              total_pedidos, total_gastado, creado_en, actualizado_en
            ) VALUES (
              ${shopifyId}, ${email}, ${nombre}, ${telefono}, ${estado},
              ${totalPedidos}, ${totalGastado}, NOW(), NOW()
            )
          `
          results.clientes.insertados++
        } catch (error) {
          console.error(`❌ Error insertando cliente ${cliente.id}:`, error)
          results.clientes.errores++
        }
      }
      console.log(
        `✅ Clientes completados: ${results.clientes.insertados} insertados, ${results.clientes.errores} errores`,
      )
    } else {
      console.log("⚠️ No hay clientes para insertar")
    }

    // PASO 5: INSERTAR COLECCIONES FRESCAS
    if (
      dashboardData.allCollections &&
      Array.isArray(dashboardData.allCollections) &&
      dashboardData.allCollections.length > 0
    ) {
      console.log(`📚 Insertando ${dashboardData.allCollections.length} colecciones frescas...`)

      for (const coleccion of dashboardData.allCollections) {
        try {
          if (!coleccion.id || !coleccion.title) {
            console.warn("⚠️ Colección sin ID o título, saltando:", coleccion)
            results.colecciones.errores++
            continue
          }

          const shopifyId = coleccion.id.replace("gid://shopify/Collection/", "")
          const titulo = coleccion.title
          const descripcion = coleccion.description || ""
          const handle =
            coleccion.handle ||
            titulo
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")
          const imagen = coleccion.image || null
          const productosCount = Number.parseInt(coleccion.productsCount || "0")

          await sql`
            INSERT INTO colecciones (
              shopify_id, titulo, descripcion, url_handle, imagen_url,
              productos_count, creado_en, actualizado_en
            ) VALUES (
              ${shopifyId}, ${titulo}, ${descripcion}, ${handle}, ${imagen},
              ${productosCount}, NOW(), NOW()
            )
          `
          results.colecciones.insertados++
        } catch (error) {
          console.error(`❌ Error insertando colección ${coleccion.id}:`, error)
          results.colecciones.errores++
        }
      }
      console.log(
        `✅ Colecciones completadas: ${results.colecciones.insertados} insertados, ${results.colecciones.errores} errores`,
      )
    } else {
      console.log("⚠️ No hay colecciones para insertar")
    }

    // PASO 6: INSERTAR PROMOCIONES FRESCAS
    if (
      dashboardData.allPromotions &&
      Array.isArray(dashboardData.allPromotions) &&
      dashboardData.allPromotions.length > 0
    ) {
      console.log(`🎯 Insertando ${dashboardData.allPromotions.length} promociones frescas...`)

      for (const promocion of dashboardData.allPromotions) {
        try {
          if (!promocion.id || !promocion.title) {
            console.warn("⚠️ Promoción sin ID o título, saltando:", promocion)
            results.promociones.errores++
            continue
          }

          const shopifyId = promocion.id.replace("gid://shopify/DiscountNode/", "")
          const titulo = promocion.title
          const descripcion = promocion.summary || ""
          const tipo = promocion.type || "PERCENTAGE"
          const valor = Number.parseFloat(promocion.value || "0")
          const codigo = promocion.code || null
          const activo = promocion.status === "ACTIVE"

          await sql`
            INSERT INTO promociones (
              shopify_id, titulo, descripcion, tipo, valor, codigo, 
              activo, creado_en, actualizado_en
            ) VALUES (
              ${shopifyId}, ${titulo}, ${descripcion}, ${tipo}, ${valor}, ${codigo},
              ${activo}, NOW(), NOW()
            )
          `
          results.promociones.insertados++
        } catch (error) {
          console.error(`❌ Error insertando promoción ${promocion.id}:`, error)
          results.promociones.errores++
        }
      }
      console.log(
        `✅ Promociones completadas: ${results.promociones.insertados} insertados, ${results.promociones.errores} errores`,
      )
    } else {
      console.log("⚠️ No hay promociones para insertar")
    }

    // PASO 7: ACTUALIZAR CONFIGURACIONES (sin limpiar)
    try {
      console.log("⚙️ Actualizando configuración de Shopify...")

      const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN
      const hasToken = !!process.env.SHOPIFY_ACCESS_TOKEN

      await sql`
        INSERT INTO configuracion_shopify (
          dominio_tienda, token_configurado, activa, creado_en, actualizado_en
        ) VALUES (
          ${shopDomain || "no-configurado"}, ${hasToken}, ${hasToken},
          NOW(), NOW()
        )
        ON CONFLICT (dominio_tienda) 
        DO UPDATE SET 
          token_configurado = ${hasToken},
          activa = ${hasToken},
          actualizado_en = NOW()
      `

      results.configuracion.guardada = true
      console.log("✅ Configuración de Shopify guardada")
    } catch (error) {
      console.error("❌ Error actualizando configuración de Shopify:", error)
    }

    try {
      console.log("🔍 Actualizando configuración SEO...")

      await sql`
        INSERT INTO metadatos_seo (
          tipo_entidad, titulo, descripcion, palabras_clave,
          creado_en, actualizado_en
        ) VALUES (
          'tienda', 'GranitoSkate - Tienda de Skate Online',
          'Tienda especializada en productos de skate. Encuentra tablas, ruedas, trucks y accesorios.',
          'skate,skateboard,tienda,online,granito',
          NOW(), NOW()
        )
        ON CONFLICT (tipo_entidad) 
        DO UPDATE SET 
          actualizado_en = NOW()
      `

      results.seo.guardado = true
      console.log("✅ Configuración SEO guardada")
    } catch (error) {
      console.error("❌ Error actualizando configuración SEO:", error)
    }

    try {
      console.log("🎨 Actualizando configuración de personalización...")

      await sql`
        INSERT INTO theme_configs (
          shop_id, config_name, primary_color, secondary_color, accent_color,
          font_family, enable_dark_mode, shop_name, created_at, updated_at
        ) VALUES (
          'granito-skate', 'default', '#D4A574', '#8B4513', '#FF6B35',
          'Inter', true, 'GranitoSkate', NOW(), NOW()
        )
        ON CONFLICT (shop_id, config_name) 
        DO UPDATE SET 
          updated_at = NOW()
      `

      results.personalizacion.guardada = true
      console.log("✅ Configuración de personalización guardada")
    } catch (error) {
      console.error("❌ Error actualizando configuración de personalización:", error)
    }

    // PASO 8: REGISTRAR LA ACTIVIDAD
    const totalEliminados =
      results.limpieza.productos +
      results.limpieza.pedidos +
      results.limpieza.clientes +
      results.limpieza.colecciones +
      results.limpieza.promociones
    const totalInsertados =
      results.productos.insertados +
      results.pedidos.insertados +
      results.clientes.insertados +
      results.colecciones.insertados +
      results.promociones.insertados

    await sql`
      INSERT INTO registros_actividad (
        accion, tipo_entidad, resultado, descripcion, creado_en
      ) VALUES (
        'sincronizacion_completa_con_limpieza', 'sistema', 'completado',
        'Limpieza y sincronización completa: Eliminados ' || ${totalEliminados} || ' registros antiguos. Insertados ' || ${totalInsertados} || ' registros nuevos.',
        NOW()
      )
    `

    console.log("🎉 Sincronización completa con limpieza finalizada exitosamente")
    console.log(`📊 Resumen final: ${totalEliminados} eliminados, ${totalInsertados} insertados`)

    return NextResponse.json({
      success: true,
      message: "Sincronización completa con limpieza exitosa - Base de datos actualizada con datos frescos de Shopify",
      results,
    })
  } catch (error) {
    console.error("❌ Error en sincronización completa:", error)

    return NextResponse.json(
      {
        error: "Error en la sincronización completa",
        message: error instanceof Error ? error.message : "Error desconocido",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
