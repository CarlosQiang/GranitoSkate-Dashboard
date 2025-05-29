import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    const { dashboardData } = await request.json()

    if (!dashboardData) {
      return NextResponse.json({ error: "No se proporcionaron datos para sincronizar" }, { status: 400 })
    }

    console.log("🔄 Iniciando sincronización completa con limpieza previa...")

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
      // Limpiar productos (y sus relaciones)
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

      // Limpiar tabla de relaciones productos-colecciones
      await sql`DELETE FROM productos_colecciones`
      console.log("🗑️ Limpiadas relaciones productos-colecciones")

      console.log("✅ Limpieza completada - Base de datos lista para nuevos datos")
    } catch (error) {
      console.error("❌ Error durante la limpieza:", error)
      throw new Error("Error al limpiar la base de datos antes de la sincronización")
    }

    // PASO 2: INSERTAR PRODUCTOS FRESCOS
    if (dashboardData.allProducts && Array.isArray(dashboardData.allProducts)) {
      console.log(`📦 Insertando ${dashboardData.allProducts.length} productos frescos...`)

      for (const producto of dashboardData.allProducts) {
        try {
          const shopifyId = producto.id.replace("gid://shopify/Product/", "")

          await sql`
            INSERT INTO productos (
              shopify_id, titulo, descripcion, estado, precio_base, inventario_disponible,
              tipo_producto, proveedor, imagen_destacada_url, url_handle,
              creado_en, actualizado_en
            ) VALUES (
              ${shopifyId}, 
              ${producto.title}, 
              ${producto.description || ""},
              ${producto.status},
              ${Number.parseFloat(producto.price || "0")}, 
              ${producto.inventory || 0},
              ${producto.productType || "SKATEBOARD"}, 
              ${producto.vendor || "GranitoSkate"},
              ${producto.image || null}, 
              ${producto.handle || producto.title.toLowerCase().replace(/\s+/g, "-")},
              NOW(), 
              NOW()
            )
          `
          results.productos.insertados++
        } catch (error) {
          console.error(`Error insertando producto ${producto.id}:`, error)
          results.productos.errores++
        }
      }
      console.log(`✅ Productos insertados: ${results.productos.insertados}`)
    }

    // PASO 3: INSERTAR PEDIDOS FRESCOS
    if (dashboardData.allOrders && Array.isArray(dashboardData.allOrders)) {
      console.log(`🛒 Insertando ${dashboardData.allOrders.length} pedidos frescos...`)

      for (const pedido of dashboardData.allOrders) {
        try {
          const shopifyId = pedido.id.replace("gid://shopify/Order/", "")

          await sql`
            INSERT INTO pedidos (
              shopify_id, numero_pedido, total, moneda, email_cliente,
              estado, fecha_procesado, creado_en, actualizado_en
            ) VALUES (
              ${shopifyId}, 
              ${pedido.name}, 
              ${Number.parseFloat(pedido.total || "0")},
              ${pedido.currency || "EUR"}, 
              ${pedido.customer?.email || ""},
              ${pedido.fulfillmentStatus || "PENDING"},
              ${pedido.processedAt || "NOW()"},
              NOW(), 
              NOW()
            )
          `
          results.pedidos.insertados++
        } catch (error) {
          console.error(`Error insertando pedido ${pedido.id}:`, error)
          results.pedidos.errores++
        }
      }
      console.log(`✅ Pedidos insertados: ${results.pedidos.insertados}`)
    }

    // PASO 4: INSERTAR CLIENTES FRESCOS
    if (dashboardData.allCustomers && Array.isArray(dashboardData.allCustomers)) {
      console.log(`👥 Insertando ${dashboardData.allCustomers.length} clientes frescos...`)

      for (const cliente of dashboardData.allCustomers) {
        try {
          const shopifyId = cliente.id.replace("gid://shopify/Customer/", "")
          const nombreCompleto = `${cliente.firstName || ""} ${cliente.lastName || ""}`.trim()

          await sql`
            INSERT INTO clientes (
              shopify_id, email, nombre, telefono, estado,
              total_pedidos, total_gastado, creado_en, actualizado_en
            ) VALUES (
              ${shopifyId}, 
              ${cliente.email}, 
              ${nombreCompleto},
              ${cliente.phone || null}, 
              ${cliente.state || "ENABLED"},
              ${cliente.numberOfOrders || 0},
              ${Number.parseFloat(cliente.totalSpent || "0")},
              NOW(), 
              NOW()
            )
          `
          results.clientes.insertados++
        } catch (error) {
          console.error(`Error insertando cliente ${cliente.id}:`, error)
          results.clientes.errores++
        }
      }
      console.log(`✅ Clientes insertados: ${results.clientes.insertados}`)
    }

    // PASO 5: INSERTAR COLECCIONES FRESCAS
    if (dashboardData.allCollections && Array.isArray(dashboardData.allCollections)) {
      console.log(`📚 Insertando ${dashboardData.allCollections.length} colecciones frescas...`)

      for (const coleccion of dashboardData.allCollections) {
        try {
          const shopifyId = coleccion.id.replace("gid://shopify/Collection/", "")

          await sql`
            INSERT INTO colecciones (
              shopify_id, titulo, descripcion, url_handle, imagen_url,
              productos_count, creado_en, actualizado_en
            ) VALUES (
              ${shopifyId}, 
              ${coleccion.title}, 
              ${coleccion.description || ""},
              ${coleccion.handle || coleccion.title.toLowerCase().replace(/\s+/g, "-")},
              ${coleccion.image || null},
              ${coleccion.productsCount || 0},
              NOW(), 
              NOW()
            )
          `
          results.colecciones.insertados++
        } catch (error) {
          console.error(`Error insertando colección ${coleccion.id}:`, error)
          results.colecciones.errores++
        }
      }
      console.log(`✅ Colecciones insertadas: ${results.colecciones.insertados}`)
    }

    // PASO 6: INSERTAR PROMOCIONES FRESCAS
    if (dashboardData.allPromotions && Array.isArray(dashboardData.allPromotions)) {
      console.log(`🎯 Insertando ${dashboardData.allPromotions.length} promociones frescas...`)

      for (const promocion of dashboardData.allPromotions) {
        try {
          const shopifyId = promocion.id.replace("gid://shopify/DiscountNode/", "")

          await sql`
            INSERT INTO promociones (
              shopify_id, titulo, descripcion, tipo, valor, codigo, 
              activo, fecha_inicio, fecha_fin, creado_en, actualizado_en
            ) VALUES (
              ${shopifyId}, 
              ${promocion.title}, 
              ${promocion.summary || ""},
              ${promocion.type || "PERCENTAGE"},
              ${Number.parseFloat(promocion.value || "0")},
              ${promocion.code || null},
              ${promocion.status === "ACTIVE"},
              ${promocion.startsAt || "NOW()"},
              ${promocion.endsAt || null},
              NOW(), 
              NOW()
            )
          `
          results.promociones.insertados++
        } catch (error) {
          console.error(`Error insertando promoción ${promocion.id}:`, error)
          results.promociones.errores++
        }
      }
      console.log(`✅ Promociones insertadas: ${results.promociones.insertados}`)
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
    } catch (error) {
      console.error("Error actualizando configuración de Shopify:", error)
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
    } catch (error) {
      console.error("Error actualizando configuración SEO:", error)
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
    } catch (error) {
      console.error("Error actualizando configuración de personalización:", error)
    }

    // PASO 8: REGISTRAR LA ACTIVIDAD
    await sql`
      INSERT INTO registros_actividad (
        accion, tipo_entidad, resultado, descripcion, creado_en
      ) VALUES (
        'sincronizacion_completa_con_limpieza', 'sistema', 'completado',
        'Limpieza y sincronización completa: Eliminados ' || ${results.limpieza.productos + results.limpieza.pedidos + results.limpieza.clientes + results.limpieza.colecciones + results.limpieza.promociones} || ' registros antiguos. Insertados ' || ${results.productos.insertados + results.pedidos.insertados + results.clientes.insertados + results.colecciones.insertados + results.promociones.insertados} || ' registros nuevos.',
        NOW()
      )
    `

    console.log("🎉 Sincronización completa con limpieza finalizada exitosamente")

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
      },
      { status: 500 },
    )
  }
}
